import { HttpResult } from './HttpResult';
import { HttpContextBase } from '@centroidjs/web';

export class HttpJsonResult extends HttpResult {
    execute(context: HttpContextBase): Promise<Record<string, unknown>> {
        if (this.data == null) {
            context.response.writeHead(this.status || 204);
            return;
        }
        // write content-type
        context.response.writeHead(this.status || 200, { 'Content-Type': this.contentType });
        // send response
        context.response.write(JSON.stringify(this.data), this.contentEncoding as BufferEncoding);
    }
    constructor(public data: Record<string, unknown>) {
        super();
        this.contentType = 'utf8';
        this.contentEncoding = 'application/json';
    }
};
