/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/lib/client';
import {
  OAuthIntegration,
  OAuthRelier,
  PairingAuthorityIntegration,
  PairingSupplicantIntegration,
  Relier,
  SyncBasicIntegration,
  SyncDesktopIntegration,
  WebIntegration,
  isOAuthRelier,
} from '../../models';
import { Constants } from '../constants';
import { ModelDataStore, StorageData } from '../model-data';
import { RelierFlags } from '../reliers';
import { ReachRouterWindow } from '../window';

export class IntegrationFactory {
  public readonly storageData: StorageData;

  constructor(
    // TODO: Using Relier flags is temporary, we will combine them in FXA-7308
    protected readonly flags: RelierFlags,
    protected readonly relier: Relier | OAuthRelier,
    protected readonly authClient: AuthClient,
    protected readonly window: ReachRouterWindow,
    protected readonly data: ModelDataStore
  ) {
    this.storageData = new StorageData(window);
  }

  /**
   * Produces an integration object given the current data store's state.
   * @returns An integration implementation.
   */
  getIntegration() {
    const flags = this.flags;
    const relier = this.relier;

    if (flags.isOAuth() && isOAuthRelier(relier)) {
      if (flags.isDevicePairingAsAuthority()) {
        return new PairingAuthorityIntegration();
      }
      if (flags.isDevicePairingAsSupplicant()) {
        return new PairingSupplicantIntegration(relier);
      }
      return this.createOAuthIntegration(relier);
    } else if (flags.isVerification()) {
      return this.getVerificationIntegration();
    } else if (
      flags.searchParam('context') === Constants.FX_DESKTOP_V3_CONTEXT
    ) {
      return new SyncDesktopIntegration();
    }

    return new WebIntegration();
  }

  private getVerificationIntegration() {
    // If the user verifies in the same browser, use the same context that
    // was used to sign up to allow the verification tab to have the same
    // capabilities as the signup tab.
    // For users that verify in a 2nd browser, choose the most appropriate
    // broker based on the service to allow the verification tab to have
    // service specific behaviors and messaging. For Sync, use the generic
    // Sync broker, for OAuth, use the OAuth broker.
    // If no service is specified and the user is verifies in a 2nd browser,
    // then fall back to the default content server context.

    // TODO in FXA-7308
    // const sameBrowserVerificationContext =
    //   this._getSameBrowserVerificationModel('context').get('context');
    const sameBrowserVerificationContext = false;
    if (sameBrowserVerificationContext) {
      // user is verifying in the same browser, use the same context they signed up with.

      // TODO, dive into localStorage and check/set this value. Return the default for now
      return new WebIntegration();
    } else if (this.flags.isServiceSync()) {
      // user is verifying in a different browser.
      return new SyncBasicIntegration();
    } else if (this.flags.isServiceOAuth() && isOAuthRelier(this.relier)) {
      // oauth, user is verifying in a different browser.
      return new OAuthIntegration(this.relier);
    }

    // TEMPORARY for tests until `sameBrowserVerificationContext` is accounted for.
    // in reality this will never have this context, it'll get pulled from localStorage
    if (this.flags.searchParam('context') === Constants.FX_DESKTOP_V3_CONTEXT) {
      return new SyncDesktopIntegration();
    }
    return new WebIntegration();
  }

  // TODO in FXA-7308
  // private _getSameBrowserVerificationModel(namespace) {
  //   const urlVerificationInfo = Url.searchParams(this._window.location.search);

  //   const verificationInfo = new SameBrowserVerificationModel(
  //     {},
  //     {
  //       email: urlVerificationInfo.email,
  //       namespace: namespace,
  //       uid: urlVerificationInfo.uid,
  //     }
  //   );
  //   verificationInfo.load();

  //   return verificationInfo;
  // }

  private createOAuthIntegration(relier: OAuthRelier) {
    const flags = this.flags;

    if (flags.isDevicePairingAsAuthority()) {
      return new PairingAuthorityIntegration();
    }

    if (flags.isDevicePairingAsSupplicant()) {
      return new PairingSupplicantIntegration(relier);
    }

    return new OAuthIntegration(relier);
  }
}
