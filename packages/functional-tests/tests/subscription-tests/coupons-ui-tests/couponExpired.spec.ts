/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { Coupon } from '../../../pages/products';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test expired', () => {
    test.beforeEach(() => {
      test.slow();
    });

    test('apply an expired coupon', async ({ pages: { relier, subscribe } }, {
      project,
    }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/05/13 (see FXA-9689).'
      );
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
