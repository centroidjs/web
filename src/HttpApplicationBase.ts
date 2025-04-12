// MOST Web Framework Codename ZeroGravity, copyright 2017-2025 THEMOST LP all rights reserved
import { ApplicationConfigurationBase, ApplicationBase } from '@centroidjs/core';
import { IncomingMessage, ServerResponse } from 'http';

export declare interface HttpApplicationBase extends ApplicationBase {

    readonly configuration: ApplicationConfigurationBase;
    getConfiguration(): ApplicationConfigurationBase;
    
}

/**
 * Represents an authenticated user with various authentication details.
 */
export declare interface AuthenticatedUser {
    /**
     * Gets or sets a string which represents the name of the user.
     */
    name?: string;
    
    /**
     * Gets or sets a string which represents the current authentication type (e.g., Basic, Bearer, None, etc.).
     */
    authenticationType?: string;
    
    /**
     * Gets or sets a string which represents a token associated with this user.
     */
    authenticationToken?: string;
    
    /**
     * Gets or sets a scope if the current authentication type is associated with scopes like OAuth2 authentication.
     */
    authenticationScope?: string;
    
    /**
     * Gets or sets a key returned by the authentication provider that identifies this user (e.g., the ID of the user).
     */
    authenticationProviderKey?: unknown;
}


export declare interface HttpContextBase {

    request: IncomingMessage;
    response: ServerResponse;
    readonly application: HttpApplicationBase;
    locale: string;
    translate(key: string): string;
    user?: AuthenticatedUser;
    interactiveUser?: AuthenticatedUser;

}

declare module 'http' {
    interface IncomingMessage {
        locale: string;
    }
}