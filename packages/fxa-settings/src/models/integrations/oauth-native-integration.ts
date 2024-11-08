/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from '../../lib/constants';
import { ModelDataStore } from '../../lib/model-data';
import { Integration, IntegrationType } from './base-integration';
import {
  OAuthIntegrationOptions,
  OAuthWebIntegration,
} from './oauth-web-integration';

export function isOAuthNativeIntegration(integration: {
  type: IntegrationType;
}): integration is OAuthNativeIntegration {
  return (
    (integration as OAuthNativeIntegration).type === IntegrationType.OAuthNative
  );
}

export type OAuthIntegration = OAuthWebIntegration | OAuthNativeIntegration;

/**
 * Check if the integration is OAuthWeb or OAuthNative
 */
export function isOAuthIntegration(integration: {
  type: IntegrationType;
}): integration is OAuthIntegration {
  return (
    (integration as OAuthWebIntegration).type === IntegrationType.OAuthWeb ||
    (integration as OAuthNativeIntegration).type === IntegrationType.OAuthNative
  );
}

export enum OAuthNativeClients {
  FirefoxIOS = '1b1a3e44c54fbb58',
  FirefoxDesktop = '5882386c6d801776',
  Fenix = 'a2270f727f45f648',
  Fennec = '3332a18d142636cb',
}

/**
 * These come through via data.service (a query parameter).
 */
export enum OAuthNativeServices {
  Sync = 'sync',
  Relay = 'relay',
}

/**
 * A convenience function for the OAuthNativeIntegration type guard + isSync().
 */
export const isOAuthNativeIntegrationSync = (
  integration: Pick<Integration, 'type'>
) => isOAuthNativeIntegration(integration) && integration.isSync();

/**
 * This integration is used for OAuth implementations by the browser including
 * mobile clients (currently all Sync), the oauth desktop sync flow, and the oauth
 * desktop flow for other services.
 *
 * FxA sends and receives web channel messages if this integration is created.
 */
export class OAuthNativeIntegration extends OAuthWebIntegration {
  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.OAuthNative);
  }

  isSync() {
    // For now, all mobile clients are Sync. This may change in the future,
    // in which case we'll want a similar check to `isSyncDesktop`.
    return this.isDesktopSync() || this.isFirefoxMobileClient();
  }

  isDesktopSync() {
    return (
      this.isFirefoxDesktopClient() &&
      // Sync oauth desktop should always provide a `service=sync` parameter but
      // we'll also default to Sync if it's missing.
      (this.data.service === undefined ||
        this.data.service === OAuthNativeServices.Sync)
    );
  }

  // Note, if/when we expand this to other services, possibly consider making a
  // isSyncOptional method (or whatever name makes sense) instead
  isDesktopRelay() {
    return (
      this.isFirefoxDesktopClient() &&
      this.data.service === OAuthNativeServices.Relay
    );
  }

  isFirefoxMobileClient() {
    return (
      this.clientInfo?.clientId === OAuthNativeClients.FirefoxIOS ||
      this.clientInfo?.clientId === OAuthNativeClients.Fenix ||
      this.clientInfo?.clientId === OAuthNativeClients.Fennec
    );
  }

  isFirefoxDesktopClient() {
    return this.clientInfo?.clientId === OAuthNativeClients.FirefoxDesktop;
  }

  wantsKeys() {
    return true;
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
