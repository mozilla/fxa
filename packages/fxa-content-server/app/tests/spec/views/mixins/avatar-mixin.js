/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
  'lib/metrics',
  'lib/profile-errors',
  'lib/promise',
  'lib/channels/null',
  '../../../lib/helpers'
], function (Chai, sinon, _, AvatarMixin, BaseView, Notifications, Relier,
    User, Account, ProfileImage, Metrics, ProfileErrors, p, NullChannel,
    TestHelpers) {
  'use strict';

  var assert = Chai.assert;

  var SettingsView = BaseView.extend({});

  _.extend(SettingsView.prototype, AvatarMixin);

  describe('views/mixins/avatar-mixin', function () {
    var view;
    var user;
    var account;
    var relier;
    var metrics;
    var tabChannelMock;
    var notifications;
    var UID = '123';

    beforeEach(function () {
      user = new User();
      account = new Account();
      relier = new Relier();
      metrics = new Metrics();
      tabChannelMock = new NullChannel();

      notifications = new Notifications({
        tabChannel: tabChannelMock
      });

      account.set('uid', UID);

      view = new SettingsView({
        user: user,
        relier: relier,
        metrics: metrics,
        notifications: notifications
      });
      sinon.stub(view, 'getSignedInAccount', function () {
        return account;
      });
      sinon.spy(user, 'setAccount');

      sinon.stub(notifications, 'profileChanged', function () { });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    describe('displayAccountProfileImage', function () {
      it('does not log an error for a non-authenticated account', function () {
        return view.displayAccountProfileImage(account)
          .then(function () {
            var err = view._normalizeError(ProfileErrors.toError('UNAUTHORIZED'));
            assert.isFalse(TestHelpers.isErrorLogged(metrics, err));
          });
      });
      it('logs other kind of errors', function () {
        sinon.stub(account, 'fetchCurrentProfileImage', function () {
          return p.reject(ProfileErrors.toError('SERVICE_UNAVAILABLE'));
        });
        return view.displayAccountProfileImage(account)
          .then(function () {
            var err = view._normalizeError(ProfileErrors.toError('SERVICE_UNAVAILABLE'));
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
          });
      });
    });

    it('displayAccountProfileImage updates the cached account data', function () {
      var image = new ProfileImage({ url: 'url', id: 'foo', img: new Image() });

      sinon.spy(account, 'setProfileImage');
      sinon.stub(account, 'fetchCurrentProfileImage', function () {
        return p(image);
      });

      return view.displayAccountProfileImage(account)
        .then(function () {
          assert.isTrue(account.fetchCurrentProfileImage.called);
          assert.isTrue(user.setAccount.calledWith(account));
          assert.isTrue(account.setProfileImage.calledWith(image));
          assert.isTrue(view.hasDisplayedAccountProfileImage());
        });
    });

    describe('updateProfileImage', function () {
      it('stores the url', function () {
        view.updateProfileImage(new ProfileImage({ url: 'url' }), account);
        assert.equal(account.get('profileImageUrl'), 'url');
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

