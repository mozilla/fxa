/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const $ = require('jquery');
const assert = require('chai').assert;
const Metrics = require('lib/metrics');
const Notifier = require('lib/channels/notifier');
const sinon = require('sinon');
const TestHelpers = require('../../../lib/helpers');
const User = require('models/user');
const View = require('views/settings/two_step_authentication');

describe('views/settings/two_step_authentication', () => {
  let account;
  let email;
  let metrics;
  let notifier;
  let featureEnabled;
  let hasToken;
  let validCode;
  const UID = '123';
  let user;
  let view;

  function initView() {
    view = new View({
      metrics: metrics,
      notifier: notifier,
      user: user
    });

    sinon.stub(view, '_isPanelEnabled').callsFake(() => featureEnabled);
    sinon.stub(view, 'setupSessionGateIfRequired').callsFake(() => Promise.resolve(featureEnabled));
    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.spy(view, 'remove');

    return view.render()
      .then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    metrics = new Metrics({notifier});
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true
    });

    sinon.stub(account, 'checkTotpTokenExists').callsFake(() => {
      return Promise.resolve({exists: hasToken});
    });

    sinon.stub(account, 'verifyTotpCode').callsFake(() => {
      return Promise.resolve({success: validCode});
    });

    sinon.stub(account, 'deleteTotpToken').callsFake(() => Promise.resolve({}));

    sinon.stub(account, 'createTotpToken').callsFake(() => {
      return Promise.resolve({
        qrCodeUrl: 'data:image/png;base64,iVBOR',
        secret: 'MZEE 4ODK'
      });
    });

    featureEnabled = true;
    hasToken = true;
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('feature disabled', () => {
    beforeEach(() => {
      featureEnabled = false;
      return initView();
    });

    it('should remove panel if `showTwoStepAuthentication` query is not specified', () => {
      assert.equal(view.remove.callCount, 1);
    });
  });

  describe('feature enabled', () => {
    beforeEach(() => {
      featureEnabled = true;
      return initView();
    });

    describe('should show token status', () => {
      beforeEach(() => {
        hasToken = true;
        return initView();
      });

      it('should show token status view if user has token', () => {
        assert.equal(view.$('#totp-status .enabled').length, 1);
        assert.equal(view.$('#totp.hidden').length, 1);
      });
    });

    describe('should create new token', () => {
      beforeEach(() => {
        hasToken = false;
        return initView()
          .then(() => view.createToken());
      });

      it('should show QR code', () => {
        assert.equal(view.$('#totp').is(':visible'), true);
        assert.equal(view.$('img.qr-image').attr('src'), 'data:image/png;base64,iVBOR');
      });

      it('should not show status section', () => {
        assert.equal(view.$('.totp-list.hidden').length, 1);
      });

      describe('should show code and hide `show code link`', () => {
        beforeEach(() => {
          assert.equal(view.$('.manual-code.hidden').length, 1);
          assert.equal(view.$('.show-code-link:not(hidden)').length, 1);
          return view.$('.show-code-link').click();
        });

        it('shows correct links', () => {
          assert.equal(view.$('.code')[0].innerText, 'MZEE 4ODK');
          assert.equal(view.$('.manual-code:not(hidden)').length, 1);
          assert.equal(view.$('.show-code-link.hidden').length, 1);
        });
      });
    });

    describe('should display error for invalid code', () => {
      beforeEach(() => {
        validCode = false;
        return initView()
          .then(() => {
            sinon.spy(view, 'showValidationError');
            return view.submit();
          });
      });

      it('display error', () => {
        assert.equal(view.showValidationError.callCount, 1);
        assert.equal(view.showValidationError.args[0][1].errno, 1054, 'invalid code errno');
      });
    });

    describe('should validate token code', () => {
      beforeEach(() => {
        validCode = true;
        return initView()
          .then(() => {
            sinon.spy(view, 'render');
            sinon.spy(view, 'displaySuccess');
            view.submit();
          });
      });

      it('confirms code', () => {
        assert.equal(view.render.callCount, 1);
        assert.equal(view.displaySuccess.callCount, 1);
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
        return view.deleteToken()
          .then(() => {
            assert.equal(account.deleteTotpToken.callCount, 1, 'called delete token');
            assert.equal(view.displaySuccess.callCount, 1, 'displayed success');
            assert.equal(view.navigate.args[0][0], '/settings', 'navigated to settings');
          });
      });
    });
  });
});
