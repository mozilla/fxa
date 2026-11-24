/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('signin bounced and report signin Glean events', () => {
    test('report_signin and signin_reported send their view events', async ({
      target,
      page,
      gleanEventsHelper,
    }) => {
      await page.goto(
        `${target.contentServerUrl}/report_signin?uid=${'a'.repeat(32)}&unblockCode=ABCD1234`
      );
      await gleanEventsHelper.waitForEvent('login_report_signin_view');
      expect(
        gleanEventsHelper.getEventsByName('login_report_signin_view')
      ).toHaveLength(1);

      await page.goto(`${target.contentServerUrl}/signin_reported`);
      await gleanEventsHelper.waitForEvent('login_signin_reported_view');
      expect(
        gleanEventsHelper.getEventsByName('login_signin_reported_view')
      ).toHaveLength(1);
    });

    test('signin_bounced sends its view event with no email', async ({
      target,
      page,
      gleanEventsHelper,
    }) => {
      await page.goto(`${target.contentServerUrl}/signin_bounced`);
      await gleanEventsHelper.waitForEvent('login_signin_bounced_view');
      expect(
        gleanEventsHelper.getEventsByName('login_signin_bounced_view')
      ).toHaveLength(1);
    });
  });
});
