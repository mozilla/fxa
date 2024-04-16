/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  OAuthIntegration,
  PairingAuthorityIntegration,
  PairingSupplicantIntegration,
  Integration,
  SyncBasicIntegration,
  SyncDesktopV3Integration,
  WebIntegration,
  RelierClientInfo,
  RelierSubscriptionInfo,
} from '../../models/integrations';
import {
  ModelDataStore,
  StorageData,
  UrlHashData,
  UrlQueryData,
} from '../model-data';
import { OAuthError } from '../oauth';
import { ReachRouterWindow } from '../window';
import { IntegrationFlags } from './interfaces';
import { DefaultIntegrationFlags } from '.';
import config from '../config';

/**
 * We store a whitelist of allowed `redirectUri`s in `clientInfo.redirectUri` which
 * can be a single value or comma-separated values for multiple allowed URIs.
 * If the query param `redirect_uri` is provided, we must check against the whitelist
 * to ensure a match.
 */
function getClientRedirect(
  clientRedirectUris: string[] | undefined,
  queryRedirectUri: string | undefined
) {
  if (!clientRedirectUris) {
    return '';
  }

  // If RP doesn't specify redirectUri, we default to the first redirectUri
  // for the client
  if (!queryRedirectUri) {
    return clientRedirectUris[0];
  }

  const hasRedirectUri = clientRedirectUris.some(
    (uri) => queryRedirectUri === uri
  );
  if (hasRedirectUri) {
    return queryRedirectUri;
  }

  return '';
}

/**
 * Produces Integrations
 */
export class IntegrationFactory {
  protected readonly data: ModelDataStore;
  protected readonly channelData: ModelDataStore;
  protected readonly storageData: ModelDataStore;
  protected readonly clientInfo?: RelierClientInfo;
  protected readonly productInfo?: RelierSubscriptionInfo;
  protected readonly loading?: boolean;
  public readonly flags: IntegrationFlags;

  constructor(opts: {
    window: ReachRouterWindow;
    productInfo?: RelierSubscriptionInfo;
    clientInfo?: RelierClientInfo;
    data?: ModelDataStore;
    channelData?: ModelDataStore;
    storageData?: ModelDataStore;
    flags?: IntegrationFlags;
  }) {
    const { window } = opts;
    this.data = opts.data || new UrlQueryData(window);
    this.channelData = opts.channelData || new UrlHashData(window);
    this.storageData = opts.storageData || new StorageData(window);
    this.flags =
      opts.flags ||
      new DefaultIntegrationFlags(
        new UrlQueryData(window),
        new StorageData(window)
      );
    this.clientInfo = opts.clientInfo;
    this.productInfo = opts.productInfo;
  }

  /**
   * Produces an integration object given the current data store's state.
   * @returns An integration implementation.
   */
  getIntegration(): Integration {
    const data = this.data;
    const channelData = this.channelData;
    const storageData = this.storageData;
    const flags = this.flags;

    // The order of checks matters
    if (flags.isDevicePairingAsAuthority()) {
      return this.createPairingAuthorityIntegration(channelData, storageData);
    } else if (flags.isDevicePairingAsSupplicant()) {
      return this.createPairingSupplicationIntegration(data, storageData);
    } else if (flags.isOAuth()) {
      return this.createOAuthIntegration(data, storageData);
    } else if (flags.isV3DesktopContext()) {
      return this.createSyncDesktopV3Integration(data);
    } else if (flags.isServiceSync()) {
      return this.createSyncBasicIntegration(data);
    } else {
      // Default
      return this.createWebIntegration(data);
    }
  }

  private createPairingAuthorityIntegration(
    data: ModelDataStore,
    storageData: ModelDataStore
  ) {
    const integration = new PairingAuthorityIntegration(
      data,
      storageData,
      config.oauth
    );
    this.initIntegration(integration);
    return integration;
  }

  private createPairingSupplicationIntegration(
    data: ModelDataStore,
    storageData: ModelDataStore
  ) {
    const integration = new PairingSupplicantIntegration(
      data,
      storageData,
      config.oauth
    );
    this.initIntegration(integration);
    this.initClientInfo(integration);
    return integration;
  }

  private createOAuthIntegration(
    data: ModelDataStore,
    storageData: ModelDataStore
  ) {
    // Resolve configuration settings for oauth relier
    const integration = new OAuthIntegration(data, storageData, config.oauth);
    this.initIntegration(integration);
    this.initOAuthIntegration(integration, this.flags);
    this.initClientInfo(integration);
    return integration;
  }

  private createWebIntegration(data: ModelDataStore) {
    const integration = new WebIntegration(data);
    this.initIntegration(integration);
    return integration;
  }

  private createSyncBasicIntegration(data: ModelDataStore) {
    const integration = new SyncBasicIntegration(data);
    this.initIntegration(integration);
    return integration;
  }

  private createSyncDesktopV3Integration(data: ModelDataStore) {
    const integration = new SyncDesktopV3Integration(data);
    this.initIntegration(integration);
    return integration;
  }

  /**
   * Initializes a base integration state
   **/
  initIntegration(integration: Integration) {
    // Important!
    // FxDesktop declares both `entryPoint` (capital P) and
    // `entrypoint` (lowercase p). Normalize to `entrypoint`.
    const entryPoint = integration.data.getModelData('entryPoint');
    const entrypoint = integration.data.getModelData('entrypoint');
    if (
      entryPoint != null &&
      entrypoint != null &&
      typeof entryPoint === 'string'
    ) {
      integration.data.entrypoint = entryPoint;
    }
  }

  /**
   * Initializes the OAuth integration state
   */
  initOAuthIntegration(integration: OAuthIntegration, flags: IntegrationFlags) {
    const { status, clientId } = flags.isOAuthSuccessFlow();
    if (status) {
      if (!clientId) {
        throw new OAuthError('INVALID_PARAMETER');
      }
      integration.data.clientId = clientId;
    } else if (flags.isOAuthVerificationFlow()) {
      // The presence of the 'resume' query parameter indicates we are resuming a previous flow,
      // which usually means the user is opening a link from an email. We aren't relying on this
      // token's actual value anymore, however, we will still use it as a signal that a flow is being
      // resumed.
      const resume = this.data.get('resume');

      if (!!resume) {
        // Since we are resuming a previous flow, check to see if a previous oauth state was saved prior
        // to the verification email being sent out and attempt to restore this state.
        //
        // If a state is present, the it will contain 'scope' and 'state' parameters that allow us to
        // redirect the user back to the relying party's site after they complete their workflow here.
        //
        // If the state isn't present, we can still proceed with the user flow, but we will not be able to
        // redirect the user back to the relying parties site, becuase without the knowing the relying party's
        // oauth 'state', the redirect would be rejected.
        integration.restoreOAuthState();
      }
    } else {
      // Sign inflow
      // params listed in:
      // https://mozilla.github.io/ecosystem-platform/api#tag/OAuth-Server-API-Overview
    }
  }

  initClientInfo(integration: OAuthIntegration) {
    /* TODO: Possibly create SyncMobile integration if we need more special cases
     * for sync mobile, or, probably remove 'isOAuthVerificationDifferentBrowser'
     * 'isOAuthVerificationSameBrowser' checks when reset PW no longer uses links.
     *
     * `service=sync` is passed when `context` is `fx_desktop_v3` (Sync desktop) or
     * when context is `fx_ios_v1` (which we don't support, iOS 1.0 ... < 2.0). See:
     * https://mozilla.github.io/ecosystem-platform/relying-parties/reference/query-parameters#service
     *
     * However, mobile Sync reset PW can pass a 'service' param without a 'clientId' that
     * acts as a clientId, and we currently consider this an OAuth flow (in Backbone as well)
     * that does not want to redirect. In this case, createClientInfo with 'service'.
     */

    const redirectUris = this.clientInfo?.redirectUri?.split(',');
    const clientRedirectUri = getClientRedirect(
      redirectUris,
      integration.data.redirectUri
    );

    integration.clientInfo = {
      clientId: this.clientInfo?.clientId,
      imageUri: this.clientInfo?.imageUri,
      serviceName: this.clientInfo?.serviceName,
      redirectUri: clientRedirectUri,
      trusted: this.clientInfo?.trusted,
    };
  }

  initSubscriptionInfo(integration: Integration) {
    integration.subscriptionInfo = {
      subscriptionProductId: this.productInfo?.subscriptionProductId || '',
      subscriptionProductName: this.productInfo?.subscriptionProductName || '',
    };
  }
}
