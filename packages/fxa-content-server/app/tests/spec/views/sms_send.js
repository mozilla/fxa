/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 define((require, exports, module) => {
   'use strict';

   const { assert } = require('chai');
   const Account = require('models/account');
   const AuthErrors = require('lib/auth-errors');
   const Broker = require('models/auth_brokers/base');
   const Backbone = require('backbone');
   const Notifier = require('lib/channels/notifier');
   const p = require('lib/promise');
   const Relier = require('models/reliers/relier');
   const sinon = require('sinon');
   const SmsErrors = require('lib/sms-errors');
   const SmsMessageIds = require('lib/sms-message-ids');
   const View = require('views/sms_send');

   describe('views/sms_send', () => {
     let account;
     let broker;
     let formPrefill;
     let model;
     let notifier;
     let relier;
     let view;

     function createView() {
       view = new View({
         broker,
         formPrefill,
         model,
         notifier,
         relier
       });
       sinon.stub(view, 'checkAuthorization', () => p(true));
     }

     beforeEach(() => {
       account = new Account({ sessionToken: 'token' });
       broker = new Broker();
       formPrefill = new Backbone.Model({});
       model = new Backbone.Model({ account });
       notifier = new Notifier();
       relier = new Relier({ service: 'sync' });

       createView();

       return view.render();
     });

     it('renders, sets the correct country, renders marketing', () => {
       assert.equal(view.$('input[type=tel]').data('country'), 'US');
       assert.lengthOf(view.$('.marketing-link'), 2);
     });

     describe('submit', () => {
       describe('succeeds', () => {
         it('it delegates to `account.sendSms`, calls `_onSendSmsSuccess`', () => {
           sinon.stub(account, 'sendSms', () => p());
           sinon.spy(view, '_onSendSmsSuccess');
           view.$('input[type=tel]').val('1234567890');

           return view.submit()
             .then(() => {
               assert.isTrue(account.sendSms.calledOnce);
               assert.isTrue(account.sendSms.calledWith('+11234567890', SmsMessageIds.FIREFOX_MOBILE_INSTALL));
               assert.isTrue(view._onSendSmsSuccess.calledOnce);
             });
         });
       });

       describe('errors', () => {
         it('it delegates to `account.sendSms`, calls `_onSendSmsError` with the error', () => {
           let err = AuthErrors.toError('UNEXPECTED ERROR');
           sinon.stub(account, 'sendSms', () => p.reject(err));
           sinon.spy(view, '_onSendSmsError');
           view.$('input[type=tel]').val('1234567890');

           return view.submit()
             .then(assert.fail, (_err) => {
               assert.strictEqual(_err, err);
               assert.isTrue(account.sendSms.calledOnce);
               assert.isTrue(account.sendSms.calledWith('+11234567890', SmsMessageIds.FIREFOX_MOBILE_INSTALL));
               assert.isTrue(view._onSendSmsError.calledOnce);
               assert.isTrue(view._onSendSmsError.calledWith(err));
             });
         });
       });
     });

     describe('_onSendSmsSuccess', () => {
       it('navigates to `sms/sent`', () => {
         sinon.spy(view, 'navigate');
         view.$('input[type=tel]').val('1234567890');

         view._onSendSmsSuccess();

         assert.isTrue(view.navigate.calledOnce);
         assert.isTrue(view.navigate.calledWith('sms/sent'));
         const navigateOptions = view.navigate.args[0][1];
         assert.equal(navigateOptions.country, 'US');
         assert.equal(navigateOptions.normalizedPhoneNumber, '+11234567890');
         assert.instanceOf(navigateOptions.account, Account);
       });
     });

     describe('_onSendSmsError', () => {
       beforeEach(() => {
         sinon.spy(view, 'showValidationError');
       });

       function testPhoneNumberShowValidationError(err) {
         const $phoneNumberEl = view.$('input[type=tel]');
         view._onSendSmsError(err);
         assert.isTrue(view.showValidationError.calledWith($phoneNumberEl, err));
       }

       describe('fails with AuthErrors.INVALID_PHONE_NUMBER', () => {
         it('prints the validation error', () => {
           testPhoneNumberShowValidationError(AuthErrors.toError('INVALID_PHONE_NUMBER'));
         });
       });

       describe('fails with SmsErrors.INVALID_PHONE_NUMBER', () => {
         it('prints the validation error', () => {
           testPhoneNumberShowValidationError(SmsErrors.toError('INVALID_PHONE_NUMBER'));
         });
       });

       describe('fails with SmsErrors.UNROUTABLE_MESSAGE', () => {
         it('prints the validation error', () => {
           testPhoneNumberShowValidationError(SmsErrors.toError('UNROUTABLE_MESSAGE'));
         });
       });

       describe('fails with SmsErrors.NUMBER_BLOCKED', () => {
         it('prints the validation error', () => {
           testPhoneNumberShowValidationError(SmsErrors.toError('NUMBER_BLOCKED'));
         });
       });

       describe('all other errors', () => {
         it('propagates the error', () => {
           const err = AuthErrors.toError('UNEXPECTED_ERROR');
           assert.throws(() => {
             view._onSendSmsError(err);
           }, err);
         });
       });
     });

     describe('_getNormalizedPhoneNumber', () => {
       describe('with a US phone number', () => {
         beforeEach(() => {
           model.set('country', 'US');
         });

         it('returns phone number with +1 prefix', () => {
           // no country code prefix
           view.$('input[type=tel]').val('1234567890');
           assert.equal(view._getNormalizedPhoneNumber(), '+11234567890');

           // user entered country code prefix w/o +
           view.$('input[type=tel]').val('11234567890');
           assert.equal(view._getNormalizedPhoneNumber(), '+11234567890');

           // user entered country code prefix w/ +1
           view.$('input[type=tel]').val('+11234567890');
           assert.equal(view._getNormalizedPhoneNumber(), '+11234567890');
         });
       });

       describe('with a GB phone number', () => {
         beforeEach(() => {
           model.set('country', 'GB');
         });

         it('returns phone number with +44 prefix', () => {
           // prefix is pre-filled in form
           view.$('input[type=tel]').val('+441234567890');
           assert.equal(view._getNormalizedPhoneNumber(), '+441234567890');

           // prefix is not pre-filled in form
           view.$('input[type=tel]').val('1234567890');
           assert.equal(view._getNormalizedPhoneNumber(), '+441234567890');
         });
       });
     });

     describe('flow events', () => {
       beforeEach(() => {
         sinon.spy(view, 'logFlowEvent');
         sinon.spy(view, 'logFlowEventOnce');
         sinon.stub(view, 'navigate', () => {});
       });

       it('logs a click on `why is this required`', () => {
         view.$('a[href="/sms/why"]').click();
         assert.isTrue(view.logFlowEvent.calledOnce);
         assert.isTrue(view.logFlowEvent.calledWith('link.why'));
       });

       it('logs a click on `maybe later`', () => {
         view.$('a#maybe-later').click();
         assert.isTrue(view.logFlowEvent.calledOnce);
         assert.isTrue(view.logFlowEvent.calledWith('link.maybe_later'));
       });

       it('logs a click in the phone number field', () => {
         view.$('input[type=tel]').val('1234').click();
         assert.isTrue(view.logFlowEventOnce.calledOnce);
         assert.isTrue(view.logFlowEventOnce.calledWith('engage'));
       });
     });

     describe('formPrefill', () => {
       const USER_ENTERED_PHONE_NUMBER = '44(1234) 567890';
       it('destroy saves country, phoneNumber into formPrefill', () => {
         view.model.set('country', 'GB');
         view.$('input[type=tel]').val(USER_ENTERED_PHONE_NUMBER);

         view.destroy();

         assert.equal(formPrefill.get('phoneNumber'), USER_ENTERED_PHONE_NUMBER);
         assert.equal(formPrefill.get('country'), 'GB');
       });

       it('render with formPrefill fills in information correctly', () => {
         formPrefill.set({
           country: 'GB',
           phoneNumber: USER_ENTERED_PHONE_NUMBER
         });
         createView();

         return view.render()
           .then(() => {
             const $telEl = view.$('input[type=tel]');
             assert.equal($telEl.data('country'), 'GB');
             assert.equal($telEl.__val(), USER_ENTERED_PHONE_NUMBER);
           });
       });
     });

   });
 });
