// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { LocalizationService } from '@centroidjs/web';
import { ApplicationBase } from '@centroidjs/core';
import {I18n, ConfigurationOptions} from 'i18n';
import * as path from 'path';
import merge from 'lodash/merge';
import assign from 'lodash/assign';

export class I18nLocalizationService extends LocalizationService {
    public locales: string[] = [ 'en' ];
    public defaultLocale = 'en';
    private _i18n: I18n;

    constructor(app: ApplicationBase) {
        super(app);
        // get app configuration options
        const options = app.configuration.instant.settings?.i18n as ConfigurationOptions;
        const finalOptions = Object.assign({
            locales: [ 'en' ],
            defaultLocale: 'en',
            directory: path.resolve(process.cwd(),'i18n'),
            autoReload: false,
            updateFiles: false,
            syncFiles: false,
            objectNotation: true
        }, options );
        // set default locale
        this.locales = finalOptions.locales;
        this.defaultLocale = finalOptions.defaultLocale;
        // initialize i18n
        this._i18n = new I18n();
        // and configure
        this._i18n.configure(finalOptions);
    }

    public get(locale: string, key: string, replace?: Record<string, string>): string {
        return this._i18n.__({
                phrase: key,
                locale
            }, replace);
        };
    public set(locale: string, data: Record<string, unknown>, shouldMerge?: boolean): this {
        // get catalog
        let catalog = this._i18n.getCatalog(locale);
        if (!catalog) {
            this._i18n.addLocale(locale);
            catalog = this._i18n.getCatalog(locale);
        }
        // if data should be merged
        if (typeof shouldMerge === 'undefined' || shouldMerge) {
            merge(catalog, data);
        }
        else {
            assign(catalog, data);
        }
        return this;
    }


}
