/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import TestHelpers from '../../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/account_recovery/account_recovery';

describe('views/settings/account_recovery/account_recovery', () => {
  let account;
  let broker;
  let email;
  let notifier;
  let hasRecoveryKey;
  let metrics;
  let relier;
  let user;
  let view;

  const UID = '123';

  function initView() {
    view = new View({
      broker,
      metrics,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.spy(view, 'remove');
    sinon.spy(view, 'logFlowEvent');
    sinon.spy(metrics, 'logUserPreferences');
    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    user = new User();
    account = user.initAccount({
      email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    relier = new Relier();

    sinon.stub(account, 'checkRecoveryKeyExists').callsFake(() => {
      return Promise.resolve({ exists: hasRecoveryKey });
    });

    sinon.stub(account, 'sessionVerificationStatus').callsFake(() => {
      return Promise.resolve({ sessionVerified: true });
    });

    hasRecoveryKey = true;
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('should show support link', () => {
    beforeEach(() => {
      return initView();
    });

    it('should show support link', () => {
      assert.lengthOf(view.$('.account-recovery-support-link'), 1);
      assert.equal(
        view.$('.account-recovery-support-link').attr('href'),
        'https://support.mozilla.org/kb/' +
          'reset-your-firefox-account-password-recovery-keys'
      );
    });

    it('should log flowEvent when link clicked', () => {
      view.$('.account-recovery-support-link').click();
      assert.equal(
        view.logFlowEvent.args[0][0],
        'clicked-support-link',
        'passes correct args'
      );
      assert.equal(
        view.logFlowEvent.args[0][1],
        'settings.account-recovery',
        'passes correct args'
      );
    });
  });

  describe('should give option to create recovery key if none exists', () => {
    beforeEach(() => {
      hasRecoveryKey = false;
      return initView();
    });

    it('should show generate recovery key', () => {
      assert.lengthOf(view.$('.confirm-password'), 1);
      assert.lengthOf(view.$('.disabled'), 1);
    });

    it('should navigate to confirm password', () => {
      sinon.spy(view, 'navigate');
      view.$('.confirm-password')[0].click();
      assert.equal(
        view.navigate.args[0][0],
        'settings/account_recovery/confirm_password',
        'navigated to confirm password'
      );
    });

    it('logs `account_recovery` disabled metric', () => {
      assert.isTrue(
        metrics.logUserPreferences.calledWith(view.className, false)
      );
    });
  });

  describe('should give option to revoke recovery key if it exists', () => {
    beforeEach(() => {
      hasRecoveryKey = true;
      return initView();
    });

    it('should show revoke recovery key', () => {
      assert.lengthOf(view.$('.confirm-revoke'), 1);
      assert.lengthOf(view.$('.details .enabled'), 1);
    });

    it('should navigate to confirm revoke', () => {
      sinon.spy(view, 'navigate');
      view.$('.confirm-revoke')[0].click();
      assert.equal(
        view.navigate.args[0][0],
        'settings/account_recovery/confirm_revoke',
        'navigated to confirm revoke'
      );
    });

    it('logs `account_recovery` enabled metric correctly', () => {
      assert.isTrue(
        metrics.logUserPreferences.calledWith(view.className, true)
      );
    });
  });
});
