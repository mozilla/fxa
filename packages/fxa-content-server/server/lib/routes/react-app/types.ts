/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TS setup for anything outside of `app/` is complex. This file defines types we
// import for JSDoc instead.

import { RouteDefinition } from 'fxa-shared/express/routing';

export interface RouteFeatureFlagGroup {
  featureFlagOn: boolean;
  routes: {
    name: string;
    definition: RouteDefinition;
  }[];
}
