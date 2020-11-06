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
  let click, getEmailCode, testElementExists, testElementTextInclude, type;

  beforeEach(async ({ remote }) => {
    ({
      click,
      getEmailCode,
      testElementExists,
      testElementTextInclude,
      type,
    } = FunctionalHelpers.applyRemote(remote));
    primaryEmail = await navigateToSettingsV2(remote);
  });

  it('can add and verify secondary email', async () => {
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.ADD_BUTTON);

    // try adding the primary as the secondary
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_LABEL);
    await type(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_FIELD,
      primaryEmail
    );
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.SUBMIT_BUTTON);
    await testElementTextInclude(
      selectors.SETTINGS_V2.TOOLTIP,
      'Can not add secondary email that is same as your primary'
    );

    // add secondary email, resend, remove
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_LABEL);
    await type(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_FIELD,
      secondaryEmail
    );
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.SUBMIT_BUTTON);
    await testElementTextInclude(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.FORM,
      secondaryEmail
    );
    await click(selectors.SETTINGS_V2.BACK_BUTTON);
    await testElementTextInclude(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.HEADER_VALUE,
      secondaryEmail
    );
    await testElementTextInclude(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.HEADER_VALUE,
      'unverified'
    );
    await testElementExists(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.DELETE_BUTTON
    );
    await testElementExists(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.REFRESH_BUTTON
    );
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.DELETE_BUTTON);

    // add and verify
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.ADD_BUTTON);
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_LABEL);
    await type(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_FIELD,
      secondaryEmail
    );
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.SUBMIT_BUTTON);
    const verifyCode = await getEmailCode(secondaryEmail, 1);
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_LABEL);
    await type(selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX_FIELD, verifyCode);
    await click(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_SUBMIT_BUTTON
    );
    await testElementExists(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.DELETE_BUTTON
    );
    await testElementExists(selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY);

    // swap primary and secondary
    await click(selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY);
    await testElementTextInclude(
      selectors.SETTINGS_V2.PRIMARY_EMAIL.HEADER_VALUE,
      secondaryEmail
    );
    await testElementTextInclude(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.HEADER_VALUE,
      primaryEmail
    );
  });
});
