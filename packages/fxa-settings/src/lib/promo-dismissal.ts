/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
import { Constants } from './constants';

export const isRecoveryPhonePromoDismissed = () =>
  typeof window !== 'undefined' &&
  !!localStorage.getItem(Constants.DISABLE_PROMO_RECOVERY_PHONE_BANNER);

export const isRecoveryKeyPromoDismissed = () =>
  typeof window !== 'undefined' &&
  !!localStorage.getItem(Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_BANNER);
