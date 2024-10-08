/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from '../../lib/constants';
import { ModelDataStore } from '../../lib/model-data';
import { IntegrationType } from './base-integration';
import { OAuthIntegration, OAuthIntegrationOptions } from './oauth-integration';

export class OAuthBrowserIntegration extends OAuthIntegration {
  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.OAuthBrowser);
  }

  isSync() {
    return this.isDesktopSync() || this.isFirefoxMobileClient();
  }

  isDesktopSync() {
    return this.isFirefoxDesktopClient() && this.data.service === 'sync';
  }

  // Mobile does not provide service=sync, it is just Sync by default
  isFirefoxMobileClient() {
    return (
      // Firefox for iOS
      this.clientInfo?.clientId === '1b1a3e44c54fbb58' ||
      // Fenix
      this.clientInfo?.clientId === 'a2270f727f45f648' ||
      // Fennec
      this.clientInfo?.clientId === '3332a18d142636cb'
    );
  }

  isFirefoxDesktopClient() {
    return this.clientInfo?.clientId === '5882386c6d801776';
  }

  wantsKeys() {
    return true;
  }

  // TODO, clientId should always be provided so do we need this fallback?
  // prefer client id if available (for oauth) otherwise fallback to service (e.g. for sync)
  getService() {
    return this.data.clientId || this.data.service;
  }

  // TODO in FXA-10313, check for "Relay" or whatever makes sense at implementation
  get serviceName() {
    if (this.data.service === 'sync') {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    } else {
      return 'Firefox';
    }
  }
}
