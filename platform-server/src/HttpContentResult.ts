// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpContextBase} from '@centroidjs/web';
import { HttpResult } from './HttpResult';
import { PassThrough, Stream } from 'stream';

function bufferToStream(input: Buffer | Stream) {
    if (input instanceof Stream) {
        return input;
    }
    const stream = new PassThrough();
    stream.push(input);
    stream.push(null);
    return stream;
}

export class HttpContentResult extends HttpResult {

    public contentType = 'text/html';
    public contentEncoding = 'utf8';

    constructor(public content: Buffer | Stream | string) {
        super();
    }

    async execute(context: HttpContextBase): Promise<void> {
        if (this.content == null) {
            context.response.writeHead(this.status || 204);
            return;
        }
        // write content-type
        context.response.writeHead(this.status || 200, { 'Content-Type': this.contentType });
        if (this.contentEncoding === 'binary') {
            return await new Promise<void>((resolve, reject) => {
                const buffer = typeof this.content === 'string' ? Buffer.from(this.content) : this.content;
                const source = bufferToStream(buffer);
                source.on('end', () => {
                    return resolve();
                });
                source.on('error', (err) => {
                    return reject(err);
                });
                return source.pipe(context.response);
            });
        }
        // send response
        context.response.write(this.content, this.contentEncoding as BufferEncoding);
    }

}
