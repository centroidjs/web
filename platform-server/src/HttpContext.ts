// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { enumerable  } from '@centroidjs/core';
import { DefaultDataContext } from '@themost/data';
import { HttpContextBase, HttpApplicationBase, LocalizationService } from '@centroidjs/web';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Represents the HTTP context for a request/response cycle.
 * Extends the DefaultDataContext and implements HttpContextBase.
 * 
 * @remarks
 * This class provides access to the request and response objects,
 * as well as application-specific services and localization.
 * 
 * @public
 */
export class HttpContext extends DefaultDataContext implements HttpContextBase {
    request: IncomingMessage;
    response: ServerResponse;
    private _locale: string;
    private _application: HttpApplicationBase;
    
    constructor(application: HttpApplicationBase) {
        // call super constructor
        super();
        // set application
        Object.defineProperty(this, '_application', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: application
        });
    }

    @enumerable(false)
    get application(): HttpApplicationBase {
        return this._application;
    }

    public getApplication(): HttpApplicationBase {
        return this._application;
    }

    /**
     * Gets the locale for the current HTTP context.
     * 
     * The locale is determined in the following order:
     * 1. If a locale has been explicitly set (`_locale`), it is returned.
     * 2. If the request contains a locale, it is returned.
     * 3. If the request headers contain an 'accept-language' header, the first language in the list is returned.
     * 4. If none of the above are available, the default locale from the `LocalizationService` is returned.
     * 
     * @returns {string} The locale string.
     */
    public get locale(): string {
        if (this._locale) {
            return this._locale;
        }
        if (this.request.locale) {
             return this.request.locale;
        }
        const acceptLanguage = this.request.headers['accept-language'];
        if (acceptLanguage && acceptLanguage.length) {
            return acceptLanguage[0];
        }
        // get default locale
        const service = this.application.getService(LocalizationService);
        if (service != null) {
            return service.defaultLocale;
        }
    }

    public set locale(value: string) {
        this._locale = value;
    }

    translate(key: string, replace?: unknown): string {
        const service = this.application.getService(LocalizationService);
        if (service == null) {
            return key;
        }
        return service.get(this.locale, key, replace);
    }


}
