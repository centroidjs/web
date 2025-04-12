// MOST Web Framework Codename ZeroGravity, copyright 2017-2025 THEMOST LP all rights reserved
import {HttpApplicationBase} from '@centroidjs/web';
import { RouterService } from '@centroidjs/web/router';
import { Application, ApplicationConfiguration, ApplicationConfigurationBase } from '@centroidjs/core';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'connect';
import { HttpContext } from './HttpContext';
import { HttpController } from './HttpController';
import { HttpControllerAnnotation } from './HttpDecorators';

class HttpApplication extends Application implements HttpApplicationBase {
    
    protected controllers: Map<string, new() => HttpController> = new Map<string, new() => HttpController>();

    constructor(configuration?: ApplicationConfiguration) {
        super(configuration || new ApplicationConfiguration({}));
        // use router service
        this.useService(RouterService);
    }
    getConfiguration(): ApplicationConfigurationBase {
        return this.configuration;
    }
    
    createContext(req: Request, res: Response) {
        const context = new HttpContext(this);
        context.request = req;
        context.response = res;
        return context;
    }

    middleware() {
        // return request handler
        return (req: Request, res: Response, next: NextFunction) => {
            // create context
            const context = this.createContext(req, res);
            // set context
            Object.defineProperty(req, 'context', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: context
            });
            req.on('end', () => {
                //on end
                if (req.context) {
                    //finalize data context
                    return req.context.finalize(() => {
                    //
                    });
                }
            });
            return next();
        };
    }

    use(controllerConstructor: new() => HttpController) {
        const Controller = controllerConstructor as unknown;
        const annotation = Controller as HttpControllerAnnotation;
        this.controllers.set(annotation.httpController.name, controllerConstructor);
    }

}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            context: HttpContext;
        }
    }
}

export { HttpApplication };

