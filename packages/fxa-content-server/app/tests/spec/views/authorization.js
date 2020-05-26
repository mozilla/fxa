/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import OAuthBroker from 'models/auth_brokers/oauth-redirect';
import OAuthClient from 'lib/oauth-client';
import OAuthErrors from 'lib/oauth-errors';
import OAuthRelier from 'models/reliers/oauth';
import Session from 'lib/session';
import SentryMetrics from 'lib/sentry';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import View from 'views/authorization';
import WindowMock from '../../mocks/window';

describe('views/authorization', function () {
  let broker;
  let metrics;
  let notifier;
  let relier;
  let sentryMetrics;
  let oAuthClient;
  let view;
  let windowMock;

  const CLIENT_ID = 'dcdb5ae7add825d2';
  const CLIENT_NAME = '123Done1';
  const SCOPE = 'profile:email';
  const STATE = '123';

  beforeEach(() => {
    windowMock = new WindowMock();
    windowMock.location.search =
      '?client_id=' + CLIENT_ID + '&state=' + STATE + '&scope=' + SCOPE;

    relier = new OAuthRelier();
    relier.set('serviceName', CLIENT_NAME);
    broker = new OAuthBroker({
      relier: relier,
      session: Session,
      window: windowMock,
    });
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });

    oAuthClient = new OAuthClient();

    initView();
  });

  afterEach(function () {
    view.destroy();
  });

  function initView() {
    view = new View({
      broker: broker,
      metrics: metrics,
      notifier: notifier,
      oAuthClient,
      relier: relier,
      viewName: 'authorization',
      window: windowMock,
    });

    sinon.spy(view, 'replaceCurrentPage');
  }

  describe('beforeRender', () => {
    it('handles prompt=none', () => {
      relier.set('prompt', 'none');
      sinon.stub(view, '_doPromptNone').callsFake(() => Promise.resolve());

      return view.render().then((result) => {
        assert.isFalse(result);
        assert.isTrue(view._doPromptNone.calledOnce);
      });
    });

    it('handles default action', () => {
      return view.render().then(() => {
        assert.ok(
          view.replaceCurrentPage.calledOnceWith('/oauth/'),
          'called with proper action'
        );
      });
    });

    it('calls .replaceCurrentPage', () => {
      relier = new OAuthRelier({});
      relier.set({
        action: 'signin',
      });
      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock,
      });
      initView();

      return view.render().then(() => {
        assert.ok(
          view.replaceCurrentPage.calledOnceWith('signin'),
          'called with proper signin action'
        );
      });
    });

    it('action=email calls default action', () => {
      relier = new OAuthRelier({});
      relier.set({
        action: 'email',
      });
      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock,
      });
      initView();

      return view.render().then(() => {
        assert.ok(
          view.replaceCurrentPage.calledOnceWith('/oauth/'),
          'called default action for action=email'
        );
      });
    });
  });

  describe('_doPromptNone', () => {
    let account;

    this.beforeEach(() => {
      account = new Account();

      sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    });

    it('propagates errors from validatePromptNoneRequest', () => {
      sinon
        .stub(relier, 'validatePromptNoneRequest')
        .callsFake(() =>
          Promise.reject(
            AuthErrors.toError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN')
          )
        );
      sinon.stub(view, 'signIn');
      sinon.stub(view, '_handlePromptNoneError');
      sinon.spy(view, '_normalizePromptNoneError');

      return view._doPromptNone().then(() => {
        assert.isTrue(relier.validatePromptNoneRequest.calledOnceWith(account));
        assert.isFalse(view.signIn.called);
        assert.isTrue(view._normalizePromptNoneError.calledOnce);

        assert.isTrue(view._handlePromptNoneError.calledOnce);
        const err = view._handlePromptNoneError.args[0][0];
        assert.isTrue(
          AuthErrors.is(err, 'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN')
        );
      });
    });

    it('propagates errors from signIn', () => {
      sinon
        .stub(relier, 'validatePromptNoneRequest')
        .callsFake(() => Promise.resolve());
      sinon
        .stub(view, 'signIn')
        .callsFake(() =>
          Promise.reject(
            AuthErrors.toError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN')
          )
        );
      sinon.stub(view, '_handlePromptNoneError');
      sinon.spy(view, '_normalizePromptNoneError');

      return view._doPromptNone().then(() => {
        assert.isTrue(relier.validatePromptNoneRequest.calledOnceWith(account));
        assert.isTrue(view.signIn.called);
        assert.isTrue(view._normalizePromptNoneError.calledOnce);

        assert.isTrue(view._handlePromptNoneError.calledOnce);
        const err = view._handlePromptNoneError.args[0][0];
        assert.isTrue(
          AuthErrors.is(err, 'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN')
        );
      });
    });
  });

  describe('_normalizePromptNoneError', () => {
    it('converts INVALID_TOKEN errors to PROMPT_NONE_NOT_SIGNED_IN', () => {
      const invalidTokenErr = AuthErrors.toError('INVALID_TOKEN');
      const normalizedError = view._normalizePromptNoneError(invalidTokenErr);
      assert.isTrue(
        OAuthErrors.is(normalizedError, 'PROMPT_NONE_NOT_SIGNED_IN')
      );
    });

    it('returns other errors as they are', () => {
      const differentUserSignedInError = OAuthErrors.toError(
        'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN'
      );
      const normalizedError = view._normalizePromptNoneError(
        differentUserSignedInError
      );
      assert.isTrue(
        OAuthErrors.is(normalizedError, 'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN')
      );
    });
  });

  describe('_handlePromptNoneError', () => {
    // This error should cause a redirect.
    const oauthErr = OAuthErrors.toError(
      'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN'
    );

    beforeEach(() => {
      sinon
        .stub(broker, 'sendOAuthResultToRelier')
        .callsFake(() => Promise.resolve());
      relier.set('redirectUri', 'https://redirect.to');
    });

    it('sends permitted errors to the RP', () => {
      relier.set('returnOnError', true);

      return view._handlePromptNoneError(oauthErr).then(() => {
        assert.isTrue(
          broker.sendOAuthResultToRelier.calledOnceWith({
            error: 'account_selection_required',
            redirect: 'https://redirect.to',
          })
        );
      });
    });

    it('re-throws errors if RP does not allow returnOnError', () => {
      relier.set('returnOnError', false);

      return view._handlePromptNoneError(oauthErr).then(assert.fail, (_err) => {
        assert.strictEqual(_err, oauthErr);
      });
    });

    it('re-throws other errors', () => {
      // This error lacks an error_response_code, so it should not redirect.
      const authErr = AuthErrors.toError('USER_CANCELED_LOGIN');

      return view._handlePromptNoneError(authErr).then(assert.fail, (_err) => {
        assert.strictEqual(_err, authErr);
      });
    });
  });
});
