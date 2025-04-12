// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpContextBase} from '@centroidjs/web';
export abstract class HttpResult {

    public contentType = 'text/html';
    public contentEncoding = 'utf8';
    public status: number;

    abstract execute(context: HttpContextBase): Promise<unknown>;

}
