/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var Broker = require('models/auth_brokers/base');
  var Chai = require('chai');
  var Cocktail = require('cocktail');
  var OpenConfirmationEmailMixin = require('views/mixins/open-webmail-mixin');
  var sinon = require('sinon');
  var Template = require('stache!templates/test_template');

  var assert = Chai.assert;

  var ConfirmView = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    ConfirmView,
    OpenConfirmationEmailMixin
  );

  describe('views/mixins/open-webmail-mixin', function () {
    var broker;
    var view;

    beforeEach(function () {
      broker = new Broker();

      view = new ConfirmView({
        broker: broker
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    describe('test buttons visibility without broker support', function () {
      beforeEach(function () {
        broker.unsetCapability('openWebmailButtonVisible');
      });

      it('returns false even for chosen email addresses', function () {
        assert.isFalse(view.isOpenWebmailButtonVisible('testuser@gmail.com'));
        assert.isFalse(view.isOpenWebmailButtonVisible('testuser@hotmail.com'));
        assert.isFalse(view.isOpenWebmailButtonVisible('testuser@yahoo.com'));
      });
    });

    describe('link and visibility', function () {
      describe('with broker support', function () {
        beforeEach(function () {
          broker.setCapability('openWebmailButtonVisible', true);
        });

        describe('getWebmailLink get the right link', function () {
          it('checks href', function () {
            assert.include(view.getWebmailLink('testuser@gmail.com'), 'https://mail.google.com/mail/u/?authuser=testuser%40gmail.com');
            assert.include(view.getWebmailLink('testuser@hotmail.com'), 'https://outlook.live.com/');
            assert.include(view.getWebmailLink('testuser@yahoo.com'), 'https://mail.yahoo.com');
          });
        });

        describe('with an address that has valid provider that isn\'t', function () {
          it('returns false', function () {
            assert.isFalse(view.isOpenWebmailButtonVisible('testuser@mygmail.com'));
            assert.isFalse(view.isOpenWebmailButtonVisible('gmail.com@hyahoo.com'));
          });
        });

        describe('with a gmail or hotmail or yahoo address', function () {
          it('returns true', function () {
            assert.isTrue(view.isOpenWebmailButtonVisible('testuser@gmail.com'));
            assert.isTrue(view.isOpenWebmailButtonVisible('testuser@hotmail.com'));
            assert.isTrue(view.isOpenWebmailButtonVisible('testuser@yahoo.com'));
          });
        });
      });
    });

    describe('click on `open-webmail` button', function () {
      beforeEach(function () {

        view = new ConfirmView({
          broker: broker
        });

        sinon.spy(view, 'logViewEvent');

        return view.render()
          .then(function () {
            $('#container').html(view.el);
          })
          .then(function () {
            $('#open-webmail').click();
          });
      });

      it('calls logViewEvent', function () {
        assert.isTrue(view.logViewEvent.called);
      });
    });
  });
});

