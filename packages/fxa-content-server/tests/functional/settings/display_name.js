/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const assert = intern.getPlugin('chai').assert;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');
const FunctionalSettingsHelpers = require('./lib/helpers');

const { navigateToSettingsV2 } = FunctionalSettingsHelpers;
const {
  click,
  getWebChannelMessageData,
  storeWebChannelMessageData,
  testElementTextEquals,
  testElementTextInclude,
  type,
} = FunctionalHelpers.helpersRemoteWrapped;
const CHANGE_PROFILE_COMMAND = 'profile:change';

describe('display name', () => {
  let email;
  beforeEach(async ({ remote }) => {
    email = await navigateToSettingsV2(remote);
    await click(
      selectors.SETTINGS.DISPLAY_NAME.ADD_BUTTON,
      selectors.SETTINGS.DISPLAY_NAME.TEXTBOX_LABEL,
      remote
    );
    await type(
      selectors.SETTINGS.DISPLAY_NAME.TEXTBOX_FIELD,
      'Test User',
      {},
      remote
    );
  });

  it('can add a display name', async ({ remote }) => {
    await click(selectors.SETTINGS.DISPLAY_NAME.SUBMIT_BUTTON, remote);

    // Verify the saved name is displayed
    await testElementTextEquals(
      selectors.SETTINGS.DISPLAY_NAME.SAVED_DISPLAY_NAME,
      'Test User',
      remote
    );

    // Also check the avatar dropdown displays the saved name
    await click(selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON, remote);
    await testElementTextInclude(
      selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.DISPLAY_NAME_LABEL,
      'Test User',
      remote
    );
  });

  it('can click cancel and not add a display name', async ({ remote }) => {
    // Click cancel without providing a display name
    await click(
      selectors.SETTINGS.DISPLAY_NAME.CANCEL_BUTTON,
      selectors.SETTINGS.HEADER,
      remote
    );

    // Verify the display name is not saved
    await testElementTextEquals(
      selectors.SETTINGS.DISPLAY_NAME.SAVED_DISPLAY_NAME,
      'None',
      remote
    );

    // Also check the avatar dropdown displays the email id
    await click(selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON, remote);
    await testElementTextInclude(
      selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.DISPLAY_NAME_LABEL,
      email,
      remote
    );
  });

  it('can change a display name', async ({ remote }) => {
    await storeWebChannelMessageData(CHANGE_PROFILE_COMMAND, remote);
    await click(selectors.SETTINGS.DISPLAY_NAME.SUBMIT_BUTTON, remote);

    // Click change and change the display name
    await click(selectors.SETTINGS.DISPLAY_NAME.ADD_BUTTON, remote);
    await type(
      selectors.SETTINGS.DISPLAY_NAME.TEXTBOX_FIELD,
      'New User',
      {},
      remote
    );
    await click(selectors.SETTINGS.DISPLAY_NAME.SUBMIT_BUTTON, remote);
    const msg = await getWebChannelMessageData(CHANGE_PROFILE_COMMAND, remote);
    assert.equal(msg.command, CHANGE_PROFILE_COMMAND);
    assert.isString(msg.data.uid);
    // Verify the saved name is displayed
    await testElementTextEquals(
      selectors.SETTINGS.DISPLAY_NAME.SAVED_DISPLAY_NAME,
      'New User',
      remote
    );

    // Also check the avatar dropdown displays the saved name
    await click(selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON, remote);
    await testElementTextInclude(
      selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.DISPLAY_NAME_LABEL,
      'New User',
      remote
    );
  });

  it('can click cancel and not change display name', async ({ remote }) => {
    await click(selectors.SETTINGS.DISPLAY_NAME.SUBMIT_BUTTON, remote);

    // Click change to change the display name
    await click(selectors.SETTINGS.DISPLAY_NAME.ADD_BUTTON, remote);
    await type(
      selectors.SETTINGS.DISPLAY_NAME.TEXTBOX_FIELD,
      'New User',
      {},
      remote
    );

    // Click cancel and don't save the new display name
    await click(selectors.SETTINGS.DISPLAY_NAME.CANCEL_BUTTON, remote);
    // Verify the previous name is displayed
    await testElementTextEquals(
      selectors.SETTINGS.DISPLAY_NAME.SAVED_DISPLAY_NAME,
      'Test User',
      remote
    );

    // Also check the avatar dropdown displays the saved name
    await click(selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON, remote);
    await testElementTextInclude(
      selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.DISPLAY_NAME_LABEL,
      'Test User',
      remote
    );
  });

  it('can remove a display name', async ({ remote }) => {
    await click(selectors.SETTINGS.DISPLAY_NAME.SUBMIT_BUTTON, remote);

    // Click change to change the display name
    await click(selectors.SETTINGS.DISPLAY_NAME.ADD_BUTTON, remote);
    await type(selectors.SETTINGS.DISPLAY_NAME.TEXTBOX_FIELD, '', {}, remote);

    // Click submit without providing a display name
    await click(selectors.SETTINGS.DISPLAY_NAME.SUBMIT_BUTTON, remote);
    // Verify there is no display name
    await testElementTextEquals(
      selectors.SETTINGS.DISPLAY_NAME.SAVED_DISPLAY_NAME,
      'None',
      remote
    );

    // Also check the avatar dropdown displays email id
    await click(selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON, remote);
    await testElementTextInclude(
      selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.DISPLAY_NAME_LABEL,
      email,
      remote
    );
  });
});
