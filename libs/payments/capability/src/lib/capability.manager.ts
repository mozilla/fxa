/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ProductConfigurationManager, ServiceResult } from '@fxa/shared/cms';

@Injectable()
export class CapabilityManager {
  constructor(
    private productConfigurationManager: ProductConfigurationManager
  ) {}

  async getClients() {
    const clients = (
      await this.productConfigurationManager.getServicesWithCapabilities()
    ).getServices();

    return clients.map((client: ServiceResult) => {
      const capabilities = client.capabilities.map(
        (capability) => capability.slug
      );
      const sortedCapabilities = capabilities.sort();
      return {
        clientId: client.oauthClientId,
        capabilities: sortedCapabilities,
      };
    });
  }

  /**
   * Fetch the list of capabilities for the given price ids.
   *
   * Returns Record<string, string[]>
   * Keys are clientIds
   * Values are capabilitySlugs[]
   */
  async priceIdsToClientCapabilities(
    subscribedPrices: string[]
  ): Promise<Record<string, string[]>> {
    const result: Record<string, Set<string>> = {};

    for (const subscribedPrice of subscribedPrices) {
      const purchaseDetails =
        await this.productConfigurationManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          [subscribedPrice]
        );

      const capabilityOffering =
        purchaseDetails.capabilityOfferingForPlanId(subscribedPrice);

      // continue if neither offering nor capabilities exist
      if (!capabilityOffering || !capabilityOffering?.capabilities) continue;

      for (const capabilityCollection of capabilityOffering.capabilities) {
        // continue if individual capability does not contain any services
        if (!capabilityCollection.services) continue;

        for (const capability of capabilityCollection.services) {
          result[capability.oauthClientId] ||= new Set();

          result[capability.oauthClientId].add(capabilityCollection.slug);
        }
      }
    }

    const output: Record<string, string[]> = {};
    for (const [clientId, capabilities] of Object.entries(result)) {
      output[clientId] = Array.from(capabilities);
    }

    return output;
  }
}
