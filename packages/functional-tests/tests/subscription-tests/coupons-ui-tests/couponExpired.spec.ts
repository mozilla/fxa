/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Coupon } from '../../../pages/products';
import { expect, test } from '../subscriptionFixtures';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test expired', () => {
    test('apply an expired coupon', async ({ pages: { relier, subscribe } }, {
      project,
    }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();
      await subscribe.addCouponCode(Coupon.AUTO_EXPIRED);

      await expect(subscribe.couponErrorMessage).toHaveText(
        'The code you entered has expired.'
      );
    });
  });
});
