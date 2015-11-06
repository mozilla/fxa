/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var BaseView = require('views/base');
  var Chai = require('chai');
  var NullBroker = require('models/auth_brokers/base');
  var OAuthRelier = require('models/reliers/oauth');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');
  var WindowMock = require('../../../mocks/window');

  var assert = Chai.assert;

  var OAuthView = BaseView.extend({
    className: 'oauth',
    template: TestTemplate
  });
  _.extend(OAuthView.prototype, ServiceMixin);

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

    describe('displayErrorUnsafe', function () {
      describe('with a broker that munges links', function () {
        beforeEach(function () {
          sinon.stub(broker, 'transformLink', function (link) {
            return '/oauth' + link;
          });
        });

        it('converts /signin links to /oauth/signin', function () {
          view.displayErrorUnsafe('<a href="/signin" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signin');
        });

        it('converts /signup links to /oauth/signup', function () {
          view.displayErrorUnsafe('<a href="/signup" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/oauth/signup');
        });
      });

      describe('with a broker that does not munge links', function () {
        it('leaves /signin alone', function () {
          view.displayErrorUnsafe('<a href="/signin" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/signin');
        });

        it('leaves /signup alone', function () {
          view.displayErrorUnsafe('<a href="/signup" id="replaceMe">error</a>');
          assert.equal(view.$('#replaceMe').attr('href'), '/signup');
        });
      });
    });
  });
});
