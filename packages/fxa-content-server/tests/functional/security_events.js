/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const FxaClient = require('fxa-js-client');
const nodeXMLHttpRequest = require('xmlhttprequest');
const selectors = require('./lib/selectors');
const TestHelpers = require('../lib/helpers');

const {
  clearBrowserState,
  click,
  createUser,
  fillOutCompleteResetPassword,
  fillOutSignIn,
  getVerificationLink,
  noSuchElement,
  openPage,
  testElementExists,
  testElementTextInclude,
  thenify,
} = FunctionalHelpers;

const config = intern._config;
const AUTH_SERVER_ROOT = config.fxaAuthRoot;
const SECURITY_EVENTS_URL = `${config.fxaContentRoot}security_events`;
const COMPLETE_PAGE_URL_ROOT =
  config.fxaContentRoot + 'complete_reset_password';

const PASSWORD = 'passwordzxcv';
const TIMEOUT = 90 * 1000;

let client;
let code;
let email;
let token;

function ensureFxaJSClient() {
  if (!client) {
    client = new FxaClient(AUTH_SERVER_ROOT, {
      xhr: nodeXMLHttpRequest.XMLHttpRequest,
    });
  }
}

const initiateResetPassword = thenify(function(emailAddress, emailNumber) {
  ensureFxaJSClient();

  return this.parent
    .then(() => client.passwordForgotSendCode(emailAddress))
    .then(getVerificationLink(emailAddress, emailNumber))
    .then(link => {
      // token and code are hex values
      token = link.match(/token=([a-f\d]+)/)[1];
      code = link.match(/code=([a-f\d]+)/)[1];
    });
});

const openCompleteResetPassword = thenify(function(email, token, code, header) {
  let url = COMPLETE_PAGE_URL_ROOT + '?';

  const queryParams = [];
  if (email) {
    queryParams.push('email=' + encodeURIComponent(email));
  }

  if (token) {
    queryParams.push('token=' + encodeURIComponent(token));
  }

  if (code) {
    queryParams.push('code=' + encodeURIComponent(code));
  }

  url += queryParams.join('&');
  return this.parent.then(openPage(url, header));
});

registerSuite('security_events', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(initiateResetPassword(email, 0))
      .then(clearBrowserState());
  },

  tests: {
    'gets security events table': function() {
      return this.remote
        .then(fillOutSignIn(email, PASSWORD, true))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(
            SECURITY_EVENTS_URL,
            selectors.SECURITY_EVENTS.RECENT_ACTIVITY_HEADER
          )
        )
        .then(
          testElementExists(selectors.SECURITY_EVENTS.SECURITY_EVENTS_HEADER)
        );
    },

    'login event is shown': function() {
      return this.remote
        .then(fillOutSignIn(email, PASSWORD, true))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(
            SECURITY_EVENTS_URL,
            selectors.SECURITY_EVENTS.RECENT_ACTIVITY_HEADER
          )
        )
        .then(
          testElementTextInclude(
            selectors.SECURITY_EVENTS.FIRST_EVENT_NAME,
            'account.login'
          )
        );
    },

    'reset event is shown': function() {
      this.timeout = TIMEOUT;

      return this.remote
        .then(
          openCompleteResetPassword(
            email,
            token,
            code,
            selectors.COMPLETE_RESET_PASSWORD.HEADER
          )
        )
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openCompleteResetPassword(
            email,
            token,
            code,
            selectors.COMPLETE_RESET_PASSWORD.EXPIRED_LINK_HEADER
          )
        )

        .then(click(selectors.CONFIRM_RESET_PASSWORD.LINK_RESEND))

        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

        .then(
          openPage(
            SECURITY_EVENTS_URL,
            selectors.SECURITY_EVENTS.RECENT_ACTIVITY_HEADER
          )
        )
        .then(
          testElementTextInclude(
            selectors.SECURITY_EVENTS.FIRST_EVENT_NAME,
            'account.reset'
          )
        );
    },

    'delete security events': function() {
      return this.remote
        .then(fillOutSignIn(email, PASSWORD, true))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(
            SECURITY_EVENTS_URL,
            selectors.SECURITY_EVENTS.RECENT_ACTIVITY_HEADER
          )
        )
        .then(
          testElementTextInclude(
            selectors.SECURITY_EVENTS.FIRST_EVENT_NAME,
            'account.login'
          )
        )
        .then(testElementExists(selectors.SECURITY_EVENTS.DELETE_EVENTS_BUTTON))
        .then(click(selectors.SECURITY_EVENTS.DELETE_EVENTS_BUTTON))
        .then(noSuchElement(selectors.SECURITY_EVENTS.SECURITY_EVENT));
    },
  },
});
