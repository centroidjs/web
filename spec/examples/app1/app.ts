import * as express from 'express';
import { HttpApplication, controllerRouter } from '@centroidjs/web/platform-server';
import { HelloController } from './controllers/HelloController';
import { RouterService } from '@centroidjs/web/router';

const container = express();
const app = new HttpApplication();

app.getService(RouterService).add({
    path: '/hello',
    controller: HelloController,
    action: 'index',
});

container.use('/', app.middleware(container));
container.use(controllerRouter(app));

export {
    container
};


