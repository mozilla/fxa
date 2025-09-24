/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SyncEngines } from '../../lib/channels/firefox';
import { Constants } from '../../lib/constants';
import { ModelDataStore } from '../../lib/model-data';
import { Integration, IntegrationType } from './integration';
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
  // TODO: handle Thunderbird case better, FXA-10848
  Thunderbird = '8269bacd7bbc7f80',
}

/**
 * These come through via data.service (a query parameter).
 */
export enum OAuthNativeServices {
  Sync = 'sync',
  Relay = 'relay',
  AiMode = 'aimode',
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
    return this.isFirefoxDesktopClient() && this.isDefaultSyncService();
  }

  private isFirefoxClient() {
    return this.isFirefoxDesktopClient() || this.isFirefoxMobileClient();
  }

  // Sync should always provide a `service=sync` parameter for all Fx Desktop versions
  // and newer mobile versions. We'll default to Sync if it's missing.
  private isDefaultSyncService() {
    return (
      this.data.service === undefined ||
      this.data.service === OAuthNativeServices.Sync
    );
  }

  isFirefoxClientServiceRelay() {
    return (
      this.isFirefoxClient() && this.data.service === OAuthNativeServices.Relay
    );
  }

  isFirefoxClientServiceAiMode() {
    return (
      this.isFirefoxClient() && this.data.service === OAuthNativeServices.AiMode
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
    return (
      this.clientInfo?.clientId === OAuthNativeClients.FirefoxDesktop ||
      // TODO / HACK: this check is temporary to unblock Thunderbird until
      // we can work on FXA-10848
      this.clientInfo?.clientId === OAuthNativeClients.Thunderbird
    );
  }

  wantsKeys() {
    // TODO: this will not always be true when working on FXA-12374
    return true;
  }

  getWebChannelServices(syncEngines?: SyncEngines) {
    if (this.isFirefoxClientServiceRelay()) {
      return { relay: {} };
    }
    if (this.isFirefoxClientServiceAiMode()) {
      return { aimode: {} };
    }
    if (this.isDefaultSyncService()) {
      return { sync: syncEngines || {} };
    }
    return undefined;
  }

  getServiceName() {
    if (this.isDefaultSyncService()) {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    }
    if (this.isFirefoxClientServiceRelay()) {
      return Constants.RELIER_FF_CLIENT_RELAY_SERVICE_NAME;
    }
    if (this.isFirefoxClientServiceAiMode()) {
      return Constants.RELIER_FF_CLIENT_AI_MODE_SERVICE_NAME;
    }
    // TODO: handle Thunderbird case better? FXA-10848
    return 'Firefox';
  }
}
