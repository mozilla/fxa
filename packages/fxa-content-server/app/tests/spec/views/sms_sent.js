/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 define((require, exports, module) => {
   'use strict';

   const $ = require('jquery');
   const Account = require('models/account');
   const { assert } = require('chai');
   const Backbone = require('backbone');
   const Broker = require('models/auth_brokers/base');
   const { FIREFOX_MOBILE_INSTALL } = require('lib/sms-message-ids');
   const Metrics = require('lib/metrics');
   const Notifier = require('lib/channels/notifier');
   const p = require('lib/promise');
   const Relier = require('models/reliers/relier');
   const SmsErrors = require('lib/sms-errors');
   const sinon = require('sinon');
   const View = require('views/sms_sent');

   describe('views/sms_sent', () => {
     let account;
     let metrics;
     let model;
     let view;

     beforeEach(() => {
       account = new Account();
       metrics = new Metrics();
       model = new Backbone.Model({
         account,
         country: 'US',
         normalizedPhoneNumber: '+11234567890'
       });

       view = new View({
         broker: new Broker({}),
         metrics,
         model,
         notifier: new Notifier(),
         relier: new Relier({ service: 'sync' }),
         viewName: 'sms-sent'
       });

       sinon.stub(view, 'checkAuthorization', () => p(true));
     });

     afterEach(() => {
       metrics.destroy();
       metrics = null;

       view.destroy(true);
       view = null;
     });

     it('returns to `sms` if no `normalizedPhoneNumber`', () => {
       sinon.spy(view, 'navigate');

       model.unset('normalizedPhoneNumber');

       return view.render()
        .then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('sms'));
        });
     });

     it('returns to `sms` if no `country`', () => {
       sinon.spy(view, 'navigate');

       model.unset('country');

       return view.render()
        .then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('sms'));
        });
     });

     it('renders a US phone number correctly, shows marketing', () => {
       model.set({
         country: 'US',
         phoneNumber: '+11234567890'
       });

       return view.render()
        .then(() => {
          assert.include(view.$('.success').text(), '123-456-7890');
          assert.lengthOf(view.$('.marketing-link'), 2);

          // ensure clicks on the marketing links work as expected.
          sinon.spy(metrics, 'logMarketingClick');
          sinon.spy(view, 'logFlowEvent');
          $('#container').html(view.$el);

          view.$('.marketing-link-ios').click();
          assert.isTrue(metrics.logMarketingClick.calledOnce);
          assert.equal(metrics.logMarketingClick.args[0][0], 'autumn-2016-connect-another-device');
          assert.isTrue(view.logFlowEvent.calledOnce);
          assert.isTrue(view.logFlowEvent.calledWith('link.app-store.ios', 'sms-sent'));

          view.$('.marketing-link-android').click();
          assert.isTrue(metrics.logMarketingClick.calledTwice);
          assert.equal(metrics.logMarketingClick.args[1][0], 'autumn-2016-connect-another-device');
          assert.isTrue(view.logFlowEvent.calledTwice);
          assert.isTrue(view.logFlowEvent.calledWith('link.app-store.android', 'sms-sent'));
        });
     });

     it('renders a GB phone number correctly', () => {
       model.set({
         country: 'GB',
         normalizedPhoneNumber: '+441234567890'
       });

       return view.render()
        .then(() => {
          assert.include(view.$('.success').text(), '+44 1234 567890');
        });
     });

     it('resend success, displays the success message', () => {
       sinon.stub(account, 'sendSms', () => p());
       sinon.spy(view, 'render');
       sinon.stub(view, 'getSmsFeatures', () => ['signinCodes']);

       return view.resend()
         .then(() => {
           assert.isTrue(account.sendSms.calledOnce);
           assert.isTrue(account.sendSms.calledWith('+11234567890', FIREFOX_MOBILE_INSTALL, { features: ['signinCodes']}));

           assert.isTrue(view.getSmsFeatures.calledOnce);
           assert.isTrue(view.render.calledOnce);
           const successText = view.$('.success').text();
           assert.include(successText, 'resent');
           assert.include(successText, '123-456-7890');
         });
     });

     it('resend failure, displays the error message', () => {
       sinon.stub(account, 'sendSms', () => p.reject(SmsErrors.toError('THROTTLED')));
       sinon.spy(view, 'displayError');
       sinon.stub(view, 'getSmsFeatures', () => ['signinCodes']);

       // _resend is called instead of resend to test resend-mixin integration.
       return view._resend()
         .then(() => {
           assert.isTrue(account.sendSms.calledOnce);
           assert.isTrue(account.sendSms.calledWith('+11234567890', FIREFOX_MOBILE_INSTALL, { features: ['signinCodes']}));

           assert.isTrue(view.getSmsFeatures.calledOnce);
           assert.isTrue(view.displayError.calledOnce);
           assert.isTrue(SmsErrors.is(view.displayError.args[0][0], 'THROTTLED'));
         });
     });
   });
 });
