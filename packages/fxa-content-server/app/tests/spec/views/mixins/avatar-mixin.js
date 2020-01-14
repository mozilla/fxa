/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import AvatarMixin from 'views/mixins/avatar-mixin';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import NullChannel from 'lib/channels/null';
import ProfileErrors from 'lib/profile-errors';
import ProfileImage from 'models/profile-image';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

const UID = TestHelpers.createUid();

const SettingsView = BaseView.extend({});
Cocktail.mixin(SettingsView, AvatarMixin);

describe('views/mixins/avatar-mixin', function() {
  let account;
  let metrics;
  let notifier;
  let relier;
  let tabChannelMock;
  let user;
  let view;
  let windowMock;

  beforeEach(function() {
    account = new Account();
    relier = new Relier();
    tabChannelMock = new NullChannel();
    user = new User();
    windowMock = new WindowMock();

    notifier = new Notifier({
      tabChannel: tabChannelMock,
    });
    metrics = new Metrics({ notifier });

    account.set('uid', UID);

    view = new SettingsView({
      metrics: metrics,
      notifier: notifier,
      relier: relier,
      user: user,
      window: windowMock,
    });
    sinon.stub(view, 'getSignedInAccount').callsFake(function() {
      return account;
    });

    sinon.spy(notifier, 'trigger');
  });

  afterEach(function() {
    metrics.destroy();

    view.remove();
    view.destroy();

    view = metrics = null;
  });

  describe('displayAccountProfileImage', function() {
    it('does not log an error for a non-authenticated account', function() {
      sinon.stub(account, 'fetchCurrentProfileImage').callsFake(function() {
        return Promise.reject(ProfileErrors.toError('UNAUTHORIZED'));
      });
      return view.displayAccountProfileImage(account).then(function() {
        const err = view._normalizeError(ProfileErrors.toError('UNAUTHORIZED'));
        assert.isFalse(TestHelpers.isErrorLogged(metrics, err));
      });
    });

    it('does not log an error for an unverified account', function() {
      sinon.stub(account, 'fetchCurrentProfileImage').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNVERIFIED_ACCOUNT'));
      });
      return view.displayAccountProfileImage(account).then(function() {
        var err = view._normalizeError(
          AuthErrors.toError('UNVERIFIED_ACCOUNT')
        );
        assert.isFalse(TestHelpers.isErrorLogged(metrics, err));
      });
    });

    it('logs other kind of errors', function() {
      sinon.stub(account, 'fetchCurrentProfileImage').callsFake(function() {
        return Promise.reject(ProfileErrors.toError('SERVICE_UNAVAILABLE'));
      });
      return view.displayAccountProfileImage(account).then(function() {
        var err = view._normalizeError(
          ProfileErrors.toError('SERVICE_UNAVAILABLE')
        );
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });
    });
  });

  describe('displayAccountProfileImage with spinner in avatar settings view', () => {
    let spinnerView;
    const SpinnerAvatarSettingsView = SettingsView.extend({
      template() {
        return '<div class="avatar-wrapper avatar-settings-view"></div>';
      },
    });

    beforeEach(() => {
      spinnerView = new SpinnerAvatarSettingsView({
        notifier,
        user,
      });
      sinon
        .stub(account, 'fetchCurrentProfileImage')
        .returns(
          Promise.resolve(
            new ProfileImage({ id: 'foo', img: new Image(), url: 'url' })
          )
        );
      sinon.stub(spinnerView, '_shouldShowDefaultProfileImage').returns(false);
      return spinnerView.render();
    });

    it('adds `spinner-completed` class', () =>
      spinnerView.displayAccountProfileImage(account).then(() => {
        assert.equal(
          spinnerView.$('.avatar-settings-view.spinner-completed').length,
          1,
          'expected .avatar-wrapper.avatar-settings-view to also have the .spinner-completed class'
        );
        assert.equal(
          spinnerView.$('.change-avatar-inner').length,
          1,
          'expected .change-avatar-inner to exist and have a length equal to 1'
        );
        assert.equal(
          spinnerView.$('.avatar-settings-view.spinner-completed').length,
          1,
          'expected .avatar-wrapper.avatar-settings-view to also have the .spinner-completed class'
        );
      }));
  });

  describe('displayAccountProfileImage spinner functionality', () => {
    let spinnerView;
    const SpinnerView = SettingsView.extend({
      template() {
        return '<div class="avatar-wrapper"></div>';
      },
    });

    beforeEach(() => {
      spinnerView = new SpinnerView({
        notifier,
        user,
      });
      sinon
        .stub(account, 'fetchCurrentProfileImage')
        .returns(
          Promise.resolve(
            new ProfileImage({ id: 'foo', img: new Image(), url: 'url' })
          )
        );
      sinon.stub(spinnerView, '_shouldShowDefaultProfileImage').returns(false);
      return spinnerView.render();
    });

    it('shows the spinner while fetching the profile image', () => {
      spinnerView.displayAccountProfileImage(account, {
        wrapperClass: '.avatar-wrapper',
      });
      assert.equal(
        spinnerView.$('.avatar-spinner').length,
        1,
        'missing .avatar-spinner element'
      );
      assert.equal(
        spinnerView.$('.avatar-wrapper.with-spinner').length,
        1,
        'expected .avatar-wrapper to also have the .with-spinner class'
      );
    });

    it('resolves and removes the spinner after the completion transition has ended', () => {
      // Expect this to complete within a time shorter than the spinner timeout
      this.timeout(300);

      const displayPromise = spinnerView.displayAccountProfileImage(account, {
        wrapperClass: '.avatar-wrapper',
      });
      const spinnerEl = spinnerView.$('.avatar-spinner');
      assert.equal(spinnerEl.parents('.avatar-wrapper').length, 1);

      // Trigger transitionend events, which would usually be fired via CSS
      setTimeout(() => {
        // Fire one transitionend event for spinner element
        spinnerEl.trigger('transitionend');
        // And another for the spinner's pseudo element, using jQuery.Event
        // this time, so we can set originalEvent
        spinnerEl.trigger(
          $.Event('transitionend', {
            originalEvent: {
              pseudoElement: '::before',
            },
          })
        );
      }, 1);

      return displayPromise.then(() => {
        assert.equal(spinnerEl.parents('.avatar-wrapper').length, 0);
      });
    });

    it('resolves and removes the spinner after a timeout, if the transition somehow never ends', () => {
      this.timeout(900); // Should be greater than the spinner timeout
      sinon.stub(spinnerView, 'setTimeout').callsFake(callback => {
        callback();
      });

      const displayPromise = spinnerView.displayAccountProfileImage(account, {
        wrapperClass: '.avatar-wrapper',
      });
      const spinnerEl = spinnerView.$('.avatar-spinner');
      assert.equal(
        spinnerEl.parents('.avatar-wrapper').length,
        1,
        'expected to find a spinner'
      );

      return displayPromise.then(function() {
        assert.equal(spinnerEl.parents('.avatar-wrapper').length, 0);
      });
    });

    it('handles non-default profile images as expected', () => {
      sinon.spy(spinnerView, 'logViewEvent');

      return spinnerView.displayAccountProfileImage(account).then(() => {
        assert.isFalse(
          spinnerView.$('.avatar-wrapper').hasClass('with-default')
        );
        assert.isTrue(
          spinnerView.$('.avatar-wrapper img').hasClass('profile-image')
        );
        // this should only be true in the avatar settings view
        assert.isFalse(
          spinnerView.$('.avatar-wrapper img').hasClass('change-avatar-spinner')
        );
        assert.isTrue(
          spinnerView.logViewEvent.calledWith('profile_image_shown')
        );
      });
    });

    it('handles default profile images as expected', () => {
      sinon.spy(spinnerView, 'logViewEvent');
      account.fetchCurrentProfileImage.restore();
      sinon
        .stub(account, 'fetchCurrentProfileImage')
        .returns(Promise.resolve(new ProfileImage()));

      return spinnerView.displayAccountProfileImage(account).then(() => {
        assert.isTrue(
          spinnerView.$('.avatar-wrapper').hasClass('with-default')
        );
        assert.isTrue(
          spinnerView.logViewEvent.calledWith('profile_image_not_shown')
        );
      });
    });
  });

  it('displayAccountProfileImage updates the cached account data', function() {
    const image = new ProfileImage({ id: 'foo', img: new Image(), url: 'url' });

    sinon.spy(account, 'setProfileImage');
    sinon.stub(account, 'fetchCurrentProfileImage').callsFake(function() {
      return Promise.resolve(image);
    });

    return view.displayAccountProfileImage(account).then(function() {
      assert.isTrue(account.fetchCurrentProfileImage.called);
      assert.isTrue(account.setProfileImage.calledWith(image));
    });
  });

  describe('updateProfileImage', function() {
    it('stores the url', function() {
      return view
        .updateProfileImage(new ProfileImage({ url: 'url' }), account)
        .then(function() {
          assert.equal(account.get('profileImageUrl'), 'url');
          assert.isTrue(
            notifier.trigger.calledWith(Notifier.PROFILE_CHANGE, { uid: UID })
          );
        });
    });

    it('deletes the url if null', function() {
      sinon.stub(account, 'fetchCurrentProfileImage').callsFake(function() {
        return Promise.resolve(new ProfileImage({ id: 'foo', url: 'url' }));
      });
      sinon.stub(account, 'deleteAvatar').callsFake(function() {
        return Promise.resolve();
      });

      return view
        .displayAccountProfileImage(account)
        .then(function() {
          assert.isTrue(account.fetchCurrentProfileImage.called);
          return view.deleteDisplayedAccountProfileImage(account);
        })
        .then(function() {
          assert.isTrue(account.deleteAvatar.calledWith('foo'));
          assert.isFalse(account.has('profileImageUrl'));
          assert.isTrue(
            notifier.trigger.calledWith(Notifier.PROFILE_CHANGE, { uid: UID })
          );
        });
    });
  });

  describe('updateDisplayName', function() {
    it('stores the name', function() {
      return view.updateDisplayName('joe').then(function() {
        assert.equal(account.get('displayName'), 'joe');
        assert.isTrue(view.getSignedInAccount.called);
        assert.isTrue(
          notifier.trigger.calledWith(Notifier.PROFILE_CHANGE, { uid: UID })
        );
      });
    });
  });

  describe('on profile update', function() {
    var spy;
    beforeEach(function() {
      spy = sinon.spy(SettingsView.prototype, 'onProfileUpdate');
      view = new SettingsView({
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
      });
    });

    afterEach(function() {
      SettingsView.prototype.onProfileUpdate.restore();
    });

    it('call onProfileUpdate after notification', function() {
      notifier.trigger(notifier.COMMANDS.PROFILE_CHANGE, {});
      assert.isTrue(spy.called);
    });
  });

  describe('avatar upload', function() {
    describe('disabled for iOS =< 10', function() {
      beforeEach(function() {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/604.1.34 ' +
          '(KHTML, like Gecko) FxiOS/8.0b1 Mobile/15A5341e Safari/604.1.34';
        view = new SettingsView({
          metrics: metrics,
          notifier: notifier,
          relier: relier,
          user: user,
          window: windowMock,
        });
      });

      it('is disabled', function() {
        assert.isFalse(view.supportsAvatarUpload());
      });
    });

    describe('enabled for iOS > 10', function() {
      beforeEach(function() {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.34 ' +
          '(KHTML, like Gecko) FxiOS/8.0b1 Mobile/15A5341e Safari/604.1.34';
        view = new SettingsView({
          metrics: metrics,
          notifier: notifier,
          relier: relier,
          user: user,
          window: windowMock,
        });
      });

      it('is enabled', function() {
        assert.isTrue(view.supportsAvatarUpload());
      });
    });
  });
});
