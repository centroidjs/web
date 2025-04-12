// MOST Web Framework Codename ZeroGravity, copyright 2017-2025 THEMOST LP all rights reserved

const HTTP_ROUTE_PATTERNS: [string, () => string][] = [
    ['int', () => {
        return '^[1-9]([0-9]*)$';
    }],
    ['boolean', () => {
        return '^true|false$';
    }],
    ['decimal', () => {
        return '^[+-]?[0-9]*\\.?[0-9]*$';
    }],
    ['float', () => {
        return '^[+-]?[0-9]*\\.?[0-9]*$';
    }],
    ['guid', () => {
        return '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$';
    }],
    ['string', () => {
        return '^\'(.*)\'$';
    }],
    ['date', () => {
        return '^(datetime)?\'\\d{4}-([0]\\d|1[0-2])-([0-2]\\d|3[01])(?:[T ](\\d+):(\\d+)(?::(\\d+)(?:\\.(\\d+))?)?)?(?:Z(-?\\d*))?([+-](\\d+):(\\d+))?\'$';
    }]
];

/**
 * Represents a parameter in an HTTP route.
 * 
 * @interface HttpRouteParameter
 * 
 * @property {string} name - The name of the parameter.
 * @property {RegExp} [pattern] - An optional regular expression pattern that the parameter value must match.
 * @property {unknown} [parser] - An optional parser function to process the parameter value.
 * @property {unknown} [value] - An optional value for the parameter.
 */
declare interface HttpRouteParameter {
    name: string;
    pattern?: RegExp;
    parser?: unknown;
    value?: unknown;
}

/**
 * Configuration interface for defining an HTTP route.
 * 
 * @interface HttpRouteConfig
 * 
 * @property {string} path - The URL path for the route.
 * @property {number} [index] - Optional index to specify the order of the route.
 * @property {unknown} [controller] - Optional controller associated with the route.
 * @property {string} [action] - Optional action to be performed for the route.
 */
declare interface HttpRouteConfig {
    path: string;
    index?: number;
    controller?: unknown;
    action?: string;
}

const HTTP_ROUTE_PARSERS: [string, (value: unknown) => unknown][] = [
    ['int', (value: unknown) => {
        return parseInt(value as string, 10);
    }],
    ['boolean', (value: unknown) => {
        return /^true$/ig.test(value as string);
    }],
    ['decimal', (value: unknown) => {
        return parseFloat(value as string);
    }],
    ['float', (value: unknown) => {
        return parseFloat(value as string);
    }],
    ['string', (value: string) => {
        return value.replace(/^'/,'').replace(/'$/,'');
    }],
    ['date', (value: string) => {
        return new Date(Date.parse(value.replace(/^(datetime)?'/,'').replace(/'$/,'')));
    }]

];

/**
 * Represents an HTTP route configuration and matching logic.
 */
class HttpRoute {

    /**
     * Parameters extracted from the matched route.
     */
    public params: Record<string, unknown> = {};

    /**
     * A map of route patterns to their corresponding string representations.
     */
    protected routePatterns = new Map<string, () => string>(HTTP_ROUTE_PATTERNS);

    /**
     * A map of route parsers to their corresponding parsing functions.
     */
    protected routeParsers = new Map<string, (value: unknown) => unknown>(HTTP_ROUTE_PARSERS);

    /**
     * Initializes a new instance of the `HttpRoute` class.
     *
     * @param routeConfig - The configuration for the route.
     */
    constructor(public routeConfig?: HttpRouteConfig) {}

    /**
     * Checks if the given URL matches the route configuration.
     *
     * @param urlToMatch - The URL to match against the route configuration.
     * @returns `true` if the URL matches the route configuration, otherwise `false`.
     * @throws {Error} If the route configuration is null.
     *
     * The method performs the following steps:
     * 1. Validates the input URL and route configuration.
     * 2. Extracts the path from the URL, ignoring query parameters.
     * 3. Parses the route configuration to identify route parameters and their patterns.
     * 4. Constructs a regular expression to match the URL against the route configuration.
     * 5. Validates the URL against the constructed regular expression and route parameter patterns.
     * 6. Decodes and assigns matched route parameters to the `params` property.
     * 7. Sets the `controller` and `action` properties in `params` if defined in the route configuration.
     */
    isMatch(urlToMatch: string) {
        if (this.routeConfig == null) {
            throw new Error('Route may not be null');
        }
        if (typeof urlToMatch !== 'string')
            return false;
        if (urlToMatch.length === 0)
            return false;
        let str1 = urlToMatch
        let patternMatch;
        let parser;
        const k = urlToMatch.indexOf('?');
        if (k >= 0) {
            str1 = urlToMatch.substr(0, k);
        }
        const re = /({([\w[\]]+)(?::\s*((?:[^{}\\]+|\\.|{(?:[^{}\\]+|\\.)*})+))?})|((:)([\w[\]]+))/ig;
        let match = re.exec(this.routeConfig.path);
        const routeParams: HttpRouteParameter[] = [];
        while(match) {
            if (typeof match[2] === 'undefined') {
                // parameter with colon (e.g. :id)
                routeParams.push({
                    name: match[6]
                });
            }
            else if (typeof match[3] !== 'undefined') {
                // common expressions
                patternMatch = match[3];
                parser = null;
                if (this.routePatterns.has(match[3])) {
                    patternMatch = this.routePatterns.get(match[3])();
                    if (this.routeParsers.has(match[3])) {
                        parser = this.routeParsers.get(match[3]);
                    }
                }
                routeParams.push({
                    name: match[2],
                    pattern: new RegExp(patternMatch, 'ig'),
                    parser
                });
            }
            else {
                routeParams.push({
                    name: match[2]
                });
            }
            match = re.exec(this.routeConfig.path);
        }
        const str = this.routeConfig.path.replace(re, '([\\$_\\-.:\',+=%0-9\\w-]+)');
        const matcher = new RegExp('^' + str + '$', 'ig');
        match = matcher.exec(str1);
        if (typeof match === 'undefined' || match === null) {
            return false;
        }
        let decodedMatch;
        for (let i = 0; i < routeParams.length; i++) {
            const param = routeParams[i];
            if (typeof param.pattern !== 'undefined') {
                if (!param.pattern.test(match[i+1])) {
                    return false;
                }
            }
            decodedMatch = decodeURIComponent(match[i+1]);
            if (typeof param.parser === 'function') {
                param.value = param.parser((match[i+1] !== decodedMatch) ? decodedMatch : match[i+1]);
            }
            else {
                param.value = (match[i+1] !== decodedMatch) ? decodedMatch : match[i+1];
            }

        }
        // set route data
        routeParams.forEach((x) => {
            Object.defineProperty(this.params, x.name, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: x.value
            });
        });
        // set controller
        if (Object.prototype.hasOwnProperty.call(this.routeConfig, 'controller')) {
            Object.defineProperty(this.params, 'controller', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: this.routeConfig.controller
            });
        }
        // set action
        if (Object.prototype.hasOwnProperty.call(this.routeConfig, 'action')) {
            Object.defineProperty(this.params, 'action', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: this.routeConfig.action
            });
        }
        return true;
    }

}

export {
    HTTP_ROUTE_PATTERNS,
    HTTP_ROUTE_PARSERS,
    HttpRoute,
    HttpRouteConfig,
    HttpRouteParameter
}