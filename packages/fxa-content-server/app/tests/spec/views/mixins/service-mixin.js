/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const NullBroker = require('models/auth_brokers/base');
  const OAuthRelier = require('models/reliers/oauth');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  var OAuthView = BaseView.extend({
    className: 'oauth',
    template () {
      return '' +
        '<div>' +
          '<div class="error"></div>' +
          '<div class="success"></div>' +
          '<a href="/signin" id="signin">signin</a>' +
          '<a href="/signup" id="signup">signup</a>' +
          '<a href="/reset_password" id="reset_password">reset password</a>' +
        '</div>';
    }
  });

  Cocktail.mixin(
    OAuthView,
    ServiceMixin
  );

  describe('views/mixins/service-mixin', () => {
    var view;
    var windowMock;
    var relier;
    var broker;

    beforeEach(() => {
      windowMock = new WindowMock();
      relier = new OAuthRelier();

      broker = new NullBroker({
        relier: relier,
        session: Session
      });

      view = new OAuthView({
        broker: broker,
        relier: relier,
        window: windowMock
      });

    });

    describe('render', () => {
      describe('broker modifies links', () => {
        beforeEach(() => {
          sinon.stub(broker, 'transformLink', (link) => `/oauth${link}`);
          return view.render();
        });

        it('replaces links', () => {
          assert.equal(view.$('#signin').attr('href'), '/oauth/signin');
          assert.equal(view.$('#signup').attr('href'), '/oauth/signup');
          assert.equal(view.$('#reset_password').attr('href'), '/oauth/reset_password');
        });
      });

      describe('broker does not modify links', () => {
        beforeEach(() => {
          return view.render();
        });

        it('does not modify links', () => {
          assert.equal(view.$('#signin').attr('href'), '/signin');
          assert.equal(view.$('#signup').attr('href'), '/signup');
          assert.equal(view.$('#reset_password').attr('href'), '/reset_password');
        });
      });
    });

    describe('unsafeDisplayError', () => {
      describe('broker modifies links', () => {
        beforeEach(() => {
          sinon.stub(broker, 'transformLink', (link) => `/oauth${link}`);
          return view.render();
        });

        it('converts /signin links to /oauth/signin', () => {
          view.unsafeDisplayError('<a href="/signin" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signin');
        });

        it('keeps attributes during the transformation', () => {
          view.unsafeDisplayError('<a href="/signin?client_id=foo&state=bar" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signin?client_id=foo&state=bar');
        });

        it('converts /signup links to /oauth/signup', () => {
          view.unsafeDisplayError('<a href="/signup" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signup');
        });
      });

      describe('broker does not modify links', () => {
        beforeEach(() => {
          return view.render();
        });

        it('leaves /signin alone', () => {
          view.unsafeDisplayError('<a href="/signin" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/signin');
        });

        it('leaves /signup alone', () => {
          view.unsafeDisplayError('<a href="/signup" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/signup');
        });
      });
    });
  });
});
