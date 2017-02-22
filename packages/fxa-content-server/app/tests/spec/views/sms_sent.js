/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 define((require, exports, module) => {
   'use strict';

   const { assert } = require('chai');
   const Backbone = require('backbone');
   const Broker = require('models/auth_brokers/base');
   const Notifier = require('lib/channels/notifier');
   const Relier = require('models/reliers/relier');
   const sinon = require('sinon');
   const View = require('views/sms_sent');

   describe('views/sms_sent', () => {
     let model;
     let view;

     beforeEach(() => {
       model = new Backbone.Model({});
       view = new View({
         broker: new Broker({}),
         model,
         notifier: new Notifier(),
         relier: new Relier({ service: 'sync' })
       });
     });

     it('returns to `sms` if no `phoneNumber`', () => {
       sinon.spy(view, 'navigate');

       model.set({
         country: 'US'
       });

       return view.render()
        .then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('sms'));
        });
     });

     it('returns to `sms` if no `country`', () => {
       sinon.spy(view, 'navigate');

       model.set({
         phoneNumber: '+11234567890'
       });

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
          assert.include(view.$('#sms-sent-to').text(), '123-456-7890');
          assert.lengthOf(view.$('.marketing-link'), 2);
        });
     });

     it('renders a GB phone number correctly', () => {
       model.set({
         country: 'GB',
         phoneNumber: '+441234567890'
       });

       return view.render()
        .then(() => {
          assert.include(view.$('#sms-sent-to').text(), '+44 1234 567890');
        });
     });
   });
 });
