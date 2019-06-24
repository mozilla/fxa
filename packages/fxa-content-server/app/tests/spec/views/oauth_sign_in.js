/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import FormPrefill from 'models/form-prefill';
import FxaClient from 'lib/fxa-client';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import OAuthBroker from 'models/auth_brokers/oauth-redirect';
import OAuthRelier from 'models/reliers/oauth';
import SentryMetrics from 'lib/sentry';
import Session from 'lib/session';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/sign_in';
import WindowMock from '../../mocks/window';

describe('views/sign_in for /oauth/signin', function() {
  let broker;
  let email;
  let formPrefill;
  let fxaClient;
  let metrics;
  let notifier;
  let profileClientMock;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;
  let encodedLocationSearch;

  const CLIENT_ID = 'dcdb5ae7add825d2';
  const CLIENT_NAME = '123Done';
  const SCOPE = 'profile:email';
  const STATE = '123';

  beforeEach(function() {
    email = TestHelpers.createEmail();
    windowMock = new WindowMock();
    windowMock.location.search =
      '?client_id=' + CLIENT_ID + '&state=' + STATE + '&scope=' + SCOPE;
    encodedLocationSearch =
      '?client_id=' +
      CLIENT_ID +
      '&state=' +
      STATE +
      '&scope=' +
      encodeURIComponent(SCOPE);

    relier = new OAuthRelier();
    relier.set('serviceName', CLIENT_NAME);
    broker = new OAuthBroker({
      relier: relier,
      session: Session,
      window: windowMock,
    });
    fxaClient = new FxaClient();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User({
      fxaClient,
      metrics,
      notifier,
    });
    profileClientMock = TestHelpers.stubbedProfileClient();
    formPrefill = new FormPrefill();

    initView();
  });

  afterEach(function() {
    Session.clear();
    view.destroy();
  });

  function initView() {
    view = new View({
      broker: broker,
      formPrefill: formPrefill,
      fxaClient: fxaClient,
      metrics: metrics,
      notifier: notifier,
      profileClient: profileClientMock,
      relier: relier,
      user: user,
      viewName: 'oauth.signin',
      window: windowMock,
    });
  }

  describe('render', function() {
    it('displays oAuth client name', function() {
      return view.render().then(function() {
        assert.include(view.$('#fxa-signin-header').text(), CLIENT_NAME);
        // also make sure link is correct
        assert.equal(
          view.$('.sign-up').attr('href'),
          '/oauth/signup' + encodedLocationSearch
        );
      });
    });

    it('button is enabled if prefills are valid', function() {
      formPrefill.set('email', 'testuser@testuser.com');
      formPrefill.set('password', 'prefilled password');

      initView();
      return view.render().then(function() {
        assert.isFalse(view.$('button').hasClass('disabled'));
      });
    });

    it('adds OAuth params to links on the page', function() {
      initView();
      return view.render().then(function() {
        assert.equal(
          view.$('.reset-password').attr('href'),
          '/reset_password' + encodedLocationSearch
        );
        assert.equal(
          view.$('.sign-up').attr('href'),
          '/oauth/signup' + encodedLocationSearch
        );
      });
    });
  });

  describe('submit', function() {
    beforeEach(() => view.render());

    it('delegates to `signIn`', () => {
      const account = user.initAccount({});
      sinon.stub(user, 'initAccount').callsFake(() => account);

      sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());

      view.$('.email').val(email);
      view.$('[type=password]').val('password');

      return view.submit().then(() => {
        assert.isTrue(view.signIn.calledOnce);
        assert.isTrue(view.signIn.calledWith(account));
      });
    });
  });

  describe('_suggestSignUp', () => {
    beforeEach(() => {
      const err = AuthErrors.toError('UNKNOWN_ACCOUNT');
      sinon.spy(view, 'unsafeDisplayError');
      return view._suggestSignUp(err);
    });

    it('shows a link to the signup page', () => {
      const err = view.unsafeDisplayError.args[0][0];
      assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
      assert.include(err.forceMessage, '/signup');
      assert.notInclude(err.forceMessage, 'Add-ons');
    });
  });
});
