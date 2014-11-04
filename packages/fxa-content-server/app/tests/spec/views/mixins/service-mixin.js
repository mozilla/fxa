/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'underscore',
  '../../../mocks/window',
  'views/mixins/service-mixin',
  'views/base',
  'lib/session',
  'stache!templates/test_template',
  'models/reliers/oauth',
  'models/auth_brokers/base'
], function (Chai, sinon, _, WindowMock,
        ServiceMixin, BaseView, Session,
        TestTemplate, OAuthRelier, NullBroker) {
  var assert = Chai.assert;

  var OAuthView = BaseView.extend({
    template: TestTemplate,
    className: 'oauth'
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
        session: Session,
        relier: relier
      });

      view = new OAuthView({
        window: windowMock,
        relier: relier,
        broker: broker
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

