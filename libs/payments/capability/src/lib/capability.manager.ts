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
    const clients: ServiceResult[] = (
      await this.contentfulManager.getServicesWithCapabilities()
    ).getServices();

    if (!clients) return [];

    return clients.map((client: ServiceResult) => ({
      clientId: client.oauthClientId,
      capabilities: client.capabilitiesCollection.items.map(
        (capability: CapabilitiesResult) => capability.slug
      ),
    }));
  }
}
