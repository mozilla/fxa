/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const intern = require('intern').default;
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');
const selectors = require('../lib/selectors');
const FunctionalHelpers = require('../lib/helpers');

const config = intern._config;
const EMAIL_FIRST = config.fxaContentRoot;
const password = 'passwordzxcv';

const { createEmail } = FunctionalHelpers;

const {
  clearBrowserState,
  click,
  createUser,
  openPage,
  fillOutEmailFirstSignIn,
  testElementExists,
} = FunctionalHelpers.helpersRemoteWrapped;

describe('navigation', () => {
  let email;
  beforeEach(async ({ remote }) => {
    email = createEmail();
    await clearBrowserState(remote);
    await createUser(email, password, { preVerified: true }, remote);

    await openPage(EMAIL_FIRST, selectors.ENTER_EMAIL.HEADER, remote);
    await fillOutEmailFirstSignIn(email, password, remote);
  });

  // it('can click avatar menu add button and back', async ({ remote }) => {
  //   await click(
  //     selectors.SETTINGS_V2.PICTURE_MENU.ADD_BUTTON,
  //     selectors.SETTINGS_V2.PICTURE_MENU.HEADER,
  //     remote
  //   );
  //   await click(
  //     selectors.SETTINGS_V2.PICTURE_MENU.BACK_BUTTON,
  //     selectors.SETTINGS_V2.HEADER,
  //     remote
  //   );
  // });

  it('can click display picture menu add button and back', async ({
    remote,
  }) => {
    await click(
      selectors.SETTINGS_V2.DISPLAY_NAME.ADD_BUTTON,
      selectors.SETTINGS_V2.DISPLAY_NAME.TEXTBOX_LABEL,
      remote
    );
    await click(
      selectors.SETTINGS_V2.DISPLAY_NAME.BACK_BUTTON,
      selectors.SETTINGS_V2.HEADER,
      remote
    );
  });

  it('can click secondary email menu add button and back', async ({
    remote,
  }) => {
    await click(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.ADD_BUTTON,
      selectors.SETTINGS_V2.SECONDARY_EMAIL.TEXTBOX,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECONDARY_EMAIL.BACK_BUTTON,
      selectors.SETTINGS_V2.HEADER,
      remote
    );
  });

  it('can click security menu', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.SECURITY.MENU,
      selectors.SETTINGS_V2.SECURITY.TFA.ADD_BUTTON,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.CREATE,
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX,
      remote
    );
    await click(
      selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.BACK_BUTTON,
      selectors.SETTINGS_V2.SECURITY.HEADER,
      remote
    );
  });

  it('can click connected services menu', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.CONNECTED_SERVICES.MENU,
      selectors.SETTINGS_V2.CONNECTED_SERVICES.HEADER,
      remote
    );
  });

  it('can sign out', async ({ remote }) => {
    await click(
      selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
      selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.DISPLAY_NAME_LABEL,
      remote
    );
    await click(
      selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
      selectors.ENTER_EMAIL.HEADER,
      remote
    );
    await testElementExists(selectors.ENTER_EMAIL.HEADER, remote);
  });
});
