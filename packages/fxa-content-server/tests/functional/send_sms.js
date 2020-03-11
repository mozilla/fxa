/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const ADJUST_LINK_ANDROID =
  'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
  'creative=button-autumn-2016-connect-another-device&adgroup=android';

const ADJUST_LINK_IOS =
  'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
  'creative=button-autumn-2016-connect-another-device&adgroup=ios&' +
  'fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&' +
  'ct=adjust_tracker&mt=8';

const ENTER_EMAIL_URL = config.fxaContentRoot;
const SEND_SMS_URL = `${config.fxaContentRoot}sms?service=sync&country=US`;
const SEND_SMS_SIGNIN_CODE_URL = `${SEND_SMS_URL}&forceExperiment=sendSms&forceExperimentGroup=signinCodes`;
const SEND_SMS_HEADER_URL = `${SEND_SMS_URL}&forceExperiment=sendSmsHeader`;
const SEND_SMS_NO_QUERY_URL = `${config.fxaContentRoot}sms`;

let email;
const PASSWORD = 'passwordzxcv';

let testPhoneNumber;
let formattedPhoneNumber;

const {
  click,
  clearBrowserState,
  closeCurrentWindow,
  createEmail,
  createPhoneNumber,
  deleteAllSms,
  disableInProd,
  fillOutEmailFirstSignUp,
  getSms,
  getSmsSigninCode,
  testElementDisabled,
  noSuchElement,
  openPage,
  switchToWindow,
  testAttributeEquals,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testHrefEquals,
  type,
} = FunctionalHelpers;

function testSmsSupportedCountryForm(country, expectedPrefix) {
  return function() {
    return this.remote
      .then(
        openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER, {
          query: { country },
        })
      )
      .then(
        testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, expectedPrefix)
      )
      .then(
        testAttributeEquals(
          selectors.SMS_SEND.PHONE_NUMBER,
          'data-country',
          country
        )
      )
      .then(noSuchElement(selectors.SMS_SEND.SUCCESS));
  };
}

function disableSmsTypeValidation() {
  const phoneNumber = document.querySelector('.phone-number');
  phoneNumber.disableValidation = true;
  phoneNumber.dispatchEvent(
    new Event('input', {
      bubbles: true,
      cancelable: true,
    })
  );

  return true;
}

const suite = {
  beforeEach: function() {
    email = createEmail();
    testPhoneNumber = createPhoneNumber();
    formattedPhoneNumber = `${testPhoneNumber.substr(
      0,
      3
    )}-${testPhoneNumber.substr(3, 3)}-${testPhoneNumber.substr(6)}`;

    // User needs a sessionToken to be able to send an SMS. Sign up,
    // no need to verify.
    return (
      this.remote
        .then(clearBrowserState({ force: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        // The phoneNumber can be reused by different tests, delete all
        // of its SMS messages to ensure a clean slate.
        .then(deleteAllSms(testPhoneNumber))
    );
  },
  tests: {
    'displays expected header with `syncPhone` experiment group': function() {
      return this.remote
        .then(
          openPage(SEND_SMS_HEADER_URL, selectors.SMS_SEND.HEADER, {
            query: {
              forceExperimentGroup: 'syncPhone',
            },
          })
        )
        .then(
          testElementTextInclude(
            selectors.SMS_SEND.PROMPT_HEADER,
            'Would you like to sync your phone?'
          )
        );
    },
    'displays expected header with `syncBrowser` experiment group': function() {
      return this.remote
        .then(
          openPage(SEND_SMS_HEADER_URL, selectors.SMS_SEND.HEADER, {
            query: {
              forceExperimentGroup: 'syncBrowser',
            },
          })
        )
        .then(
          testElementTextInclude(
            selectors.SMS_SEND.PROMPT_HEADER,
            'Sync this browser with your phone'
          )
        );
    },
    'with no query parameters': function() {
      return this.remote
        .then(openPage(SEND_SMS_NO_QUERY_URL, selectors.SMS_SEND.HEADER))
        .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, ''))
        .then(
          testAttributeEquals(
            selectors.SMS_SEND.PHONE_NUMBER,
            'data-country',
            'US'
          )
        )
        .then(
          testHrefEquals(selectors.SMS_SEND.LINK_MARKETING_IOS, ADJUST_LINK_IOS)
        )
        .then(
          testHrefEquals(
            selectors.SMS_SEND.LINK_MARKETING_ANDROID,
            ADJUST_LINK_ANDROID
          )
        );
    },

    'with no service, unsupported country': function() {
      return (
        this.remote
          .then(
            openPage(SEND_SMS_NO_QUERY_URL, selectors.SMS_SEND.HEADER, {
              query: {
                country: 'KZ',
              },
            })
          )
          // The Sync relier validates `country`, this uses the base relier
          // so country is ignored.
          .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, ''))
          .then(
            testAttributeEquals(
              selectors.SMS_SEND.PHONE_NUMBER,
              'data-country',
              'US'
            )
          )
      );
    },

    'with `country=AT`': testSmsSupportedCountryForm('AT', '+43'),
    'with `country=AU`': testSmsSupportedCountryForm('AU', '+61'),
    'with `country=BE`': testSmsSupportedCountryForm('BE', '+32'),
    'with `country=CA`': testSmsSupportedCountryForm('CA', ''),
    'with `country=DE`': testSmsSupportedCountryForm('DE', '+49'),
    'with `country=DK`': testSmsSupportedCountryForm('DK', '+45'),
    'with `country=ES`': testSmsSupportedCountryForm('ES', '+34'),
    'with `country=FR`': testSmsSupportedCountryForm('FR', '+33'),
    'with `country=GB`': testSmsSupportedCountryForm('GB', '+44'),
    'with `country=IT`': testSmsSupportedCountryForm('IT', '+39'),
    'with `country=LU`': testSmsSupportedCountryForm('LU', '+352'),
    'with `country=NL`': testSmsSupportedCountryForm('NL', '+31'),
    'with `country=PT`': testSmsSupportedCountryForm('PT', '+351'),
    'with `country=RO`': testSmsSupportedCountryForm('RO', '+40'),
    'with `country=US`': testSmsSupportedCountryForm('US', ''),

    'with an unsupported `country`': function() {
      return this.remote
        .then(
          openPage(SEND_SMS_URL, selectors['400'].HEADER, {
            query: {
              country: 'KZ',
            },
          })
        )
        .then(testElementTextInclude(selectors['400'].ERROR, 'country'));
    },

    'learn more': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
        .then(click(selectors.SMS_SEND.LINK_LEARN_MORE))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.SMS_LEARN_MORE.HEADER))
        .then(closeCurrentWindow());
    },

    'why is this required': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(click(selectors.SMS_SEND.LINK_WHY_IS_THIS_REQUIRED))

        .then(testElementExists(selectors.SMS_WHY_IS_THIS_REQUIRED.HEADER))
        .then(click(selectors.SMS_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(testElementExists(selectors.SMS_SEND.HEADER));
    },

    'not now': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(testElementExists(selectors.SMS_SEND.LINK_NOT_NOW));
    },

    'empty phone number': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(testElementDisabled(selectors.SMS_SEND.SUBMIT));
    },

    'invalid phone number (too short)': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, '2134567'))
        .then(testElementDisabled(selectors.SMS_SEND.SUBMIT));
    },

    'invalid phone number (too long)': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, '21345678901'))
        .then(testElementDisabled(selectors.SMS_SEND.SUBMIT));
    },

    'invalid phone number (contains letters)': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, '2134567a890'))
        .then(testElementDisabled(selectors.SMS_SEND.SUBMIT));
    },

    'empty phone number with input-change validation disabled': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .execute(disableSmsTypeValidation)
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
        .then(
          testElementTextInclude(
            selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP,
            'required'
          )
        );
    },

    'invalid phone number with input-change validation disabled': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .execute(disableSmsTypeValidation)
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, '298sdv1k9'))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
        .then(
          testElementTextInclude(
            selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP,
            'invalid'
          )
        );
    },

    'invalid phone number (that looks correct, but fails server validation)': function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, '1 223 123 1234'))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
        .then(
          testElementTextInclude(
            selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP,
            'invalid'
          )
        );
    },

    'valid phone number, back': disableInProd(function() {
      return (
        this.remote
          .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
          .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
          .then(click(selectors.SMS_SEND.SUBMIT))
          .then(testElementExists(selectors.SMS_SENT.HEADER))
          .then(
            testElementTextInclude(
              selectors.SMS_SENT.PHONE_NUMBER_SENT_TO,
              formattedPhoneNumber
            )
          )
          .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
          .then(getSms(testPhoneNumber, 0))

          // user realizes they made a mistake
          .then(click(selectors.SMS_SENT.LINK_BACK))
          .then(testElementExists(selectors.SMS_SEND.HEADER))

          // original phone number should still be in place
          .then(
            testElementValueEquals(
              selectors.SMS_SEND.PHONE_NUMBER,
              testPhoneNumber
            )
          )
      );
    }),

    'valid phone number, resend': disableInProd(function() {
      return (
        this.remote
          .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
          .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
          .then(click(selectors.SMS_SEND.SUBMIT))
          .then(testElementExists(selectors.SMS_SENT.HEADER))
          .then(getSms(testPhoneNumber, 0))

          .then(click(selectors.SMS_SENT.LINK_RESEND))
          .then(
            testElementTextInclude(
              selectors.SMS_SENT.PHONE_NUMBER_SENT_TO,
              formattedPhoneNumber
            )
          )
          .then(getSms(testPhoneNumber, 1))

          // user realizes they made a mistake
          .then(click(selectors.SMS_SENT.LINK_BACK))
          .then(testElementExists(selectors.SMS_SEND.HEADER))

          // original phone number should still be in place
          .then(
            testElementValueEquals(
              selectors.SMS_SEND.PHONE_NUMBER,
              testPhoneNumber
            )
          )
      );
    }),

    'valid phone number, enable signinCode': disableInProd(function() {
      return this.remote
        .then(openPage(SEND_SMS_SIGNIN_CODE_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(getSmsSigninCode(testPhoneNumber, 0));
    }),

    'valid phone number w/ country code of 1': disableInProd(function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, `1${testPhoneNumber}`))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(
          testElementTextInclude(
            selectors.SMS_SENT.PHONE_NUMBER_SENT_TO,
            formattedPhoneNumber
          )
        )
        .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
        .then(getSms(testPhoneNumber, 0));
    }),

    'valid phone number w/ country code of +1': disableInProd(function() {
      return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, `+1${testPhoneNumber}`))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(
          testElementTextInclude(
            selectors.SMS_SENT.PHONE_NUMBER_SENT_TO,
            formattedPhoneNumber
          )
        )
        .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
        .then(getSms(testPhoneNumber, 0));
    }),

    'valid phone number (contains spaces and punctuation)': disableInProd(
      function() {
        const unformattedPhoneNumber = ` ${testPhoneNumber.slice(
          0,
          3
        )} .,- ${testPhoneNumber.slice(3)} `;
        return (
          this.remote
            .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
            .then(type(selectors.SMS_SEND.PHONE_NUMBER, unformattedPhoneNumber))
            .then(click(selectors.SMS_SEND.SUBMIT))
            .then(testElementExists(selectors.SMS_SENT.HEADER))
            .then(
              testElementTextInclude(
                selectors.SMS_SENT.PHONE_NUMBER_SENT_TO,
                formattedPhoneNumber
              )
            )
            .then(getSms(testPhoneNumber, 0))

            // user realizes they made a mistake
            .then(click(selectors.SMS_SENT.LINK_BACK))
            .then(testElementExists(selectors.SMS_SEND.HEADER))

            // original phone number should still be in place
            .then(
              testElementValueEquals(
                selectors.SMS_SEND.PHONE_NUMBER,
                unformattedPhoneNumber
              )
            )
        );
      }
    ),
  },
};

registerSuite('send_sms', suite);
