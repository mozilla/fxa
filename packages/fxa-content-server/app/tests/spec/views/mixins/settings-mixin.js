/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'cocktail',
  'sinon',
  'models/notifications',
  'models/user',
  'models/reliers/relier',
  'stache!templates/test_template',
  'views/base',
  'views/mixins/settings-mixin'
], function (chai, Cocktail, sinon, Notifications, User, Relier, TestTemplate,
  BaseView, SettingsMixin) {
  'use strict';

  var assert = chai.assert;

  var SettingsView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(SettingsView, SettingsMixin);

  describe('views/mixins/settings-mixin', function () {
    var relier;
    var sandbox;
    var user;
    var view;
    var notifications;

    function createView() {
      view = new SettingsView({
        relier: relier,
        user: user
      });
    }

    beforeEach(function () {
      relier = new Relier();
      notifications = new Notifications();
      user = new User({
        notifications: notifications
      });

      sandbox = new sinon.sandbox.create();
      sandbox.spy(user, 'setSignedInAccountByUid');
      sandbox.spy(user, 'clearSignedInAccount');
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      sandbox.restore();
    });

    describe('mustVerify', function () {
      it('all consumers of the SettingsMixin `mustVerify`', function () {
        createView();

        assert.isTrue(view.mustVerify);
      });
    });

    describe('with no relier specified uid', function () {
      it('does nothing', function () {
        relier.unset('uid');
        createView();

        assert.isFalse(user.setSignedInAccountByUid.called);
        assert.isFalse(user.clearSignedInAccount.called);
      });
    });

    describe('with uncached relier specified uid', function () {
      it('clears the signed in account', function () {
        relier.set('uid', 'uid');

        createView();

        assert.isFalse(user.setSignedInAccountByUid.called);
        assert.isTrue(user.clearSignedInAccount.called);
      });
    });

    describe('with cached relier specified uid', function () {
      it('sets the signed in account', function () {
        relier.set('uid', 'uid');

        return user.setAccount({ uid: 'uid' })
          .then(function () {
            createView();

            assert.isTrue(user.setSignedInAccountByUid.calledWith('uid'));
            assert.isFalse(user.clearSignedInAccount.called);
          });
      });
    });
  });
});

