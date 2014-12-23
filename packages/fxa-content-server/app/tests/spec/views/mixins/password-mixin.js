/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'chai',
  'sinon',
  'backbone',
  'underscore',
  'views/mixins/password-mixin',
  'views/base',
  'models/reliers/relier',
  'stache!templates/test_template'
], function ($, chai, sinon, Backbone, _, PasswordMixin, BaseView, Relier, TestTemplate) {
  var assert = chai.assert;

  var PasswordView = BaseView.extend({
    template: TestTemplate,
    events: {
      'change .show-password': 'onPasswordVisibilityChange'
    }
  });
  _.extend(PasswordView.prototype, PasswordMixin);

  describe('views/mixins/password-mixin', function () {
    var view;
    var relier;

    beforeEach(function () {
      relier = new Relier();

      view = new PasswordView({
        relier: relier
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
      });

      it('sets the password field to type=password if button is unchecked', function () {
        view.$('#show-password').removeAttr('checked');
        view.setPasswordVisibilityFromButton('#show-password');
        assert.equal(view.$('#password').attr('type'), 'password');
        assert.isUndefined(view.$('#password').attr('autocomplete'));
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
        assert.equal(view.$('#vpassword').attr('type'), 'text');
        assert.equal(view.$('#vpassword').attr('autocomplete'), 'off');
      });

      it('pw field set to password when clicked again', function () {
        view.$('.show-password').click();
        view.$('.show-password').click();
        assert.equal(view.$('#password').attr('type'), 'password');
        assert.equal(view.$('#password').attr('autocomplete'), null);
        assert.equal($('#vpassword').attr('type'), 'password');
        assert.equal($('#vpassword').attr('autocomplete'), null);
      });
    });
  });
});

