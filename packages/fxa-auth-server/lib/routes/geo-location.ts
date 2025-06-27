/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Generic **location‑based eligibility** helper and route.

import isA from 'joi';
import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import MISC_DOCS from '../../docs/swagger/misc-api';

export type GeoEligibilityRules = Record<string, string[]>;

export class GeoEligibilityCheckService {
  private readonly rules: GeoEligibilityRules;

  constructor(rulesFromConfig: GeoEligibilityRules = {}) {
    // Normalise once: every feature + country stored in UPPER‑CASE.
    this.rules = Object.entries(rulesFromConfig).reduce<GeoEligibilityRules>(
      (acc, [feature, countries]) => {
        acc[feature.toUpperCase()] = (countries ?? []).map((c) =>
          c.toUpperCase()
        );
        return acc;
      },
      {}
    );
  }

  /** Expose the (already normalised) rule set for diagnostics/logging. */
  getRules(): GeoEligibilityRules {
    return this.rules;
  }

  exists(feature: string): boolean {
    return feature.toUpperCase() in this.rules;
  }

  isAllowed(feature: string, country?: string | null): boolean {
    if (!country) return false;
    const allow = this.rules[feature.toUpperCase()];
    return Array.isArray(allow) && allow.includes(country.toUpperCase());
  }
}

export class GeoLocationHandler {
  private readonly geoEligibilityCheckService: GeoEligibilityCheckService;

  constructor(
    private config: ConfigType,
    private log: AuthLogger
  ) {
    const rulesFromConfig = (config.geoEligibility?.rules ??
      {}) as GeoEligibilityRules;
    this.geoEligibilityCheckService = new GeoEligibilityCheckService(rulesFromConfig);
  }

  geoEligibilityCheck = (request: AuthRequest) => {
    this.log.begin('geo.eligibility.check', request);
    const feature = request.params.feature.toUpperCase();

    if (!this.geoEligibilityCheckService.exists(feature)) {
      this.log.error('geo.eligibility.checkfailure', {
        feature,
        uid: (request.auth.credentials as any).uid,
        rules: this.geoEligibilityCheckService.getRules(),
      });
      return { eligible: false };
    }

    const country = request.app.geo?.location?.countryCode ?? null;
    const eligible = this.geoEligibilityCheckService.isAllowed(feature, country);

    this.log.info('geo.eligibility.checked', {
      feature,
      country,
      eligible,
      uid: (request.auth.credentials as any).uid,
      rules: this.geoEligibilityCheckService.getRules(),
    });

    return { eligible };
  };
}

export const geoRoutes = (config: ConfigType, log: AuthLogger) => {
  const handler = new GeoLocationHandler(config, log);

  return [
    {
      method: 'GET',
      path: '/geo/eligibility/{feature}',
      options: {
        ...MISC_DOCS.GEO_ELIGIBILITY_GET,
        auth: {
          strategy: 'sessionToken',
          mode: 'required',
        },
        validate: {
          params: isA.object({
            feature: isA.string().max(64).required(),
          }),
        },
        response: {
          schema: isA.object({
            eligible: isA.boolean().required(),
          }),
        },
      },
      handler: (request: AuthRequest) => handler.geoEligibilityCheck(request),
    },
  ];
};

export default geoRoutes;
