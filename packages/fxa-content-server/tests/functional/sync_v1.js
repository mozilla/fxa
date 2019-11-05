/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

const FORCE_AUTH_PAGE_URL = `${config.fxaContentRoot}force_auth?context=fx_desktop_v1&service=sync`;
const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v1&service=sync`;
const SIGNUP_PAGE_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v1&service=sync`;
const RESET_PASSWORD_PAGE_URL = `${config.fxaContentRoot}reset_password?context=fx_desktop_v1&service=sync`;

const {
  clearBrowserState,
  click,
  openPage,
  testElementExists,
} = FunctionalHelpers;

registerSuite('Firefox Desktop Sync v1', {
  beforeEach: function() {
    return this.remote.then(clearBrowserState({ force: true }));
  },

  afterEach: function() {
    return this.remote.execute(() => {
      // Opening about:blank aborts the Firefox download
      // and prevents the tests from stalling when run on CentOS
      window.location.href = 'about:blank';
    });
  },

  tests: {
    // eslint-disable-next-line camelcase
    force_auth: function() {
      return this.remote
        .then(openPage(FORCE_AUTH_PAGE_URL, selectors.UPDATE_FIREFOX.HEADER))
        .then(click(selectors.UPDATE_FIREFOX.BUTTON_DOWNLOAD_FIREFOX))

        .then(testElementExists(selectors.DOWNLOAD_FIREFOX_THANKS.HEADER));
    },
    signin: function() {
      return this.remote
        .then(openPage(SIGNIN_PAGE_URL, selectors.UPDATE_FIREFOX.HEADER))
        .then(click(selectors.UPDATE_FIREFOX.BUTTON_DOWNLOAD_FIREFOX))

        .then(testElementExists(selectors.DOWNLOAD_FIREFOX_THANKS.HEADER));
    },
    signup: function() {
      return this.remote
        .then(openPage(SIGNUP_PAGE_URL, selectors.UPDATE_FIREFOX.HEADER))
        .then(click(selectors.UPDATE_FIREFOX.BUTTON_DOWNLOAD_FIREFOX))

        .then(testElementExists(selectors.DOWNLOAD_FIREFOX_THANKS.HEADER));
    },
    // eslint-disable-next-line camelcase
    reset_password: function() {
      return this.remote
        .then(
          openPage(RESET_PASSWORD_PAGE_URL, selectors.UPDATE_FIREFOX.HEADER)
        )
        .then(click(selectors.UPDATE_FIREFOX.BUTTON_DOWNLOAD_FIREFOX))

        .then(testElementExists(selectors.DOWNLOAD_FIREFOX_THANKS.HEADER));
    },
  },
});
