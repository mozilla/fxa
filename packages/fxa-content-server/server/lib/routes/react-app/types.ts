/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TS setup for anything outside of `app/` is complex. This file defines types we
// import for JSDoc instead.

import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { RouteDefinition } from 'fxa-shared/express/routing';

export interface ReactRouteGroup {
  featureFlagOn: boolean;
  routes: {
    name: string;
    // only server-side react route groups contain the route definition
    definition?: RouteDefinition;
  }[];
  fullProdRollout: boolean;
}

export interface GetRouteDefinition {
  (routes: string[]): RouteDefinition;
}

export interface GetRouteDefinitionSingle {
  (route: string | RegExp): RouteDefinition;
}

export interface RouteHelpers {
  addRoute: (routeDefinition: RouteDefinition) => void;
  validationErrorHandler: (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
}

export interface AddRoutes {
  (app: Express, routeHelpers: RouteHelpers, middleware: RequestHandler): void;
}

type ShowReactApp = {
  emailFirstRoutes: boolean;
  simpleRoutes: boolean;
  resetPasswordRoutes: boolean;
  oauthRoutes: boolean;
  signInRoutes: boolean;
  signUpRoutes: boolean;
  pairRoutes: boolean;
  postVerifyOtherRoutes: boolean;
  postVerifyCADViaQRRoutes: boolean;
  postVerifyThirdPartyAuthRoutes: boolean;
  webChannelExampleRoutes: boolean;
};

export interface ReactRouteGroups {
  [key: string]: ReactRouteGroup;
}

export interface GetReactRouteGroups {
  (showReactApp: ShowReactApp, i18n: any): ReactRouteGroups;
}

export interface GetRoute {
  (name: string, definition: RouteDefinition): {
    name: string;
    definition?: RouteDefinition;
  };
}

export interface GetBackboneRouteDefinition {
  (
    reactRouteGroups: ReactRouteGroups,
    routeNames: string[]
  ): RouteDefinition | null;
}
