// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { ApplicationService } from '@centroidjs/core';
import {HttpRoute, HttpRouteConfig} from './HttpRoute';

class RouterService extends ApplicationService {
    public readonly routes: HttpRouteConfig[] = [];
    
    /**
     * Appends a route to routes collection
     * @param item
     */
    add(item: HttpRouteConfig): this {
        this.routes.push(item);
        return this;
    }

    /**
     * Adds a collection of routes
     * @param item
     */
    addRange(...item: HttpRouteConfig[]): this {
        this.routes.push(...item);
        return this;
    }

    /**
     * Parses the given URL and attempts to match it against the available routes.
     *
     * @param url - The URL to be parsed and matched against the routes.
     * @param startIndex - The index from which to start the route matching process. Defaults to 0.
     * @returns An instance of `HttpRoute` if a matching route is found, otherwise `undefined`.
     */
    parseUrl(url: string, startIndex = 0): HttpRoute {
        const route = new HttpRoute();
        for(let i = startIndex; i < this.routes.length; i++) {
            // validate route
            route.routeConfig = this.routes[i];
            // if route is match
            if (route.isMatch(url)) {
                // return it
                return route;
            }
        }
        return;
    }

}

export {
    RouterService
};
