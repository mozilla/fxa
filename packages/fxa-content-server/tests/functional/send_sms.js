/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


 define([
   'intern',
   'intern!object',
   'tests/lib/helpers',
   'tests/functional/lib/helpers',
   'tests/functional/lib/selectors',
   'app/scripts/lib/country-telephone-info'
 ], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors, CountryTelephoneInfo) {
   'use strict';

   const config = intern.config;

   const ADJUST_LINK_ANDROID =
    'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
    'creative=button-autumn-2016-connect-another-device&adgroup=android';

   const ADJUST_LINK_IOS =
    'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
    'creative=button-autumn-2016-connect-another-device&adgroup=ios&' +
    'fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&' +
    'ct=adjust_tracker&mt=8';


   const SEND_SMS_URL = `${config.fxaContentRoot}sms?service=sync&country=US`;
   const SEND_SMS_SIGNIN_CODE_URL = `${SEND_SMS_URL}&signinCodes=true`;
   const SEND_SMS_NO_QUERY_URL = `${config.fxaContentRoot}sms`;


   let email;
   const PASSWORD = 'password';

   let testPhoneNumber;
   let formattedPhoneNumber;

   const click = FunctionalHelpers.click;
   const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
   const deleteAllSms = FunctionalHelpers.deleteAllSms;
   const disableInProd = FunctionalHelpers.disableInProd;
   const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
   const getSms = FunctionalHelpers.getSms;
   const getSmsSigninCode = FunctionalHelpers.getSmsSigninCode;
   const openPage = FunctionalHelpers.openPage;
   const switchToWindow = FunctionalHelpers.switchToWindow;
   const testAttributeEquals = FunctionalHelpers.testAttributeEquals;
   const testElementExists = FunctionalHelpers.testElementExists;
   const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
   const testElementValueEquals = FunctionalHelpers.testElementValueEquals;
   const testHrefEquals = FunctionalHelpers.testHrefEquals;
   const type = FunctionalHelpers.type;

   const suite = {
     name: 'send_sms',

     beforeEach: function () {
       email = TestHelpers.createEmail();
       testPhoneNumber = TestHelpers.createPhoneNumber();
       const countryInfo = CountryTelephoneInfo['US'];
       formattedPhoneNumber =
          countryInfo.format(countryInfo.normalize(testPhoneNumber));

       // User needs a sessionToken to be able to send an SMS. Sign up,
       // no need to verify.
       return this.remote
         .then(fillOutSignUp(email, PASSWORD))
         .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
         // The phoneNumber can be reused by different tests, delete all
         // of its SMS messages to ensure a clean slate.
         .then(deleteAllSms(testPhoneNumber));
     },

     'with no query parameters': function () {
       return this.remote
         .then(openPage(SEND_SMS_NO_QUERY_URL, selectors.SMS_SEND.HEADER))
         .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, ''))
         .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'US'))
         .then(testHrefEquals(selectors.SMS_SEND.LINK_MARKETING_IOS, ADJUST_LINK_IOS))
         .then(testHrefEquals(selectors.SMS_SEND.LINK_MARKETING_ANDROID, ADJUST_LINK_ANDROID));
     },

     'with no service, unsupported country': function () {
       return this.remote
         .then(openPage(SEND_SMS_NO_QUERY_URL, selectors.SMS_SEND.HEADER, {
           query: {
             country: 'KZ'
           }
         }))
         // The Sync relier validates `country`, this uses the base relier
         // so country is ignored.
         .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, ''))
         .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'US'));
     },

     'with `country=CA`': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER, {
           query: {
             country: 'CA'
           }
         }))
         .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, ''))
         .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'CA'));
     },

     'with `country=RO`': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER, {
           query: {
             country: 'RO'
           }
         }))
         .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, '+407'))
         .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'RO'));
     },

     'with `country=GB`': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER, {
           query: {
             country: 'GB'
           }
         }))
         .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, '+44'))
         .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'GB'));
     },

     'with `country=US`': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER, {
           query: {
             country: 'US'
           }
         }))
         .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, ''))
         .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'US'));
     },

     'with an unsupported `country`': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors['400'].HEADER, {
           query: {
             country: 'KZ'
           }
         }))
         .then(testElementTextInclude(selectors['400'].ERROR, 'country'));
     },

     'learn more': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
        .then(click(selectors.SMS_SEND.LINK_LEARN_MORE))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.SMS_LEARN_MORE.HEADER))
        .then(closeCurrentWindow());

     },

     'why is this required': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(click(selectors.SMS_SEND.LINK_WHY_IS_THIS_REQUIRED))

        .then(testElementExists(selectors.SMS_WHY_IS_THIS_REQUIRED.HEADER))
        .then(click(selectors.SMS_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(testElementExists(selectors.SMS_SEND.HEADER));
     },

     'maybe later': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
         .then(click(selectors.SMS_SEND.LINK_MAYBE_LATER))

         .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
     },

     'empty phone number': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
        .then(testElementTextInclude(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP, 'required'));
     },

     'invalid phone number (too short)': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
         .then(type(selectors.SMS_SEND.PHONE_NUMBER, '2134567'))
         .then(click(selectors.SMS_SEND.SUBMIT))
         .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
         .then(testElementTextInclude(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP, 'invalid'));
     },

     'invalid phone number (too long)': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
         .then(type(selectors.SMS_SEND.PHONE_NUMBER, '21345678901'))
         .then(click(selectors.SMS_SEND.SUBMIT))
         .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
         .then(testElementTextInclude(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP, 'invalid'));
     },

     'invalid phone number (contains letters)': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, '2134567a890'))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP))
        .then(testElementTextInclude(selectors.SMS_SEND.PHONE_NUMBER_TOOLTIP, 'invalid'));
     },

     'valid phone number, back': disableInProd(function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(testElementTextInclude(selectors.SMS_SENT.PHONE_NUMBER_SENT_TO, formattedPhoneNumber))
        .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
        .then(getSms(testPhoneNumber, 0))

        // user realizes they made a mistake
        .then(click(selectors.SMS_SENT.LINK_BACK))
        .then(testElementExists(selectors.SMS_SEND.HEADER))

        // original phone number should still be in place
        .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber));
     }),

     'valid phone number, resend': disableInProd(function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(getSms(testPhoneNumber, 0))

        .then(click(selectors.SMS_SENT.LINK_RESEND))
        .then(testElementTextInclude(selectors.SMS_SENT.PHONE_NUMBER_SENT_TO, formattedPhoneNumber))
        .then(getSms(testPhoneNumber, 1));
     }),

     'valid phone number, enable signinCode': disableInProd(function () {
       return this.remote
        .then(openPage(SEND_SMS_SIGNIN_CODE_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(getSmsSigninCode(testPhoneNumber, 0));
     }),

     'valid phone number w/ country code of 1': disableInProd(function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
         .then(type(selectors.SMS_SEND.PHONE_NUMBER, `1${testPhoneNumber}`))
         .then(click(selectors.SMS_SEND.SUBMIT))
         .then(testElementExists(selectors.SMS_SENT.HEADER))
         .then(testElementTextInclude(selectors.SMS_SENT.PHONE_NUMBER_SENT_TO, formattedPhoneNumber))
         .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
         .then(getSms(testPhoneNumber, 0));
     }),

     'valid phone number w/ country code of +1': disableInProd(function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
         .then(type(selectors.SMS_SEND.PHONE_NUMBER, `+1${testPhoneNumber}`))
         .then(click(selectors.SMS_SEND.SUBMIT))
         .then(testElementExists(selectors.SMS_SENT.HEADER))
         .then(testElementTextInclude(selectors.SMS_SENT.PHONE_NUMBER_SENT_TO, formattedPhoneNumber))
         .then(testElementExists(selectors.SMS_SEND.LINK_MARKETING))
         .then(getSms(testPhoneNumber, 0));
     }),

     'valid phone number (contains spaces and punctuation)': disableInProd(function () {
       const unformattedPhoneNumber = ` ${testPhoneNumber.slice(0,3)} .,- ${testPhoneNumber.slice(3)} `;
       return this.remote
        .then(openPage(SEND_SMS_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, unformattedPhoneNumber))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(testElementTextInclude(selectors.SMS_SENT.PHONE_NUMBER_SENT_TO, formattedPhoneNumber))
        .then(getSms(testPhoneNumber, 0))

        // user realizes they made a mistake
        .then(click(selectors.SMS_SENT.LINK_BACK))
        .then(testElementExists(selectors.SMS_SEND.HEADER))

        // original phone number should still be in place
        .then(testElementValueEquals(selectors.SMS_SEND.PHONE_NUMBER, unformattedPhoneNumber));
     })
   };

   registerSuite(suite);
 });
