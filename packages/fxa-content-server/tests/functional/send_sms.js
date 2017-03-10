/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


 define([
   'intern',
   'intern!object',
   'tests/lib/helpers',
   'tests/functional/lib/helpers',
   'app/scripts/lib/country-telephone-info',
   'intern/dojo/node!../../server/lib/configuration',
 ], function (intern, registerSuite, TestHelpers, FunctionalHelpers,
   CountryTelephoneInfo, serverConfig) {
   const config = intern.config;

   const SEND_SMS_URL = config.fxaContentRoot + 'sms?service=sync';

   const LEARN_MORE_WINDOW_HANDLE = '_learn-more';

   const SELECTOR_CONFIRM_SIGNUP = '#fxa-confirm-header';
   const SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER = '#fxa-connect-another-device-header';
   const SELECTOR_LEARN_MORE = 'a#learn-more';
   const SELECTOR_LEARN_MORE_HEADER = '#tabzilla';
   const SELECTOR_MARKETING_LINK = '.marketing-link';
   const SELECTOR_SEND_SMS_MAYBE_LATER = 'a[href="/connect_another_device"]';
   const SELECTOR_SEND_SMS_HEADER = '#fxa-send-sms-header';
   const SELECTOR_SEND_SMS_PHONE_NUMBER = 'input[type="tel"]';
   const SELECTOR_SEND_SMS_SUBMIT = 'button[type="submit"]';
   const SELECTOR_SEND_SMS_TOOLTIP = SELECTOR_SEND_SMS_PHONE_NUMBER + ' ~ .tooltip';
   const SELECTOR_SMS_SENT_BACK = '#back';
   const SELECTOR_SMS_SENT_HEADER = '#fxa-sms-sent-header';
   const SELECTOR_SMS_SENT_RESEND = '#resend';
   const SELECTOR_SMS_SENT_TO = '.success';
   const SELECTOR_WHY_IS_THIS_REQUIRED = 'a[href="/sms/why"]';
   const SELECTOR_WHY_IS_THIS_REQUIRED_CLOSE = '.connect-another-device button[type="submit"]';
   const SELECTOR_WHY_IS_THIS_REQUIRED_HEADER = '#fxa-why-connect-another-device-header';

   const PASSWORD = 'password';

   var email;

   const click = FunctionalHelpers.click;
   const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
   const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
   const openPage = FunctionalHelpers.openPage;
   const testElementExists = FunctionalHelpers.testElementExists;
   const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
   const testElementValueEquals = FunctionalHelpers.testElementValueEquals;
   const type = FunctionalHelpers.type;

   const suite = {
     name: 'send_sms',

     beforeEach: function () {
       email = TestHelpers.createEmail();

       // User needs a sessionToken to be able to send an SMS. Sign up,
       // no need to verify.
       return this.remote
         .then(fillOutSignUp(email, PASSWORD))
         .then(testElementExists(SELECTOR_CONFIRM_SIGNUP));
     },

     'learn more': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(testElementExists(SELECTOR_MARKETING_LINK))
        .then(click(SELECTOR_LEARN_MORE))
        .switchToWindow(LEARN_MORE_WINDOW_HANDLE)

        .then(testElementExists(SELECTOR_LEARN_MORE_HEADER))
        .then(closeCurrentWindow());

     },

     'why is this required': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(click(SELECTOR_WHY_IS_THIS_REQUIRED))

        .then(testElementExists(SELECTOR_WHY_IS_THIS_REQUIRED_HEADER))
        .then(click(SELECTOR_WHY_IS_THIS_REQUIRED_CLOSE))

        .then(testElementExists(SELECTOR_SEND_SMS_HEADER));
     },

     'maybe later': function () {
       return this.remote
         .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
         .then(click(SELECTOR_SEND_SMS_MAYBE_LATER))

         .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER));
     },

     'empty phone number': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SEND_SMS_TOOLTIP))
        .then(testElementTextInclude(SELECTOR_SEND_SMS_TOOLTIP, 'required'));
     },

     'invalid phone number (too short)': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, '1234567'))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SEND_SMS_TOOLTIP))
        .then(testElementTextInclude(SELECTOR_SEND_SMS_TOOLTIP, 'invalid'));
     },

     'invalid phone number (contains letters)': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, '1234567a890'))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SEND_SMS_TOOLTIP))
        .then(testElementTextInclude(SELECTOR_SEND_SMS_TOOLTIP, 'invalid'));
     },

     'invalid phone number (fails hapi validation)': function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, '1234567890'))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SEND_SMS_TOOLTIP))
        .then(testElementTextInclude(SELECTOR_SEND_SMS_TOOLTIP, 'invalid'));
     }
   };

   const testPhoneNumber = serverConfig.get('sms.testPhoneNumber');
   const testPhoneNumberCountry = serverConfig.get('sms.testPhoneNumberCountry');

   if (testPhoneNumber && testPhoneNumberCountry) {
     const countryInfo = CountryTelephoneInfo[testPhoneNumberCountry];
     const formattedPhoneNumber =
       countryInfo.format(countryInfo.normalize(testPhoneNumber));

     suite['valid phone number, back'] = function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, testPhoneNumber))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SMS_SENT_HEADER))
        .then(testElementTextInclude(SELECTOR_SMS_SENT_TO, formattedPhoneNumber))
        .then(testElementExists(SELECTOR_MARKETING_LINK))

        // user realizes they made a mistake
        .then(click(SELECTOR_SMS_SENT_BACK))
        .then(testElementExists(SELECTOR_SEND_SMS_HEADER))

        // original phone number should still be in place
        .then(testElementValueEquals(SELECTOR_SEND_SMS_PHONE_NUMBER, testPhoneNumber));
     };

     suite['valid phone number, resend'] = function () {
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, testPhoneNumber))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SMS_SENT_HEADER))

        // Give a slight delay or else nexmo throttles the request
        .sleep(10000)

        .then(click(SELECTOR_SMS_SENT_RESEND))
        .then(testElementTextInclude(SELECTOR_SMS_SENT_TO, formattedPhoneNumber));
     };

     if (testPhoneNumberCountry === 'US') {
       suite['valid phone number w/ country code of 1'] = function () {
         return this.remote
          .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
          .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, `1${testPhoneNumber}`))
          .then(click(SELECTOR_SEND_SMS_SUBMIT))
          .then(testElementExists(SELECTOR_SMS_SENT_HEADER))
          .then(testElementTextInclude(SELECTOR_SMS_SENT_TO, formattedPhoneNumber))
          .then(testElementExists(SELECTOR_MARKETING_LINK));
       };

       suite['valid phone number w/ country code of +1'] = function () {
         return this.remote
          .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
          .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, `+1${testPhoneNumber}`))
          .then(click(SELECTOR_SEND_SMS_SUBMIT))
          .then(testElementExists(SELECTOR_SMS_SENT_HEADER))
          .then(testElementTextInclude(SELECTOR_SMS_SENT_TO, formattedPhoneNumber))
          .then(testElementExists(SELECTOR_MARKETING_LINK));
       };
     }

     suite['valid phone number (contains spaces and punctuation)'] = function () {
       const unformattedPhoneNumber = ` ${testPhoneNumber.slice(0,3)} .,- ${testPhoneNumber.slice(3)} `;
       return this.remote
        .then(openPage(SEND_SMS_URL, SELECTOR_SEND_SMS_HEADER))
        .then(type(SELECTOR_SEND_SMS_PHONE_NUMBER, unformattedPhoneNumber))
        .then(click(SELECTOR_SEND_SMS_SUBMIT))
        .then(testElementExists(SELECTOR_SMS_SENT_HEADER))
        .then(testElementTextInclude(SELECTOR_SMS_SENT_TO, formattedPhoneNumber))

        // user realizes they made a mistake
        .then(click(SELECTOR_SMS_SENT_BACK))
        .then(testElementExists(SELECTOR_SEND_SMS_HEADER))

        // original phone number should still be in place
        .then(testElementValueEquals(SELECTOR_SEND_SMS_PHONE_NUMBER, unformattedPhoneNumber));
     };
   }

   registerSuite(suite);
 });
