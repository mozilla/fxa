/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TS setup for anything outside of `app/` is complex. This file defines types we
// import for JSDoc instead.

import { Express, RequestHandler } from 'express';
import { RouteDefinition } from '@fxa/shared/express';

export interface ReactRouteGroup {
  featureFlagOn: boolean;
  routes: {
    name: string;
    definition: Pick<RouteDefinition, 'method' | 'path'>;
  }[];
}

export interface AddRoutes {
  (app: Express, middleware: RequestHandler, config: any): void;
}

type ShowReactApp = {
  webChannelExampleRoutes: boolean;
  pair2Routes: boolean;
};

export interface ReactRouteGroups {
  [key: string]: ReactRouteGroup;
}

export interface GetReactRouteGroups {
  (
    showReactApp: ShowReactApp,
    reactRoute: { getRoutes(names: string[]): ReactRouteGroup['routes'] }
  ): ReactRouteGroups;
}
