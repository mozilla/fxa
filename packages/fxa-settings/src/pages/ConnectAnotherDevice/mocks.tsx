/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Devices } from '.';
import { ENTRYPOINTS } from '../../constants';
import { MOCK_ACCOUNT } from '../../models/mocks';

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
