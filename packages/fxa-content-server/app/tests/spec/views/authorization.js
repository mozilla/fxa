/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import OAuthBroker from 'models/auth_brokers/oauth-redirect';
import OAuthClient from 'lib/oauth-client';
import OAuthRelier from 'models/reliers/oauth';
import Session from 'lib/session';
import SentryMetrics from 'lib/sentry';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import View from 'views/authorization';
import WindowMock from '../../mocks/window';

describe('views/authorization', function() {
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

  afterEach(function() {
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
});
