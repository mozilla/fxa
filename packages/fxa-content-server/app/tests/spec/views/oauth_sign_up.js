/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import ExperimentGroupingRules from 'lib/experiments/grouping-rules/index';
import FormPrefill from 'models/form-prefill';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import OAuthBroker from 'models/auth_brokers/oauth-redirect';
import OAuthClient from 'lib/oauth-client';
import OAuthRelier from 'models/reliers/oauth';
import Session from 'lib/session';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/sign_up';
import WindowMock from '../../mocks/window';

function fillOutSignUp(email, password, opts) {
  opts = opts || {};
  var context = opts.context || window;
  var year = opts.year || '24';

  context.$('[type=email]').val(email);
  context.$('[type=password]').val(password);

  if (!opts.ignoreYear) {
    context.$('#age').val(year);
  }
}

var CLIENT_ID = 'dcdb5ae7add825d2';
var STATE = '123';
var SCOPE = 'profile:email';
var CLIENT_NAME = '123Done';
var BASE_REDIRECT_URL = 'http://127.0.0.1:8080/api/oauth';

describe('views/sign_up for /oauth/signup', function() {
  var broker;
  var email;
  var encodedLocationSearch;
  let experimentGroupingRules;
  var formPrefill;
  var metrics;
  var notifier;
  var oAuthClient;
  var relier;
  var sentryMetrics;
  var user;
  var view;
  var windowMock;

  beforeEach(function() {
    Session.clear();
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
    relier = new OAuthRelier({
      window: windowMock,
    });
    relier.set({
      clientId: CLIENT_ID,
      redirectUri: BASE_REDIRECT_URL,
      scope: SCOPE,
      serviceName: CLIENT_NAME,
      state: STATE,
    });
    broker = new OAuthBroker({
      relier: relier,
      session: Session,
      window: windowMock,
    });

    oAuthClient = new OAuthClient();
    sinon.stub(oAuthClient, 'getClientInfo').callsFake(function() {
      return Promise.resolve({
        name: '123Done',
        redirect_uri: BASE_REDIRECT_URL, //eslint-disable-line camelcase
      });
    });

    user = new User({});
    experimentGroupingRules = new ExperimentGroupingRules();
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });

    view = new View({
      broker,
      experimentGroupingRules,
      formPrefill,
      metrics,
      notifier,
      oAuthClient,
      relier,
      user,
      viewName: 'oauth.signup',
      window: windowMock,
    });

    return view.render();
  });

  afterEach(function() {
    Session.clear();
    view.remove();
    view.destroy();
  });

  describe('render', function() {
    it('displays oAuth client name', function() {
      return view.render().then(function() {
        assert.include(view.$('#fxa-signup-header').text(), CLIENT_NAME);
        // also make sure link is correct
        assert.equal(
          view.$('.sign-in').attr('href'),
          '/oauth/signin' + encodedLocationSearch
        );
      });
    });

    it('adds OAuth params to links on the page', function() {
      return view.render().then(function() {
        assert.equal(
          view.$('#have-account').attr('href'),
          '/oauth/signin' + encodedLocationSearch
        );
      });
    });
  });

  describe('submit', function() {
    it('delegates to view.afterSignUp', () => {
      fillOutSignUp(email, 'password', { context: view });

      sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());

      return view.submit().then(function() {
        assert.isTrue(view.signUp.calledOnce);
        assert.equal(view.signUp.args[0][0].get('email'), email);
        assert.equal(view.signUp.args[0][1], 'password');
      });
    });
  });
});
