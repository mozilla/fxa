/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from '../constants';
import { ModelDataStore, UrlQueryData } from '../model-data';
import { IntegrationFlags } from '../integrations/interfaces';

const DEVICE_PAIRING_SUPPLICANT_PATHNAME_REGEXP = /^\/pair\/supp/;

/**
 * Extrapolates flags from the state of the current data store. The collective state of these flags are used by
 * the factory to determine what underlying type of relier to create.
 *
 * Note: this logic was ported from fxa-content-server app-start.js.
 */
export class DefaultIntegrationFlags implements IntegrationFlags {
  protected get pathname() {
    return this.urlQueryData.pathName;
  }

  constructor(
    private urlQueryData: UrlQueryData,
    private storageData: ModelDataStore
  ) {}

  isDevicePairingAsAuthority() {
    return (
      this.searchParam('redirect_uri') ===
      Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
    );
  }

  isDevicePairingAsSupplicant() {
    return (
      this.isOAuthWebChannelContext() &&
      DEVICE_PAIRING_SUPPLICANT_PATHNAME_REGEXP.test(this.pathname)
    );
  }

  isOAuth() {
    const clientId = this.searchParam('client_id');
    const isOAuthVerificationSameBrowser =
      this._isOAuthVerificationSameBrowser();
    const isOAuthVerificationDifferentBrowser =
      this._isOAuthVerificationDifferentBrowser();
    const isOAuthPath = /oauth/.test(this.pathname);
    return (
      !!clientId ||
      isOAuthVerificationSameBrowser ||
      isOAuthVerificationDifferentBrowser ||
      isOAuthPath
    );
  }

  isV3DesktopContext() {
    return this.searchParam('context') === Constants.FX_DESKTOP_V3_CONTEXT;
  }

  // Sync mobile, Sync FF OAuth Desktop, and supplicant pairing use this context
  isOAuthWebChannelContext() {
    return this.searchParam('context') === Constants.OAUTH_WEBCHANNEL_CONTEXT;
  }

  isOAuthSuccessFlow() {
    const status = /oauth\/success/.test(this.pathname);

    let clientId = '';
    if (status) {
      const pathname = this.pathname.split('/');
      clientId = pathname[pathname.length - 1];
    }

    return {
      status,
      clientId,
    };
  }

  isOAuthVerificationFlow(): boolean {
    return !!this.searchParam('code');
  }

  private _isOAuthVerificationSameBrowser() {
    return this.isVerification() && this._isService(this._getSavedClientId());
  }

  isVerification() {
    // TODO: fix type returned from `searchParam`, forces this boolean check
    return !!(
      this._isSignUpVerification() ||
      this._isPasswordResetVerification() ||
      this._isReportSignIn()
    );
  }

  private _isPasswordResetVerification() {
    return this.searchParam('code') && this.searchParam('token');
  }

  private _isReportSignIn() {
    return this.pathname === '/report_signin';
  }

  private _isSignUpVerification() {
    return this.searchParam('code') && this.searchParam('uid');
  }

  // TODO: fix type, return type is `unknown`
  searchParam(key: string) {
    return this.urlQueryData.get(key);
  }

  isServiceSync() {
    return this._isService(Constants.SYNC_SERVICE);
  }

  private _isService(compareToService: string) {
    const service = this.searchParam('service');
    return !!(service && compareToService && service === compareToService);
  }

  private _isOAuthVerificationDifferentBrowser() {
    return this.isVerification() && this.isServiceOAuth();
  }

  isServiceOAuth() {
    const service = this.searchParam('service');
    // TODO: fix type returned from `_searchParam`, forces this boolean check
    return !!(service && !this.isServiceSync());
  }

  private _getSavedClientId() {
    const oauth = JSON.parse(this.storageData.get('oauth') || '{}');
    if (
      typeof oauth === 'object' &&
      oauth != null &&
      'client_id' in oauth &&
      typeof oauth.client_id === 'string'
    ) {
      return oauth.client_id;
    }
    return '';
  }
}
