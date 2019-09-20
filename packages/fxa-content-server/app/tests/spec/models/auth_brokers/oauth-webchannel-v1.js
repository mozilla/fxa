/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Constants from 'lib/constants';
import WebChannel from 'lib/channels/web';
import OAuthWebChannelBroker from 'models/auth_brokers/oauth-webchannel-v1';
import Relier from 'models/reliers/base';
import Session from 'lib/session';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../../mocks/window';
import _ from 'underscore';

const HEX_CHARSET = '0123456789abcdef';
function generateOAuthCode() {
  let code = '';

  for (let i = 0; i < 64; ++i) {
    code += HEX_CHARSET.charAt(Math.floor(Math.random() * 16));
  }

  return code;
}

const OAUTH_STATUS_MESSAGE = 'fxaccounts:fxa_status';
const OAUTH_LOGIN_MESSAGE = 'fxaccounts:oauth_login';
const REDIRECT_URI = 'https://127.0.0.1:8080';
const VALID_OAUTH_CODE = generateOAuthCode();

describe('models/auth_brokers/oauth-webchannel-v1', () => {
  let account;
  let broker;
  let channelMock;
  let metrics;
  let relier;
  let user;
  let windowMock;

  function createAuthBroker(options = {}) {
    broker = new OAuthWebChannelBroker(
      _.extend(
        {
          notificationChannel: channelMock,
          metrics: metrics,
          relier: relier,
          session: Session,
          window: windowMock,
        },
        options
      )
    );
    sinon.spy(broker, 'send');
    broker.DELAY_BROKER_RESPONSE_MS = 0;
  }

  beforeEach(() => {
    metrics = {
      flush: sinon.spy(() => Promise.resolve()),
      logEvent: () => {},
    };
    relier = new Relier({
      action: 'action',
      clientId: 'clientId',
      redirectUri: REDIRECT_URI,
      scope: 'scope',
      service: 'service',
      state: 'state',
    });
    user = new User();

    windowMock = new WindowMock();

    channelMock = new WebChannel('web_channel');
    channelMock.initialize({ window: windowMock });

    //channelMock = new NullChannel();
    channelMock.send = sinon.spy(() => Promise.resolve());
    channelMock.request = sinon.spy(() => Promise.resolve());
    channelMock.isFxaStatusSupported = sinon.spy(() => true);

    account = user.initAccount({
      sessionToken: 'abc123',
    });
    sinon.stub(account, 'createOAuthCode').callsFake(() => {
      return Promise.resolve({
        code: VALID_OAUTH_CODE,
        redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        state: 'state',
      });
    });

    createAuthBroker();

    sinon.spy(broker, 'finishOAuthFlow');

    return broker.fetch();
  });

  it('status message', () => {
    return broker.fetch().then(() => {
      const statusMsg = channelMock.request.getCall(0).args;
      assert.equal(statusMsg[0], OAUTH_STATUS_MESSAGE);
      assert.deepEqual(statusMsg[1], { isPairing: false, service: 'service' });
    });
  });

  it('has the fxaStatus capability', () => {
    assert.isTrue(broker.hasCapability('fxaStatus'));
  });

  it('status capability - choose_what_to_sync: true with engines', done => {
    channelMock.request = sinon.spy(() =>
      Promise.resolve({
        capabilities: {
          choose_what_to_sync: true,
          engines: ['history'],
        },
      })
    );
    createAuthBroker();
    broker.fetch();
    // setTimeout due to async nature of the messages
    setTimeout(() => {
      const engines = broker.get('chooseWhatToSyncWebV1Engines');
      assert.ok(engines.get('history'));
      assert.ok(engines.length, 1);
      done();
    }, 5);
  });

  it('status capability - choose_what_to_sync: false', done => {
    channelMock.request = sinon.spy(() =>
      Promise.resolve({
        capabilities: {
          choose_what_to_sync: false,
          engines: ['history'],
        },
      })
    );
    createAuthBroker();
    broker.fetch();
    // setTimeout due to async nature of the messages
    setTimeout(() => {
      const engines = broker.get('chooseWhatToSyncWebV1Engines');
      assert.equal(engines, null);
      done();
    });
  });

  it('passes code and state', () => {
    return broker
      .sendOAuthResultToRelier({
        code: 'code',
        state: 'state',
      })
      .then(() => {
        const loginMsg = broker.send.getCall(0).args;
        assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
        assert.deepEqual(loginMsg[1], {
          code: 'code',
          state: 'state',
          redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        });
      });
  });

  it('handles declinedSyncEngines and offeredSyncEngines', () => {
    account.set('declinedSyncEngines', ['history']);
    account.set('offeredSyncEngines', ['history']);

    return broker
      .sendOAuthResultToRelier(
        {
          redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        },
        account
      )
      .then(() => {
        const loginMsg = broker.send.getCall(0).args;
        assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
        assert.deepEqual(loginMsg[1], {
          declinedSyncEngines: ['history'],
          offeredSyncEngines: ['history'],
          redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
          state: 'state',
        });
      });
  });

  describe('login with an error', () => {
    it('appends an error query parameter', () => {
      return broker
        .sendOAuthResultToRelier({
          error: 'error',
        })
        .then(() => {
          const loginMsg = broker.send.getCall(0).args;
          assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
          assert.deepEqual(loginMsg[1], {
            error: 'error',
            redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
            state: 'state',
          });
        });
    });
  });

  describe('login with an action', () => {
    it('appends an action query parameter', () => {
      const action = Constants.OAUTH_ACTION_SIGNIN;
      return broker
        .sendOAuthResultToRelier({
          action: action,
        })
        .then(() => {
          const loginMsg = broker.send.getCall(0).args;
          assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
          assert.deepEqual(loginMsg[1], {
            action: action,
            redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
            state: 'state',
          });
        });
    });
  });

  describe('login with existing query parameters', () => {
    it('passes through existing parameters unchanged', () => {
      return broker
        .sendOAuthResultToRelier({
          error: 'error',
        })
        .then(() => {
          const loginMsg = broker.send.getCall(0).args;
          assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
          assert.deepEqual(loginMsg[1], {
            error: 'error',
            redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
            state: 'state',
          });
        });
    });
  });
});
