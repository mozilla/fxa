/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { GoogleIapClientConfig } from './google-iap.client.config';
import {
  androidpublisher,
  androidpublisher_v3,
  auth,
} from '@googleapis/androidpublisher';
import {
  GoogleIapClientUnexpectedTypeError,
  GoogleIapClientUnknownError,
  GoogleIapSubscriptionNotFoundError,
  GoogleIapSubscriptionPurchaseTokenInvalidError,
} from './google-iap.error';

@Injectable()
export class GoogleIapClient {
  playDeveloperApiClient: androidpublisher_v3.Androidpublisher;

  constructor(config: GoogleIapClientConfig) {
    const authConfig = {
      email: config.email,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      ...(config.keyFilename
        ? { keyFile: config.keyFilename }
        : { key: config.privateKey }),
    };
    this.playDeveloperApiClient = androidpublisher({
      version: 'v3',
      auth: new auth.GoogleAuth(authConfig),
    });
  }

  async getSubscription(
    packageName: string,
    sku: string,
    purchaseToken: string
  ) {
    try {
      const apiResponse =
        await this.playDeveloperApiClient.purchases.subscriptions.get({
          packageName: packageName,
          subscriptionId: sku,
          token: purchaseToken,
        });

      return apiResponse.data;
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 404) {
        throw new GoogleIapSubscriptionNotFoundError(packageName, sku, purchaseToken, e);
      }
      if (e instanceof Error && 'code' in e && e.code === 410) {
        throw new GoogleIapSubscriptionPurchaseTokenInvalidError(packageName, sku, purchaseToken, e);
      }

      throw this.convertError(e);
    }
  }

  private convertError(e: unknown) {
    if (e instanceof Error) {
      return new GoogleIapClientUnknownError(e);
    } else {
      return new GoogleIapClientUnexpectedTypeError(
        new Error(`Unknown error: ${JSON.stringify(e)}`)
      );
    }
  }
}
