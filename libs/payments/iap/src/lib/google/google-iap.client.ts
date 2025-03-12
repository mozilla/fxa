/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { GoogleIapClientConfig } from './google-iap.client.config';
import { Auth, google, type androidpublisher_v3 } from 'googleapis';
import { GoogleIapUnknownError } from './google-iap.error';

@Injectable()
export class GoogleIapClient {
  playDeveloperApiClient: androidpublisher_v3.Androidpublisher;

  constructor(config: GoogleIapClientConfig) {
    const authConfig: Auth.JWTOptions = {
      email: config.email,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      ...(config.keyFilename
        ? { keyFile: config.keyFilename }
        : { key: config.privateKey }),
    };
    this.playDeveloperApiClient = google.androidpublisher({
      version: 'v3',
      auth: new Auth.JWT(authConfig),
    });
  }

  async getSubscriptions(
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
      throw this.convertError(e);
    }
  }

  private convertError(e: unknown) {
    if (e instanceof Error) {
      return new GoogleIapUnknownError('Unknown Google IAP Error', {
        cause: e,
      });
    } else {
      return new GoogleIapUnknownError('Unknown Google IAP Error', {
        cause: new Error(`Unknown error: ${e}`),
      });
    }
  }
}
