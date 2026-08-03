/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { constructHrefWithUtm } from './constructHrefWithUtm';

describe('constructHrefWithUtm', () => {
  it('appends all UTM parameters to the pathname', () => {
    const result = constructHrefWithUtm(
      'https://vpn.mozilla.org',
      'mozilla-websites',
      'moz-account',
      'bento',
      'vpn',
      'permanent'
    );

    expect(result).toBe(
      'https://vpn.mozilla.org?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=bento&utm_content=vpn&utm_campaign=permanent'
    );
  });

  it('works with a relative path', () => {
    const result = constructHrefWithUtm(
      '/products/relay',
      'product-partnership',
      'moz-subplat',
      'sidebar',
      'relay',
      'settings-promo'
    );

    expect(result).toBe(
      '/products/relay?utm_source=moz-subplat&utm_medium=product-partnership&utm_term=sidebar&utm_content=relay&utm_campaign=settings-promo'
    );
  });
});
