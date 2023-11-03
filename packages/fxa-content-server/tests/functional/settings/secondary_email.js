/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const { createEmail } = FunctionalHelpers;
const FunctionalSettingsHelpers = require('./lib/helpers');
const { navigateToSettingsV2 } = FunctionalSettingsHelpers;

describe('secondary email', () => {
  let primaryEmail;
  const secondaryEmail = createEmail();
  let click,
    getEmailCode,
    testElementExists,
    testElementTextInclude,
    type,
    visibleByQSA;

  beforeEach(async ({ remote }) => {
    ({
      click,
      getEmailCode,
      testElementExists,
      testElementTextInclude,
      type,
      visibleByQSA,
    } = FunctionalHelpers.applyRemote(remote));
    primaryEmail = await navigateToSettingsV2(remote);
  });

  it('can add and verify secondary email', async () => {
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.ADD_BUTTON,
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_LABEL
    );

    // try adding the primary as the secondary
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_LABEL,
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_FIELD
    );
    await type(selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_FIELD, primaryEmail);
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.SUBMIT_BUTTON,
      selectors.SETTINGS.TOOLTIP
    );
    await testElementTextInclude(
      selectors.SETTINGS.TOOLTIP,
      'secondary email must be different than your account email'
    );

    // add secondary email, resend, remove
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_LABEL,
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_FIELD
    );
    await type(selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_FIELD, secondaryEmail);
    await click(selectors.SETTINGS.SECONDARY_EMAIL.SUBMIT_BUTTON);
    await testElementTextInclude(
      selectors.SETTINGS.SECONDARY_EMAIL.FORM,
      secondaryEmail
    );
    await click(
      selectors.SETTINGS.BACK_BUTTON,
      selectors.SETTINGS.SECONDARY_EMAIL.HEADER_VALUE
    );
    await testElementTextInclude(
      selectors.SETTINGS.SECONDARY_EMAIL.HEADER_VALUE,
      secondaryEmail
    );
    await testElementTextInclude(
      selectors.SETTINGS.SECONDARY_EMAIL.HEADER_VALUE,
      'unconfirmed'
    );
    await testElementExists(selectors.SETTINGS.SECONDARY_EMAIL.DELETE_BUTTON);
    await testElementExists(selectors.SETTINGS.SECONDARY_EMAIL.REFRESH_BUTTON);
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.DELETE_BUTTON,
      selectors.SETTINGS.SECONDARY_EMAIL.ADD_BUTTON
    );

    // add and verify
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.ADD_BUTTON,
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_LABEL
    );
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_LABEL,
      selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_FIELD
    );
    await type(selectors.SETTINGS.SECONDARY_EMAIL.EMAIL_FIELD, secondaryEmail);
    await click(selectors.SETTINGS.SECONDARY_EMAIL.SUBMIT_BUTTON);
    const verifyCode = await getEmailCode(secondaryEmail, 1);
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.VERIFY_FORM_LABEL,
      selectors.SETTINGS.SECONDARY_EMAIL.VERIFY_FIELD
    );
    await type(selectors.SETTINGS.SECONDARY_EMAIL.VERIFY_FIELD, verifyCode);
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.VERIFY_FORM_SUBMIT_BUTTON,
      selectors.SETTINGS.SECONDARY_EMAIL.DELETE_BUTTON
    );
    await testElementExists(selectors.SETTINGS.SECONDARY_EMAIL.DELETE_BUTTON);
    await testElementExists(selectors.SETTINGS.SECONDARY_EMAIL.MAKE_PRIMARY);

    // swap primary and secondary
    await click(
      selectors.SETTINGS.SECONDARY_EMAIL.MAKE_PRIMARY,
      selectors.EMAIL.SUCCESS
    );
    await visibleByQSA(selectors.EMAIL.SUCCESS);
    await testElementTextInclude(
      selectors.SETTINGS.PRIMARY_EMAIL.HEADER_VALUE,
      secondaryEmail
    );
    await testElementTextInclude(
      selectors.SETTINGS.SECONDARY_EMAIL.HEADER_VALUE,
      primaryEmail
    );
  });
});
