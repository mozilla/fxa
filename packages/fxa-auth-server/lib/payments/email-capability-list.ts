/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ClientIdCapabilityMap } from 'fxa-shared/subscriptions/types';

import { ProductConfigurationManager } from '@fxa/shared/cms';

/**
 * Resolves the `{ clientId → capabilities[] }` map an FxA user receives
 * because their primary email is on a Strapi-managed allowlist.
 *
 * Delegates to `ProductConfigurationManager.getBusinessEntitlements()`,
 * which is cached by `StrapiClient`'s two-tier cache. Matching against
 * email-address, email-domain, and email-list matchers happens in
 * `BusinessEntitlementsResultUtil`.
 *
 * TODO(FXA-XXXXX): Long-term this lookup should move into payments-api so
 * Strapi access lives in one place. The auth-server `/profile` flow will
 * then call payments-api instead of reading the CMS directly.
 */
export type EmailCapabilityListConfig = {
  enabled: boolean;
};

export class EmailCapabilityList {
  private readonly enabled: boolean;

  constructor(
    config: EmailCapabilityListConfig,
    private readonly productConfigurationManager?: ProductConfigurationManager
  ) {
    this.enabled = !!config?.enabled;
  }

  async getCapabilitiesForEmail(
    email?: string | null
  ): Promise<ClientIdCapabilityMap> {
    if (!this.enabled || !email || !this.productConfigurationManager) {
      return {};
    }
    const result =
      await this.productConfigurationManager.getBusinessEntitlements();
    return result.findCapabilitiesForEmail(email);
  }
}
