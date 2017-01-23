/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const Chai = require('chai');
  const Cocktail = require('cocktail');
  const NullBroker = require('models/auth_brokers/base');
  const OAuthRelier = require('models/reliers/oauth');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const TestTemplate = require('stache!templates/test_template');
  const WindowMock = require('../../../mocks/window');

  var assert = Chai.assert;

  var OAuthView = BaseView.extend({
    className: 'oauth',
    template: TestTemplate
  });
  Cocktail.mixin(
    OAuthView,
    ServiceMixin
  );

  describe('views/mixins/service-mixin', function () {
    var view;
    var windowMock;
    var relier;
    var broker;

    beforeEach(function () {
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

      return view.render();
    });

    describe('unsafeDisplayError', function () {
      describe('with a broker that munges links', function () {
        beforeEach(function () {
          sinon.stub(broker, 'transformLink', function (link) {
            return '/oauth' + link;
          });
        });

        it('converts /signin links to /oauth/signin', function () {
          view.unsafeDisplayError('<a href="/signin" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signin');
        });

        it('keeps attributes during the transformation', function () {
          view.unsafeDisplayError('<a href="/signin?client_id=foo&state=bar" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signin?client_id=foo&state=bar');
        });

        it('converts /signup links to /oauth/signup', function () {
          view.unsafeDisplayError('<a href="/signup" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signup');
        });
      });

      describe('with a broker that does not munge links', function () {
        it('leaves /signin alone', function () {
          view.unsafeDisplayError('<a href="/signin" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/signin');
        });

        it('leaves /signup alone', function () {
          view.unsafeDisplayError('<a href="/signup" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/signup');
        });
      });
    });
  });
});
