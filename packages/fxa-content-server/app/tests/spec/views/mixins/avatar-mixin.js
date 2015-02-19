/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'backbone',
  'sinon',
  'underscore',
  'views/mixins/avatar-mixin',
  'views/base',
  'models/reliers/relier',
  'models/user',
  'models/account'
], function (Chai, Backbone, sinon, _, AvatarMixin, BaseView,
    Relier, User, Account) {
  var assert = Chai.assert;

  var SettingsView = BaseView.extend({});

  _.extend(SettingsView.prototype, AvatarMixin);

  describe('views/mixins/avatar-mixin', function () {
    var view;
    var user;
    var account;
    var relier;

    beforeEach(function () {
      user = new User();
      account = new Account();
      relier = new Relier();
      view = new SettingsView({
        user: user,
        relier: relier
      });
      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });
      sinon.stub(user, 'setAccount', function () { });
    });

    describe('updateAvatarUrl', function () {
      it('returns when no avatar', function () {
        view.updateAvatarUrl();
        assert.isFalse(view.getSignedInAccount.called);
      });

      it('stores the url', function () {
        view.updateAvatarUrl('url');
        assert.equal(account.get('profileImageUrl'), 'url');
        assert.isTrue(view.getSignedInAccount.called);
        assert.isTrue(user.setAccount.calledWith(account));
      });

      it('deletes the url if null', function () {
        view.updateAvatarUrl('url');
        assert.isTrue(account.has('profileImageUrl'));
        view.updateAvatarUrl(null);
        assert.isFalse(account.has('profileImageUrl'));
        assert.isTrue(user.setAccount.calledWith(account));
      });
    });

  });
});

