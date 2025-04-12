// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { ApplicationService, ApplicationBase } from '@centroidjs/core';

export abstract class LocalizationService extends ApplicationService {
    public abstract locales: string[];
    public abstract defaultLocale: string;
    protected constructor(app: ApplicationBase) {
        super(app);
    }
    public abstract get(locale: string, key: string, replace?: unknown): string;
    public abstract set(locale: string, data: unknown, shouldMerge?: boolean): this;
}
