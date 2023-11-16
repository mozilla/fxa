/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthClient } from '../oauth/oauth-client';
import { IntegrationDelegates } from './interfaces';

/**
 * Default implementations for integration delegate functions
 */
export class DefaultIntegrationDelegates implements IntegrationDelegates {
  constructor(
    protected readonly authServerUrl: string,
    protected readonly oAuthServerUrl: string
  ) {}

  async getClientInfo(clientId: string) {
    const client = new OAuthClient(this.oAuthServerUrl);
    return client.getClientInfo(clientId);
  }

  getProductIdFromRoute() {
    const re = new RegExp('/subscriptions/products/(.*)');
    const subscriptionProductRouteMatch = re.exec(window.location.pathname);
    if (subscriptionProductRouteMatch) {
      return subscriptionProductRouteMatch[1];
    }
    return '';
  }

  async getProductInfo(productId: string) {
    const url = `${this.authServerUrl}/v1/oauth/subscriptions/productname?productId=${productId}`;
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      if (data.product_name) {
        return {
          productName: data.product_name,
        };
      }
    }

    return {};
  }
}
