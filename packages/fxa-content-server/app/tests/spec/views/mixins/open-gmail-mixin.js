/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var Broker = require('models/auth_brokers/base');
  var Chai = require('chai');
  var Cocktail = require('cocktail');
  var OpenGmailMixin = require('views/mixins/open-gmail-mixin');
  var sinon = require('sinon');
  var Template = require('stache!templates/test_template');

  var assert = Chai.assert;

  var ConfirmView = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    ConfirmView,
    OpenGmailMixin
  );

  describe('views/mixins/open-gmail-mixin', function () {
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

    describe('isOpenGmailButtonVisible', function () {
      describe('without broker support', function () {
        beforeEach(function () {
          broker.unsetCapability('openGmailButtonVisible');
        });

        it('returns false even for gmail addresses', function () {
          assert.isFalse(view.isOpenGmailButtonVisible('testuser@gmail.com'));
        });
      });

      describe('with broker support', function () {
        beforeEach(function () {
          broker.setCapability('openGmailButtonVisible', true);
        });

        describe('with a non-gmail address', function () {
          it('returns false', function () {
            assert.isFalse(view.isOpenGmailButtonVisible('testuser@yahoo.com'));
          });
        });

        describe('with an address that has gmail.com that isn\'t', function () {
          it('returns false', function () {
            assert.isFalse(view.isOpenGmailButtonVisible('testuser@mygmail.com'));
            assert.isFalse(view.isOpenGmailButtonVisible('gmail.com@yahoo.com'));
          });
        });

        describe('with a gmail address', function () {
          it('returns true', function () {
            assert.isTrue(view.isOpenGmailButtonVisible('testuser@gmail.com'));
          });
        });
      });
    });

    describe('getGmailUrl', function () {
      it('returns a URL', function () {
        var email = 'testuser@gmail.com';
        var gmailUrl = view.getGmailUrl(email);
        assert.include(gmailUrl, 'https://mail.google.com/mail/u/?authuser=');
        assert.include(gmailUrl, encodeURIComponent(email));
      });
    });

    describe('click on `open-gmail` button', function () {
      beforeEach(function () {
        sinon.spy(view, 'logViewEvent');

        return view.render()
          .then(function () {
            $('#container').html(view.el);
          })
          .then(function () {
            $('#open-gmail').click();
          });
      });

      it('calls logViewEvent', function () {
        assert.isTrue(view.logViewEvent.calledWith('openGmail.clicked'));
      });
    });
  });
});

