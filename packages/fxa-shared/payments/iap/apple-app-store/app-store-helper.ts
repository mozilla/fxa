/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AppStoreServerAPI,
  Environment,
  StatusResponse,
} from 'app-store-server-api';
import { AppStoreHelperError } from './types/errors';
import { Logger } from 'mozlog';

export type AppStoreHelperConfig = {
  subscriptions: {
    appStore: {
      credentials: any;
      sandbox: Boolean;
    };
  };
};

export class AppStoreHelper {
  protected appStoreServerApiClients: {
    [key: string]: AppStoreServerAPI;
  };
  protected credentialsByBundleId: any;
  protected environment: Environment;

  constructor(protected config: AppStoreHelperConfig, protected log: Logger) {
    const {
      subscriptions: { appStore },
    } = config;

    this.credentialsByBundleId = {};
    // Initialize App Store Server API client per bundle ID
    this.environment = appStore.sandbox
      ? Environment.Sandbox
      : Environment.Production;
    this.appStoreServerApiClients = {};
    for (const [bundleIdWithUnderscores, credentials] of Object.entries(
      appStore.credentials
    )) {
      // Cannot use an actual bundleId (e.g. 'org.mozilla.ios.FirefoxVPN') as the key
      // due to https://github.com/mozilla/node-convict/issues/250
      const bundleId = bundleIdWithUnderscores.replace(/_/g, '.');
      this.credentialsByBundleId[bundleId] = credentials;
      this.clientByBundleId(bundleId);
    }
  }

  /**
   * Returns an App Store Server API client by bundleId, initializing it first
   * if needed.
   */
  clientByBundleId(bundleId: string): AppStoreServerAPI {
    if (this.appStoreServerApiClients.hasOwnProperty(bundleId)) {
      return this.appStoreServerApiClients[bundleId];
    }
    if (!this.credentialsByBundleId.hasOwnProperty(bundleId)) {
      const libraryError = new Error(
        `No App Store credentials found for app with bundleId: ${bundleId}.`
      );
      libraryError.name = AppStoreHelperError.CREDENTIALS_NOT_FOUND;
      throw libraryError;
    }
    const { serverApiKey, serverApiKeyId, issuerId } =
      this.credentialsByBundleId[bundleId];
    this.appStoreServerApiClients[bundleId] = new AppStoreServerAPI(
      serverApiKey,
      serverApiKeyId,
      issuerId,
      bundleId,
      this.environment
    );
    return this.appStoreServerApiClients[bundleId];
  }

  async getSubscriptionStatuses(
    bundleId: string,
    originalTransactionId: string
  ): Promise<StatusResponse> {
    const apiClient = this.clientByBundleId(bundleId);
    return apiClient.getSubscriptionStatuses(originalTransactionId);
  }
}
