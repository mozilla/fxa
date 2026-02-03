/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../config';
import { AppError } from '@fxa/accounts/errors';

/**
 * Checks if the passkey feature is enabled in the configuration
 * @param config - The application configuration object
 * @returns true if the passkey feature is enabled
 * @throws AppError.featureNotEnabled if the feature is disabled
 */
export function isPasskeyFeatureEnabled(config: ConfigType): boolean {
  if (!config.passkeys.enabled) {
    throw AppError.featureNotEnabled();
  }
  return true;
}
