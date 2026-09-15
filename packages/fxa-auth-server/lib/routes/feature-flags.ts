/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isA from 'joi';
import { FeatureFlag } from '@fxa/shared/db/mysql/legacy/models/auth';
import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import MISC_DOCS from '../../docs/swagger/misc-api';

export const featureFlagsRoutes = (config: ConfigType, log: AuthLogger) => {
  FeatureFlag.setCacheTtlMs(config.featureFlags.cacheTtlMs);

  return [
    {
      method: 'GET',
      path: '/feature-flags',
      options: {
        ...MISC_DOCS.FEATURE_FLAGS_GET,
        auth: false,
        response: {
          schema: isA.object().pattern(isA.string(), isA.boolean()),
        },
      },
      handler: (request: AuthRequest) => {
        log.begin('featureFlags.get', request);
        return FeatureFlag.getFlagMap();
      },
    },
  ];
};

export default featureFlagsRoutes;
