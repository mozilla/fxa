/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EligibilityStatus } from '@fxa/payments/eligibility';
import { isCancelInterstitialOffer } from './isCancelInterstitialOffer';

describe('isCancelInterstitialOffer', () => {
  it('returns true for subscription-management entrypoint', () => {
    expect(
      isCancelInterstitialOffer(
        EligibilityStatus.UPGRADE,
        'subscription-management'
      )
    ).toBe(true);
  });

  it('returns true for subscription-management entrypoint', () => {
    expect(isCancelInterstitialOffer(EligibilityStatus.UPGRADE, 'email')).toBe(
      true
    );
  });

  it('returns false for unsupported entrypoint', () => {
    expect(
      isCancelInterstitialOffer(EligibilityStatus.UPGRADE, 'notsupported')
    ).toBe(false);
  });

  it('returns false for non upgrade eligibility', () => {
    expect(isCancelInterstitialOffer(EligibilityStatus.CREATE, 'email')).toBe(
      false
    );
  });
});
