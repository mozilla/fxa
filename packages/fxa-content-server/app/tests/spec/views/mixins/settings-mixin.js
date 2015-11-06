/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var Notifier = require('lib/channels/notifier');
  var Relier = require('models/reliers/relier');
  var SettingsMixin = require('views/mixins/settings-mixin');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');
  var User = require('models/user');

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
    var notifier;

    function createView() {
      view = new SettingsView({
        relier: relier,
        user: user
      });
    }

    beforeEach(function () {
      relier = new Relier();
      notifier = new Notifier();
      user = new User({
        notifier: notifier
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

