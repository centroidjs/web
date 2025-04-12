// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { HttpResult } from './HttpResult';
import { HttpContextBase } from '@centroidjs/web';

export class HttpNextResult extends HttpResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(context: HttpContextBase): Promise<void> {
        // do nothing
        return;
    }

}
