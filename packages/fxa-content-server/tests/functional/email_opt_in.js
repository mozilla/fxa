/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const PAGE_URL = intern._config.fxaContentRoot + '?action=email';

let email;
const PASSWORD = '12345678';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  switchToWindow,
  thenify,
} = FunctionalHelpers;

const waitForUrlChangeFromAboutBlank = thenify(function() {
  return this.parent.getCurrentUrl().then(function(currentUrl) {
    if (currentUrl === 'about:blank') {
      return this.parent.sleep(500).then(waitForUrlChangeFromAboutBlank());
    }
  });
});

// okay, not remote so run these for real.
registerSuite('communication preferences', {
  beforeEach: function() {
    // The plus sign is to ensure the email address is URI-encoded when
    // passed to basket. See a43061d3
    email = TestHelpers.createEmail('signup{id}+extra');
    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'open manage link': function() {
      return this.remote
        .then(openPage(PAGE_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(click(selectors.SETTINGS_COMMUNICATION.BUTTON_MANAGE))

        .then(switchToWindow(1))
        .then(waitForUrlChangeFromAboutBlank())
        .getCurrentUrl()
        .then(url => {
          assert.include(url, `email=${encodeURIComponent(email)}`);
        })
        .end()
        .then(closeCurrentWindow());
    },
  },
});
