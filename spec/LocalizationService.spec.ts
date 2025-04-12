// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpApplication, I18nLocalizationService} from '@centroidjs/web/platform-server';

describe('HttpApplication', () => {

    it('should create instance', () => {
        const app = new HttpApplication();
        const service = new I18nLocalizationService(app);
        expect(service).toBeTruthy()
    });

    it('should LocalizationService.set()', () => {
        const app = new HttpApplication();
        app.configuration.instant.settings = {
            i18n: {
                staticCatalog: {
                    en: {
                    },
                    fr: {
                    }
                }
            }
        }
        const service = new I18nLocalizationService(app);
        service.set('en', {
            'HelloMessage': 'Hello World'
        });
        service.set('fr', {
            'HelloMessage': 'Bonjour le monde'
        });
        expect(service.get('en', 'HelloMessage')).toBe('Hello World');
        expect(service.get('fr', 'HelloMessage')).toBe('Bonjour le monde');
    });
});
