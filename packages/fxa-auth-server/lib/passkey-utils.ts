/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../config';
import { AppError } from '@fxa/accounts/errors';

/**
 * These helpers only read the passkeys feature flags, so they accept just that
 * slice of config — the full config is structurally compatible, and tests can
 * pass a minimal flag object.
 */
export type PasskeyFlagsConfig<K extends keyof ConfigType['passkeys']> = {
  passkeys: Pick<ConfigType['passkeys'], K>;
};

/**
 * Checks if the passkey feature is enabled.
 * @param config - The application configuration object
 * @returns true if the passkey feature is enabled and the service is available
 * @throws AppError.featureNotEnabled if the feature flag is disabled
 */
export function isPasskeyFeatureEnabled(
  config: PasskeyFlagsConfig<'enabled'>
): boolean {
  if (!config.passkeys.enabled) {
    throw AppError.featureNotEnabled();
  }
  return true;
}

/**
 * Checks if passkey registration (adding new passkeys) is enabled.
 * Requires both the master `passkeys.enabled` flag and `passkeys.registrationEnabled`.
 * Management routes (list/delete/rename) use isPasskeyFeatureEnabled instead.
 * @throws AppError.featureNotEnabled if either flag is disabled
 */
export function isPasskeyRegistrationEnabled(
  config: PasskeyFlagsConfig<'enabled' | 'registrationEnabled'>
): boolean {
  if (!config.passkeys.enabled || !config.passkeys.registrationEnabled) {
    throw AppError.featureNotEnabled();
  }
  return true;
}

/**
 * Checks if passkey authentication (sign in with passkey) is enabled.
 * Requires both the master `passkeys.enabled` flag and `passkeys.authenticationEnabled`.
 * @throws AppError.featureNotEnabled if either flag is disabled
 */
export function isPasskeyAuthenticationEnabled(
  config: PasskeyFlagsConfig<'enabled' | 'authenticationEnabled'>
): boolean {
  if (!config.passkeys.enabled || !config.passkeys.authenticationEnabled) {
    throw AppError.featureNotEnabled();
  }
  return true;
}
