/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isA from 'joi';
import { FeatureFlag } from 'fxa-shared/db/models/auth';
import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import MISC_DOCS from '../../docs/swagger/misc-api';

export class FeatureFlagsHandler {
  constructor(
    config: ConfigType,
    private log: AuthLogger
  ) {
    FeatureFlag.setCacheTtlMs(config.featureFlags.cacheTtlMs);
  }

  getEnabledFlags = async (request: AuthRequest) => {
    this.log.begin('featureFlags.get', request);
    return FeatureFlag.getEnabledFlags();
  };
}

export const featureFlagsRoutes = (config: ConfigType, log: AuthLogger) => {
  const handler = new FeatureFlagsHandler(config, log);
  const { cacheTtlMs } = config.featureFlags;

  return [
    {
      method: 'GET',
      path: '/feature-flags',
      options: {
        ...MISC_DOCS.FEATURE_FLAGS_GET,
        auth: false,
        // The response is identical for every caller, so a shared cache can
        // serve it. Hapi rejects an expiresIn of 0, so a disabled cache means
        // no header at all.
        ...(cacheTtlMs > 0
          ? { cache: { expiresIn: cacheTtlMs, privacy: 'public' as const } }
          : {}),
        response: {
          schema: isA.array().items(isA.string()),
        },
      },
      handler: (request: AuthRequest) => handler.getEnabledFlags(request),
    },
  ];
};

export default featureFlagsRoutes;
