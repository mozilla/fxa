/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'underscore',
  'views/mixins/avatar-mixin',
  'views/base',
  'models/notifications',
  'models/reliers/relier',
  'models/user',
  'models/account',
  'models/profile-image',
  'lib/promise',
  'lib/channels/null'
], function (Chai, sinon, _, AvatarMixin, BaseView, Notifications, Relier,
    User, Account, ProfileImage, p, NullChannel) {
  var assert = Chai.assert;

  var SettingsView = BaseView.extend({});

  _.extend(SettingsView.prototype, AvatarMixin);

  describe('views/mixins/avatar-mixin', function () {
    var view;
    var user;
    var account;
    var relier;
    var tabChannelMock;
    var notifications;
    var UID = '123';

    beforeEach(function () {
      user = new User();
      account = new Account();
      relier = new Relier();
      tabChannelMock = new NullChannel();

      notifications = new Notifications({
        tabChannel: tabChannelMock
      });

      account.set('uid', UID);

      view = new SettingsView({
        user: user,
        relier: relier,
        notifications: notifications
      });
      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });
      sinon.spy(user, 'setAccount');

      sinon.stub(notifications, 'profileChanged', function () { });
    });

    it('displayAccountProfileImage updates the cached account data', function () {
      var image = new ProfileImage({ url: 'url', id: 'foo', img: new Image() });
      var cachedAccount = user.initAccount({ uid: 'uid' });
      sinon.spy(cachedAccount, 'setProfileImage');

      sinon.stub(account, 'fetchCurrentProfileImage', function () {
        return p(image);
      });
      sinon.stub(user, 'getAccountByUid', function () {
        return cachedAccount;
      });

      return view.displayAccountProfileImage(account)
        .then(function () {
          assert.isTrue(account.fetchCurrentProfileImage.called);
          assert.isTrue(user.getAccountByUid.calledWith(UID));
          assert.isTrue(user.setAccount.calledWith(cachedAccount));
          assert.isTrue(cachedAccount.setProfileImage.calledWith(image));
          assert.isTrue(view.hasDisplayedAccountProfileImage());
        });
    });

    describe('updateProfileImage', function () {
      it('stores the url', function () {
        view.updateProfileImage(new ProfileImage({ url: 'url' }));
        assert.equal(account.get('profileImageUrl'), 'url');
        assert.isTrue(view.getSignedInAccount.called);
        assert.isTrue(user.setAccount.calledWith(account));
        assert.isTrue(notifications.profileChanged.calledWith({ uid: UID }));
      });

      it('deletes the url if null', function () {
        sinon.stub(account, 'fetchCurrentProfileImage', function () {
          return p(new ProfileImage({ url: 'url', id: 'foo' }));
        });
        sinon.stub(account, 'deleteAvatar', function () {
          return p();
        });

        return view.displayAccountProfileImage(account)
          .then(function () {
            assert.isTrue(account.fetchCurrentProfileImage.called);
            return view.deleteDisplayedAccountProfileImage(account);
          })
          .then(function () {
            assert.isTrue(account.deleteAvatar.calledWith('foo'));
            assert.isFalse(account.has('profileImageUrl'));
            assert.isTrue(user.setAccount.calledWith(account));
            assert.isTrue(notifications.profileChanged.calledWith({ uid: UID }));
          });
      });
    });

  });
});

