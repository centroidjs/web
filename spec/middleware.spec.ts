// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {controllerRouter, HttpApplication, HttpContext} from '@centroidjs/web/platform-server';
import request from 'supertest';
import express from 'express';
import { RouterService } from '@centroidjs/web/router';
import { HelloController } from './examples/app1/controllers/HelloController';

describe('HttpApplication', () => {

    it('should use middleware', async () => {
        const app = new HttpApplication();
        app.use(HelloController);
        expect(app).toBeTruthy();
        const container = express();
        container.use(app.middleware());
        container.get('/hello', (req, res) => {
            expect(req.context).toBeInstanceOf(HttpContext);
            return res.json({
               message: 'Hello World'
            });
        });
        const response = await request(container).get('/hello');
        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    it('should use router', async () => {
        const app = new HttpApplication();
        app.useService(RouterService);
        app.getService(RouterService).add({
            path: '/hello/:action',
            controller: HelloController
        });
        const container = express();
        container.use(app.middleware());
        container.use(controllerRouter());
        const response = await request(container).get('/hello/index');
        expect(response.status).toBe(200);
        expect(response.text).toBeTruthy();
    });

});
