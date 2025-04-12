// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpContextBase} from '@centroidjs/web';

export class HttpConsumer {
    constructor(public callable: (...args: unknown[]) => Promise<unknown>) {
        //
    }

    /**
     * Executes a callable against a given context
     * @param {HttpContextBase} context
     * @param {...*} args
     */
    run(context: HttpContextBase, ...args: unknown[]): Promise<unknown> {
        return this.callable.apply(context, args);
    }
}
