/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  AppleIapClientBundleError,
  AppleIapClientBundleUnknownError,
  AppleIapError,
  AppleIapMissingCredentialsError,
  AppleIapNotFoundError,
} from './apple-iap.error';
import {
  AppStoreError,
  AppStoreServerAPI,
  StatusResponse,
} from 'app-store-server-api';
import {
  AppleIapClientConfig,
  AppleIapClientConfigCredential,
} from './apple-iap.client.config';

@Injectable()
export class AppleIapClient {
  appStoreServerApiClients = new Map<string, AppStoreServerAPI>();
  private credentialsByBundleId = new Map<
    string,
    AppleIapClientConfigCredential
  >();

  constructor(private config: AppleIapClientConfig) {
    for (const credential of config.credentials) {
      this.credentialsByBundleId.set(credential.bundleId, credential);
      this.clientByBundleId(credential.bundleId);
    }
  }

  async getSubscriptionStatuses(
    bundleId: string,
    originalTransactionId: string
  ): Promise<StatusResponse> {
    try {
      const apiClient = this.clientByBundleId(bundleId);
      return await apiClient.getSubscriptionStatuses(originalTransactionId);
    } catch (e) {
      throw this.convertError(e);
    }
  }

  /**
   * Returns an App Store Server API client by bundleId, initializing it first
   * if needed.
   */
  private clientByBundleId(bundleId: string): AppStoreServerAPI {
    const existingClient = this.appStoreServerApiClients.get(bundleId);
    if (existingClient) {
      return existingClient;
    }

    const credential = this.credentialsByBundleId.get(bundleId);
    if (!credential) {
      throw new AppleIapMissingCredentialsError(bundleId);
    }

    const { key, keyId, issuerId } = credential;

    const client = new AppStoreServerAPI(
      key,
      keyId,
      issuerId,
      bundleId,
      this.config.environment
    );
    this.appStoreServerApiClients.set(bundleId, client);
    return client;
  }

  private convertError(e: unknown) {
    if (e instanceof AppleIapError) {
      return e;
    }

    if (e instanceof AppStoreError && e.errorCode === 4040010) {
      return new AppleIapNotFoundError(e);
    }

    if (e instanceof Error) {
      return new AppleIapClientBundleError(e);
    }

    return new AppleIapClientBundleUnknownError(
      new Error(`Unknown error: ${JSON.stringify(e)}`)
    );
  }
}
