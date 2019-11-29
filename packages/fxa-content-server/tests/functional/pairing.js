/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const selectors = require('./lib/selectors');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;

const QUERY_PARAMS =
  '?context=fx_desktop_v3&service=sync&automatedBrowser=true&action=email';
const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin${QUERY_PARAMS}`;
const REDIRECT_HOST = encodeURIComponent(config.fxaContentRoot);
const BAD_CLIENT_ID = 'dcdb5ae7add825d2';
const BAD_OAUTH_REDIRECT = `${config.fxaOAuthApp}api/oauth`;
const GOOD_CLIENT_ID = '3c49430b43dfba77';
const GOOD_PAIR_URL = `${config.fxaContentRoot}pair/supp?response_type=code&client_id=${GOOD_CLIENT_ID}&redirect_uri=${REDIRECT_HOST}oauth%2Fsuccess%2F3c49430b43dfba77&scope=profile%2Bhttps%3A%2F%2Fidentity.mozilla.com%2Fapps%2Foldsync&state=foo&code_challenge_method=S256&code_challenge=IpOAcntLUmKITcxI_rDqMvFTeC9n_g0B8_Pj2yWZp7w&access_type=offline&keys_jwk=eyJjcnYiOiJQLTI1NiIsImt0eSI6IkVDIiwieCI6ImlmcWY2U1pwMlM0ZjA5c3VhS093dmNsbWJxUm8zZXdGY0pvRURpYnc4MTQiLCJ5IjoiSE9LTXh5c1FseExqRGttUjZZbFpaY1Y4MFZBdk9nSWo1ZHRVaWJmYy1qTSJ9`; //eslint-disable-line  max-len
const BAD_PAIR_URL = `${config.fxaContentRoot}pair/supp?response_type=code&client_id=${BAD_CLIENT_ID}&redirect_uri=${BAD_OAUTH_REDIRECT}&scope=profile%2Bhttps%3A%2F%2Fidentity.mozilla.com%2Fapps%2Foldsync&state=foo&code_challenge_method=S256&code_challenge=IpOAcntLUmKITcxI_rDqMvFTeC9n_g0B8_Pj2yWZp7w&access_type=offline&keys_jwk=eyJjcnYiOiJQLTI1NiIsImt0eSI6IkVDIiwieCI6ImlmcWY2U1pwMlM0ZjA5c3VhS093dmNsbWJxUm8zZXdGY0pvRURpYnc4MTQiLCJ5IjoiSE9LTXh5c1FseExqRGttUjZZbFpaY1Y4MFZBdk9nSWo1ZHRVaWJmYy1qTSJ9`; //eslint-disable-line  max-len
const SETTINGS_URL = `${config.fxaContentRoot}settings`;

const PASSWORD = 'PASSWORD123123';
let email;

const {
  createUser,
  click,
  closeCurrentWindow,
  confirmTotpCode,
  generateTotpCode,
  openPage,
  openTab,
  switchToWindow,
  type,
  thenify,
  testElementTextInclude,
  testElementExists,
  testIsBrowserNotified,
} = FunctionalHelpers;

function getQrData(buffer) {
  return new Promise(function(resolve, reject) {
    const jsQR = require('jsqr');
    const png = require('upng-js');

    try {
      const data = png.decode(buffer);
      const out = {
        data: new Uint8ClampedArray(png.toRGBA8(data)[0]),
        height: data.height,
        width: data.width,
      };

      const code = jsQR(out.data, out.width, out.height);

      if (code) {
        return resolve(code.data);
      } else {
        return reject('No QR code found');
      }
    } catch (e) {
      return reject('Failed to read QR code', e);
    }
  });
}

const waitForQR = thenify(function() {
  let requestAttempts = 0;
  const maxAttempts = 3;
  const parent = this.parent;

  function pollForScreenshot() {
    return parent
      .sleep(1500)
      .takeScreenshot()
      .then(buffer => {
        return getQrData(buffer)
          .then(result => {
            const pairingStuff = result.split('#')[1];
            return parent.then(
              openTab(
                GOOD_PAIR_URL + '#' + pairingStuff,
                selectors.ENTER_EMAIL.HEADER
              )
            );
          })
          .catch(err => {
            requestAttempts++;
            if (requestAttempts >= maxAttempts) {
              return Promise.reject(new Error(`QRTimeout: ${err}`));
            } else {
              return new Promise(function(resolve, reject) {
                setTimeout(function() {
                  pollForScreenshot().then(resolve, reject);
                }, 1000);
              });
            }
          });
      });
  }

  return pollForScreenshot();
});

registerSuite('pairing', {
  tests: {
    'it can pair': function() {
      let secret;
      email = TestHelpers.createEmail();

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(SIGNIN_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.CONNECT_ANOTHER_DEVICE.HEADER
            )
          )
          // but the login message is sent automatically.
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(
            openPage(
              `${config.fxaContentRoot}pair`,
              selectors.PAIRING.START_PAIRING
            )
          )
          .then(click(selectors.PAIRING.START_PAIRING))

          .then(waitForQR())

          .then(switchToWindow(1))
          .then(click(selectors.PAIRING.SUPP_SUBMIT))
          .catch(err => {
            if (err.message && err.message.includes('Web element reference')) {
              // We have to catch an error here due to https://bugzilla.mozilla.org/show_bug.cgi?id=1422769
              // .click still works, but just throws for no reason. We assert below that pairing still works.
            } else {
              // if this is an unknown error, then we throw
              throw err;
            }
          })
          .then(switchToWindow(0))
          .then(click(selectors.PAIRING.AUTH_SUBMIT))

          .then(switchToWindow(1))
          .then(testElementExists(selectors.PAIRING.COMPLETE))
          .getCurrentUrl()
          .then(function(redirectResult) {
            assert.ok(
              redirectResult.includes('code='),
              'final OAuth redirect has the code'
            );
            assert.ok(
              redirectResult.includes('state='),
              'final OAuth redirect has the state'
            );
          })
          .end()
          .then(closeCurrentWindow())

          .then(openPage(SETTINGS_URL, selectors.TOTP.MENU_BUTTON))

          .then(click(selectors.TOTP.MENU_BUTTON))
          .then(click(selectors.TOTP.SHOW_CODE_LINK))

          .findByCssSelector(selectors.TOTP.MANUAL_CODE)
          .getVisibleText()
          .then(secretKey => {
            secret = secretKey;

            return this.remote.then(confirmTotpCode(secret));
          })
          .end()
          .then(
            openPage(
              `${config.fxaContentRoot}pair`,
              selectors.PAIRING.START_PAIRING
            )
          )

          .then(click(selectors.PAIRING.START_PAIRING))

          .then(waitForQR())

          .then(switchToWindow(1))

          .then(click(selectors.PAIRING.SUPP_SUBMIT))
          .catch(err => {
            if (err.message && err.message.includes('Web element reference')) {
              // We have to catch an error here due to https://bugzilla.mozilla.org/show_bug.cgi?id=1422769
              // .click still works, but just throws for no reason. We assert below that pairing still works.
            } else {
              // if this is an unknown error, then we throw
              throw err;
            }
          })
          .then(switchToWindow(0))

          .then(() => {
            return this.remote.then(
              type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret))
            );
          })
          .then(click(selectors.TOTP_SIGNIN.SUBMIT))
          .then(click(selectors.PAIRING.AUTH_SUBMIT))

          .then(switchToWindow(1))
          .then(testElementExists(selectors.PAIRING.COMPLETE))
          .getCurrentUrl()
          .then(function(redirectResult) {
            assert.ok(
              redirectResult.includes('code='),
              'final OAuth redirect has the code'
            );
            assert.ok(
              redirectResult.includes('state='),
              'final OAuth redirect has the state'
            );
          })
          .end()
          .then(closeCurrentWindow())
      );
    },

    'handles invalid clients': function() {
      return this.remote
        .then(
          openPage(
            `${BAD_PAIR_URL}#channel_id=foo&channel_key=bar`,
            selectors['400'].ERROR
          )
        )
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'Invalid pairing client'
          )
        );
    },
  },
});
