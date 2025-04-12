// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {LangUtils, HttpBadRequestError, HttpUnauthorizedError} from '@themost/common';
import {HttpConsumer} from './HttpConsumer';
import {DataTypeValidator, MinLengthValidator, MaxLengthValidator,
MinValueValidator, MaxValueValidator, RequiredValidator, PatternValidator } from '@themost/data';
import {HttpContextBase} from '@centroidjs/web';
import {HttpRouteConfig} from '@centroidjs/web/router';

class DecoratorError extends Error {
    constructor(msg?: string) {
        super(msg || 'Decorator is not valid on this declaration type.');
    }
}

declare interface HttpControllerAnnotation {
    httpController: { name: string };
}

function httpController(name: string): ClassDecorator {
    return (target: unknown) => {
        if (typeof target !== 'function') { throw new DecoratorError() };
        // define controller name
        Object.defineProperty(target, 'httpController', {
            value: {
                name
            },
            configurable: false,
            enumerable: true,
            writable: true
        });
    }
}

declare interface HttpControllerMethodDeclaration {
    httpGet?: boolean;
    httpPost?: boolean;
    httpPut?: boolean;
    httpPatch?: boolean;
    httpDelete?: boolean;
    httpHead?: boolean;
    httpOptions?: boolean;
}

declare interface HttpControllerMethodAnnotation extends HttpControllerMethodDeclaration {
    httpAction?: string;
    httpParams?: Record<string, HttpParamAttributeOptions>;
    httpParamAlias?: Record<string, string>;
    authorize?: HttpConsumer;
    httpRoute?: HttpRouteConfig;
    httpRouteIndex?: number;
}

declare interface HttpParamAttributeOptions {
    name: string;
    type?: string;
    pattern?: RegExp|string;
    minValue?: number | Date;
    maxValue?: number | Date;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    message?: string;
}

function httpMethod(method: HttpControllerMethodDeclaration,
    extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value === 'function') {
            Object.assign(descriptor.value, method);
            if (extras) {
                httpAction(extras.name)(target, key, descriptor);
                if (Array.isArray(extras.params)) {
                    for (const param of extras.params) {
                        httpParam(param)
                    }
                }
            }
        }
        return descriptor;
    }
}

function httpGet(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpGet: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function httpAny(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value === 'function') {
            descriptor.value.httpGet = true;
            descriptor.value.httpPost = true;
            descriptor.value.httpPut = true;
            descriptor.value.httpDelete = true;
            descriptor.value.httpOptions = true;
            descriptor.value.httpHead = true;
            descriptor.value.httPatch = true;
        }
        return descriptor;
    }
}

function httpPost(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpPost: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpPatch(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpPatch: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpPut(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpPut: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpDelete(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpDelete: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpOptions(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpOptions: true
    }, extras);
}

function httpHead(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpHead: true
    }, extras);
}

function httpAction(name: string) {
    if (typeof name !== 'string') {
        throw new TypeError('Action name must be a string');
    }
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        descriptor.value.httpAction = name;
        return descriptor;
    }
}

function httpParamAlias(name: string, alias: string) {
    if (typeof name !== 'string') {
        throw new TypeError('Parameter name must be a string');
    }
    if (typeof alias !== 'string') {
        throw new TypeError('Parameter alias must be a string');
    }
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        descriptor.value.httpParamAlias = descriptor.value.httpParamAlias || { };
        descriptor.value.httpParamAlias[name] = alias;
        return descriptor;
    }
}

function httpParam(options: HttpParamAttributeOptions) {
    if (typeof options !== 'object') { throw new TypeError('Parameter options must be an object'); }
    if (typeof options.name !== 'string') { throw new TypeError('Parameter name must be a string'); }
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }

        descriptor.value.httpParams = descriptor.value.httpParams || { };
        descriptor.value.httpParams[options.name] = Object.assign({'type':'Text'}, options);
        if (typeof descriptor.value.httpParam === 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            descriptor.value.httpParam = new HttpConsumer( (context: any) => {
                const httpParamValidationFailedCallback = (thisContext: HttpContextBase, thisParam: HttpParamAttributeOptions, validationResult: { message: string, innerMessage?: string }) => {
                    return Promise.reject(new HttpBadRequestError('Bad request parameter', thisParam.message || validationResult.message));
                };
                const methodParams = LangUtils.getFunctionParams(descriptor.value);
                const httpParams = descriptor.value.httpParams;
                if (methodParams.length>0) {
                    let k = 0
                    let httpParamItem;
                    let validator;
                    let validationResult;
                    let functionParam;
                    let contextParam;
                    while (k < methodParams.length) {
                        functionParam = methodParams[k];
                        if (typeof context.getParam === 'function') {
                            contextParam = context.getParam(functionParam);
                        }
                        else {
                            contextParam = context.params[functionParam];
                        }
                        if (httpParams) {
                            httpParamItem = httpParams[functionParam];
                            if (httpParamItem) {
                                if (typeof httpParamItem.type === 'string') {
                                    // validate type
                                    validator = new DataTypeValidator(httpParamItem.type);
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }
                                if (httpParamItem.pattern instanceof RegExp) {
                                    // validate pattern
                                    validator = new PatternValidator(httpParamItem.pattern);
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }
                                if (typeof httpParamItem.minLength === 'number') {
                                    // validate min length
                                    validator = new MinLengthValidator(httpParamItem.minLength);
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }
                                if (typeof httpParamItem.maxLength === 'number') {
                                    // validate max length
                                    validator = new MaxLengthValidator(httpParamItem.maxLength);
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }
                                if (typeof httpParamItem.minValue !== 'undefined') {
                                    // validate min value
                                    validator = new MinValueValidator(httpParamItem.minValue);
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }
                                if (typeof httpParamItem.maxValue !== 'undefined') {
                                    // validate max value
                                    validator = new MaxValueValidator(httpParamItem.required);
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }

                                if ((typeof httpParamItem.required !== 'undefined') && (httpParamItem.required === true)) {
                                    // validate required value
                                    validator = new RequiredValidator();
                                    validator.setContext(context);
                                    validationResult = validator.validateSync(contextParam);
                                    if (validationResult) {
                                        return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                    }
                                }
                            }
                        }
                        k += 1;
                    }
                }
                return Promise.resolve();
            });
        }
        return descriptor;
    }
}

function httpAuthorize(value?: boolean) {
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        let authorize = true;
        if (typeof value === 'boolean') {
            authorize = value;
        }
        if (authorize) {
            descriptor.value.authorize = new HttpConsumer( (context: HttpContextBase) => {
                if (context.user && context.user.name !== 'anonymous') {
                    return Promise.resolve();
                }
                return Promise.reject(new HttpUnauthorizedError());
            });
        }
        return descriptor;
    };
}

function httpActionConsumer(name: string, consumer: (this: HttpContextBase,...args: unknown[]) => Promise<unknown>) {
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        if (consumer instanceof HttpConsumer) {
            // set consumer
            descriptor.value[name] = consumer;
            // and exit
            return descriptor;
        }
        // validate consumer function
        if (typeof consumer !== 'function') {
            throw new Error('Consumer may be a function.');
        }
        descriptor.value[name] = new HttpConsumer(consumer);
        return descriptor;
    };
}

/**
 * Defines an http route that is going to be registered by an http controller
 */
function httpRoute(url: string, index?: number) {
    return (target: { name: string, httpControllerName: string }, key: string, descriptor: PropertyDescriptor) => {
        if (typeof descriptor.value === 'function') {
            Object.defineProperty(descriptor.value, 'httpRoute', {
                get () {
                    const route: HttpRouteConfig = {
                        path: url,
                        controller: target.httpControllerName || target.name,
                        action: descriptor.value.httpAction
                    };
                    if (descriptor.value.hasOwnProperty('httpAny') === false) {
                        // set httpHead if does not exists
                        if (descriptor.value.hasOwnProperty('httpHead') === false) {
                            descriptor.value.httpHead = true;
                        }
                        // set httpOptions if does not exists
                        if (descriptor.value.hasOwnProperty('httpOptions') === false) {
                            descriptor.value.httpOptions = true;
                        }
                        // enumerate http methods and format allow attribute
                        const allowString = [
                            'httpGet',
                            'httpHead',
                            'httpOptions',
                            'httpPost',
                            'httpPut',
                            'httpDelete',
                            'httpPatch' ].filter( (httpKey) => {
                            return descriptor.value.hasOwnProperty(httpKey) && descriptor.value[httpKey];
                        }).map((httpKey) => {
                            return httpKey.replace(/^http/,'').toUpperCase();
                        }).join(',');
                        // set allow attribute
                        Object.assign(route, {
                            allow: allowString
                        });
                    }
                    return route;
                },
                configurable: false,
                enumerable: true
            });
            // set route index
            Object.defineProperty(descriptor.value, 'httpRouteIndex', {
                value: index || 0
            });
        }
        return descriptor;
    }
}

export {
    DecoratorError,
    HttpControllerAnnotation,
    HttpControllerMethodAnnotation,
    httpGet,
    httpAny,
    httpPost,
    httpPut,
    httpPatch,
    httpDelete,
    httpOptions,
    httpHead,
    httpAction,
    httpRoute,
    httpController,
    httpParamAlias,
    httpParam,
    httpAuthorize,
    httpActionConsumer
}
