/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeServices } from '@fxa/accounts/oauth';
import { isOAuthIntegration } from './oauth-native-integration';

const oauthNativeServices = new Set<string>(Object.values(OAuthNativeServices));

export function isFirefoxService(service?: string) {
  return !!service && oauthNativeServices.has(service);
}

/**
 * Resolves the `service` value to send with a sign-in or sign-up request: the
 * Firefox service name when present (e.g. 'sync'), otherwise an OAuth RP's
 * client id. The auth-server expects the client id there: it names the RP in
 * emails and decides from it whether to send the sign-in confirmation. Backend
 * Glean splits it back out into the client id field, so metrics never see a
 * client id as the service. Only for genuine OAuth integrations — a Web
 * integration's getClientId() can fall back to the first-party Settings client.
 */
export function resolveServiceOrClientId(
  integration: Parameters<typeof isOAuthIntegration>[0] & {
    getService(): string | undefined;
    getClientId(): string | undefined;
  }
): string | undefined {
  const service = integration.getService();
  if (isFirefoxService(service)) {
    return service;
  }
  return isOAuthIntegration(integration)
    ? integration.getClientId()
    : undefined;
}

const NO_LONGER_SUPPORTED_CONTEXTS = new Set([
  'fx_ios_v1',
  'fx_desktop_v1',
  'fx_desktop_v2',
  'fx_firstrun_v2',
  'iframe',
]);
export function isUnsupportedContext(context?: string): boolean {
  return !!context && NO_LONGER_SUPPORTED_CONTEXTS.has(context);
}

/**
 * Checks if the browser is probably Firefox based on the user agent string.
 * This may not catch all Firefox browsers, notably iOS devices.
 * See FXA-11520 for alternate approach.
 */
export function isProbablyFirefox(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('firefox') || ua.includes('fxios');
}
