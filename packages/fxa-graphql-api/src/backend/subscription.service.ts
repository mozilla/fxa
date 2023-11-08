/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config';
import { Injectable } from '@nestjs/common';
import { SubscriptionProductInfo } from '../gql/dto/payload';

@Injectable()
export class SubscriptionService {
  private authServerUrl: string;

  constructor(configService: ConfigService<AppConfig>) {
    const authServerConfig = configService.get(
      'authServer'
    ) as AppConfig['authServer'];
    this.authServerUrl = authServerConfig.url;
  }

  async getProductInfo(productId: string): Promise<SubscriptionProductInfo> {
    const emptyProductInfo = {
      subscriptionProductId: '',
      subscriptionProductName: '',
    };

    if (!productId) {
      return emptyProductInfo;
    }

    // TODO: Move to shared libs instead of relying on auth server
    const endPoint = '/oauth/subscriptions/productname';
    const query = `productId=${productId}`;
    const response = await fetch(`${this.authServerUrl}${endPoint}?${query}`);

    if (response.status === 200) {
      const json = await response.json();
      return {
        subscriptionProductId: productId,
        subscriptionProductName: json.product_name,
      };
    }

    if (response.status === 404) {
      return emptyProductInfo;
    }

    throw new Error(
      `Error resolving product info for ${productId}. Encountered unexpected error, ${response.status}.`
    );
  }
}
