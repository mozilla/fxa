/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

// German is well translated. Avoid the EN_GB_LOCALES set, en-NZ, en-SG and
// en-MY: AppLocalizationProvider sources those from the en-GB bundle, so they
// would not prove delivery.
const LOCALE = 'de';

// Matches the plain path and the hashed path the static asset manifest points
// at, for example locales/de/main.ebcab539.ftl.
const MAIN_FTL = new RegExp(`/locales/${LOCALE}/main(\\.[0-9a-f]+)?\\.ftl$`);

test.describe('severity-1', () => {
  test.use({ locale: LOCALE });

  test(`delivers the ${LOCALE} main.ftl bundle`, async ({ target, page }) => {
    // Register the wait before navigating. A request that never happens leaves
    // this pending, so it rejects on timeout and the test fails.
    const ftlResponse = page.waitForResponse((response) =>
      MAIN_FTL.test(new URL(response.url()).pathname)
    );

    const [response] = await Promise.all([
      ftlResponse,
      page.goto(target.contentServerUrl),
    ]);

    const context = `If ${LOCALE} was dropped from the shipping locale set, this failure is correct and the fix is the locale set, not the test.`;

    expect(
      response.status(),
      `The ${LOCALE} main.ftl bundle did not return 200. ${context}`
    ).toBe(200);

    // Any message line proves the body is a bundle rather than an error page
    // served with a 200. No message id is named, so l10n churn cannot fail it.
    expect(
      await response.text(),
      `The ${LOCALE} main.ftl bundle did not look like FTL. ${context}`
    ).toMatch(/^[\w-]+\s*=/m);
  });
});
