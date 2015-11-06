/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var BaseView = require('views/base');
  var chai = require('chai');
  var Metrics = require('lib/metrics');
  var PasswordMixin = require('views/mixins/password-mixin');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../../lib/helpers');
  var TestTemplate = require('stache!templates/test_template');

  var assert = chai.assert;

  var PasswordView = BaseView.extend({
    events: { 'change .show-password': 'onPasswordVisibilityChange' },
    template: TestTemplate
  });
  _.extend(PasswordView.prototype, PasswordMixin);

  describe('views/mixins/password-mixin', function () {
    var view;
    var relier;
    var metrics;

    beforeEach(function () {
      relier = new Relier();
      metrics = new Metrics();

      view = new PasswordView({
        metrics: metrics,
        relier: relier,
        viewName: 'password-view'
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      $('#container').empty();
    });

    describe('setPasswordVisibilityFromButton', function () {
      it('sets the password field to type=text if button is checked', function () {
        view.$('#show-password').attr('checked', 'checked');
        view.setPasswordVisibilityFromButton('#show-password');
        assert.equal(view.$('#password').attr('type'), 'text');
        assert.equal(view.$('#password').attr('autocomplete'), 'off');
        assert.equal(view.$('#password').attr('autocapitalize'), 'off');
        assert.equal(view.$('#password').attr('autocorrect'), 'off');
      });

      it('sets the password field to type=password if button is unchecked', function () {
        view.$('#show-password').removeAttr('checked');
        view.setPasswordVisibilityFromButton('#show-password');
        assert.equal(view.$('#password').attr('type'), 'password');
        assert.isUndefined(view.$('#password').attr('autocomplete'));
        assert.isUndefined(view.$('#password').attr('autocapitalize'));
        assert.isUndefined(view.$('#password').attr('autocorrect'));
      });

      it('always sets the `autocomplete=off` attribute if the relier is sync', function () {
        // sync users should never be allowed to save their password. If they
        // were, it would end in this weird situation where sync users ask to
        // save their sync password to sync before sync is setup.

        sinon.stub(relier, 'isSync', function () {
          return true;
        });

        view.$('#show-password').removeAttr('checked');
        view.setPasswordVisibilityFromButton('#show-password');
        assert.equal(view.$('#password').attr('type'), 'password');
        assert.equal(view.$('#password').attr('autocomplete'), 'off');
      });
    });

    describe('clicking on the show button', function () {
      it('pw field set to text when clicked', function () {
        view.$('.show-password').click();
        assert.equal(view.$('#password').attr('type'), 'text');
        assert.equal(view.$('#password').attr('autocomplete'), 'off');
        assert.equal(view.$('#password').attr('autocapitalize'), 'off');
        assert.equal(view.$('#password').attr('autocorrect'), 'off');
        assert.equal(view.$('#vpassword').attr('type'), 'text');
        assert.equal(view.$('#vpassword').attr('autocomplete'), 'off');
        assert.equal(view.$('#vpassword').attr('autocomplete'), 'off');
        assert.equal(view.$('#vpassword').attr('autocapitalize'), 'off');
      });

      it('pw field set to password when clicked again', function () {
        view.$('.show-password').click();
        view.$('.show-password').click();
        assert.equal(view.$('#password').attr('type'), 'password');
        assert.equal(view.$('#password').attr('autocomplete'), null);
        assert.equal(view.$('#password').attr('autocapitalize'), null);
        assert.equal(view.$('#password').attr('autocorrect'), null);
        assert.equal($('#vpassword').attr('type'), 'password');
        assert.equal($('#vpassword').attr('autocomplete'), null);
        assert.equal($('#vpassword').attr('autocapitalize'), null);
        assert.equal($('#vpassword').attr('autocorrect'), null);
      });

      it('logs whether the password is shown or hidden', function () {
        view.$('.show-password').click();
        assert.isTrue(TestHelpers.isEventLogged(metrics,
                          'password-view.password.visible'));
        // the password has not been hidden yet.
        assert.isFalse(TestHelpers.isEventLogged(metrics,
                          'password-view.password.hidden'));

        view.$('.show-password').click();
        assert.isTrue(TestHelpers.isEventLogged(metrics,
                          'password-view.password.hidden'));
      });
    });
  });
});
