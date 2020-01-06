/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/two_step_authentication';

describe('views/settings/two_step_authentication', () => {
  let account;
  let broker;
  let email;
  let metrics;
  let notifier;
  let featureEnabled;
  let hasToken;
  let relier;
  let sentryMetrics;
  let validCode;
  const UID = '123';
  let user;
  let view;

  function initView() {
    view = new View({
      broker,
      metrics,
      notifier,
      relier,
      user,
    });

    sinon
      .stub(view, 'setupSessionGateIfRequired')
      .callsFake(() => Promise.resolve(featureEnabled));
    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    sinon.stub(view, 'checkCode').callsFake(() => {
      return Promise.resolve(validCode);
    });

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    relier = new Relier();

    sinon.stub(account, 'checkTotpTokenExists').callsFake(() => {
      return Promise.resolve({ exists: hasToken, verified: hasToken });
    });

    sinon.stub(account, 'verifyTotpCode').callsFake(() => {
      return Promise.resolve({ success: validCode });
    });

    sinon.stub(account, 'deleteTotpToken').callsFake(() => Promise.resolve({}));

    sinon.stub(account, 'createTotpToken').callsFake(() => {
      return Promise.resolve({
        qrCodeUrl: 'data:image/png;base64,iVBOR',
        secret: 'MZEE 4ODK',
      });
    });

    featureEnabled = true;
    hasToken = true;

    return initView();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  it('should show support link', () => {
    assert.equal(view.$('.totp-support-link').length, 1);
    assert.equal(
      view.$('.totp-support-link').attr('href'),
      'https://support.mozilla.org/kb/secure-' +
        'firefox-account-two-step-authentication'
    );
  });

  describe('should show token status', () => {
    beforeEach(() => {
      hasToken = true;
      sinon.spy(metrics, 'logUserPreferences');
      return initView();
    });

    it('should show token status view if user has token', () => {
      assert.equal(view.$('#totp-status .enabled').length, 1);
      assert.equal(view.$('#totp.hidden').length, 1);
    });

    it('logs `two_step_authentication` enabled metric', () => {
      assert.isTrue(metrics.logUserPreferences.calledOnce);
      assert.isTrue(
        metrics.logUserPreferences.calledWith(view.className, true)
      );
    });
  });

  describe('should create new token', () => {
    beforeEach(() => {
      hasToken = false;
      sinon.spy(metrics, 'logUserPreferences');
      return initView().then(() => view.createToken());
    });

    it('should show QR code', () => {
      assert.equal(view.$('#totp').is(':visible'), true);
      assert.equal(
        view.$('img.qr-image').attr('src'),
        'data:image/png;base64,iVBOR'
      );
    });

    it('should not show status section', () => {
      assert.equal(view.$('.totp-list.hidden').length, 1);
    });

    it('logs `two_step_authentication` disabled metric', () => {
      assert.isTrue(metrics.logUserPreferences.calledOnce);
      assert.isTrue(
        metrics.logUserPreferences.calledWith(view.className, false)
      );
    });
  });

  describe('should display error for invalid code', () => {
    beforeEach(() => {
      validCode = false;
      return initView().then(() => {
        sinon.spy(view, 'showValidationError');
        return view.submit();
      });
    });

    it('display error', () => {
      assert.equal(view.showValidationError.callCount, 1);
      assert.equal(
        view.showValidationError.args[0][1].errno,
        1054,
        'invalid code errno'
      );
    });
  });

  describe('should validate token code', () => {
    beforeEach(() => {
      validCode = true;
      sinon.spy(metrics, 'logUserPreferences');
      return initView().then(() => {
        sinon.spy(view, 'render');
        sinon.spy(view, '_showRecoveryCodes');
        view.submit();
      });
    });

    it('confirms code', () => {
      assert.equal(view.render.callCount, 1);
      assert.equal(view._showRecoveryCodes.callCount, 1);
    });

    it('logs `two_step_authentication` enabled metric', () => {
      assert.isTrue(metrics.logUserPreferences.calledOnce);
      assert.isTrue(
        metrics.logUserPreferences.calledWith(view.className, true)
      );
    });
  });

  describe('should delete token', () => {
    beforeEach(() => {
      hasToken = true;
      return initView();
    });

    it('deletes a token and shows success', () => {
      sinon.spy(view, 'navigate');
      sinon.spy(view, 'displaySuccess');
      return view.deleteToken().then(() => {
        assert.equal(
          account.deleteTotpToken.callCount,
          1,
          'called delete token'
        );
        assert.equal(view.displaySuccess.callCount, 1, 'displayed success');
        assert.equal(
          view.navigate.args[0][0],
          '/settings',
          'navigated to settings'
        );
      });
    });
  });
});
