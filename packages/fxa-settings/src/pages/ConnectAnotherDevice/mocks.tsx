/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Devices } from '.';
import { ENTRYPOINTS } from '../../constants';
import { getDefault } from '../../lib/config';
import { SignedInUser } from '../../lib/channels/firefox';
import { AppContextValue } from '../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../models/mocks';

export const MOCK_DEFAULTS = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  entrypoint: ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT,
  device: Devices.FIREFOX_DESKTOP,
};

export const MOCK_BASIC_PROPS = {
  ...MOCK_DEFAULTS,
  showSuccessMessage: true,
  isSignedIn: true,
  canSignIn: false,
};

export const MOCK_DEVICE_BASIC_PROPS = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  entrypoint: ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT,
  showSuccessMessage: true,
  isSignIn: false,
  isSignUp: true,
  isSignedIn: true,
  canSignIn: false,
};

/**
 * A route that satisfies `isEligibleForPairing`: a Sync web channel context
 * plus a Firefox-chrome entrypoint. Without both, the bootstrap effect never
 * reaches the pairing branch.
 */
export const MOCK_PAIRING_ELIGIBLE_ROUTE = `/connect_another_device?context=oauth_webchannel_v1&entrypoint=${ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}`;

/** A browser account that `isEligibleForPairing` treats as signed in. */
export const MOCK_BROWSER_SIGNED_IN_USER: SignedInUser = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  sessionToken: 'a'.repeat(64),
  uid: MOCK_ACCOUNT.uid,
  verified: true,
};

/** App context with the FxA-side pairing version pinned to `version`. */
export function mockPairingAppContext(version: number): AppContextValue {
  const config = getDefault();
  return mockAppContext({
    config: {
      ...config,
      pairing: { ...config.pairing, version },
    },
  } as AppContextValue);
}
