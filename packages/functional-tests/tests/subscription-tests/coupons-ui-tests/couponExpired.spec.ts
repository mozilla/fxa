/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';

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

      // 'autoexpired' coupon is an expired coupon for a 6mo plan
      await subscribe.addCouponCode('autoexpired');

      await expect(
        await subscribe.getCouponStatusByDataTestId('coupon-error')
      ).toBeVisible({
        timeout: 5000,
      });

      // Verifying the correct error message
      expect(await subscribe.couponErrorMessageText()).toContain(
        'The code you entered has expired'
      );
    });
  });
});
