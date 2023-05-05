/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type GleanMetricsConfig = {
  enabled: boolean;
  applicationId: string;
  uploadEnabled: boolean;
  appDisplayVersion: string;
  channel: string;
  serverEndpoint: string;
};

import Glean from '@mozilla/glean/web';
import * as registration from './registration';

export const GleanMetrics = {
  initialize: (config: GleanMetricsConfig) => {
    if (config.enabled) {
      Glean.initialize(config.applicationId, config.uploadEnabled, {
        appDisplayVersion: config.appDisplayVersion,
        channel: config.channel,
        serverEndpoint: config.serverEndpoint,
        // Glean does not offer direct control over when metrics are submitted;
        // this ensures that events are submitted.
        maxEvents: 1,
      });
    }
  },
  registration,
};

export default GleanMetrics;
