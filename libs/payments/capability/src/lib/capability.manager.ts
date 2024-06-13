/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CapabilitiesResult,
  ContentfulManager,
  ServiceResult,
} from '@fxa/shared/contentful';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CapabilityManager {
  constructor(private contentfulManager: ContentfulManager) {}

  async getClients() {
    const clients = (
      await this.contentfulManager.getServicesWithCapabilities()
    ).getServices();

    return clients.map((client: ServiceResult) => {
      const capabilities = client.capabilitiesCollection.items.map(
        (capability: CapabilitiesResult) => capability.slug
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
    const result: Record<string, string[]> = {};

    for (const subscribedPrice of subscribedPrices) {
      const purchaseDetails =
        await this.contentfulManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          [subscribedPrice]
        );

      const capabilityOffering =
        purchaseDetails.capabilityOfferingForPlanId(subscribedPrice);

      // continue if neither offering nor capabilities exist
      if (
        !capabilityOffering ||
        !capabilityOffering?.capabilitiesCollection?.items
      )
        continue;

      for (const capabilityCollection of capabilityOffering
        .capabilitiesCollection.items) {
        // continue if individual capability does not contain any services
        if (!capabilityCollection.servicesCollection?.items) continue;

        for (const capability of capabilityCollection.servicesCollection
          .items) {
          result[capability.oauthClientId] ||= [];

          result[capability.oauthClientId].push(capabilityCollection.slug);
        }
      }
    }

    return result;
  }
}
