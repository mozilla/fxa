/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Constants from 'lib/constants';
import WebChannel from 'lib/channels/web';
import OAuthWebChannelBroker from 'models/auth_brokers/oauth-webchannel-v1';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import Session from 'lib/session';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

const assert = { ...sinon.assert, ...require('chai').assert };

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
const OAUTH_DELETE_ACCOUNT_MESSAGE = 'fxaccounts:delete_account';
const REDIRECT_URI = 'https://localhost:8080';
const VALID_OAUTH_CODE = generateOAuthCode();
const LOGIN_MESSAGE = 'fxaccounts:login';

describe('models/auth_brokers/oauth-webchannel-v1', () => {
  let account;
  let broker;
  let channelMock;
  let metrics;
  let notifier;
  let relier;
  let user;
  let windowMock;

  function createAuthBroker(options = {}) {
    broker = new OAuthWebChannelBroker({
      notificationChannel: channelMock,
      metrics: metrics,
      relier: relier,
      session: Session,
      window: windowMock,
      ...options,
    });
    sinon.spy(broker, 'send');
    broker.DELAY_BROKER_RESPONSE_MS = 0;
  }

  beforeEach(() => {
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    sinon.stub(metrics, 'flush').callsFake(() => Promise.resolve());
    sinon.stub(metrics, 'logEvent').callsFake(() => Promise.resolve());
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
      email: 'test@email.com',
      uid: 'uid',
      verified: true,
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
      assert.deepEqual(statusMsg[1], {
        isPairing: false,
        service: 'service',
        context: null,
      });
    });
  });

  it('has the fxaStatus capability', () => {
    assert.isTrue(broker.hasCapability('fxaStatus'));
  });

  it('capability reuseExistingSession false', () => {
    assert.isFalse(broker.getCapability('reuseExistingSession'));
  });

  it('status capability - choose_what_to_sync: true with engines', (done) => {
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

  it('status capability - choose_what_to_sync: false', (done) => {
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

  it('passes code and state', async () => {
    await broker.sendOAuthResultToRelier({
      code: 'code',
      state: 'state',
    });

    assert.isTrue(metrics.flush.calledOnce);
    const loginMsg = broker.send.getCall(0).args;
    assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
    assert.deepEqual(loginMsg[1], {
      code: 'code',
      state: 'state',
      redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
    });
  });

  it('handles declinedSyncEngines and offeredSyncEngines', async () => {
    account.set('declinedSyncEngines', ['history']);
    account.set('offeredSyncEngines', ['history']);

    await broker.sendOAuthResultToRelier(
      {
        redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
      },
      account
    );

    assert.isTrue(metrics.flush.calledOnce);
    const loginMsg = broker.send.getCall(0).args;
    assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
    assert.deepEqual(loginMsg[1], {
      declinedSyncEngines: ['history'],
      offeredSyncEngines: ['history'],
      redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
      state: 'state',
    });
  });

  it('logs pairing metrics if enabled', async () => {
    broker.setCapability('supportsPairing', true);
    relier.unset('service');
    await broker.sendOAuthResultToRelier(
      {
        redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        action: 'pairing',
      },
      account
    );

    assert.isTrue(metrics.flush.calledOnce);
    assert.isTrue(metrics.logEvent.calledOnceWith('pairing.signin.success'));
    assert.equal(metrics._service, 'clientId');
  });

  describe('login with an error', () => {
    it('appends an error query parameter', async () => {
      await broker.sendOAuthResultToRelier({
        error: 'error',
      });

      assert.isTrue(metrics.flush.calledOnce);
      const loginMsg = broker.send.getCall(0).args;
      assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
      assert.deepEqual(loginMsg[1], {
        error: 'error',
        redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        state: 'state',
      });
    });
  });

  describe('login with an action', () => {
    it('appends an action query parameter', async () => {
      const action = Constants.OAUTH_ACTION_SIGNIN;
      await broker.sendOAuthResultToRelier({
        action: action,
      });

      assert.isTrue(metrics.flush.calledOnce);
      const loginMsg = broker.send.getCall(0).args;
      assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
      assert.deepEqual(loginMsg[1], {
        action: action,
        redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        state: 'state',
      });
    });
  });

  describe('login with existing query parameters', () => {
    it('passes through existing parameters unchanged', async () => {
      await broker.sendOAuthResultToRelier({
        error: 'error',
      });

      assert.isTrue(metrics.flush.calledOnce);
      const loginMsg = broker.send.getCall(0).args;
      assert.equal(loginMsg[0], OAUTH_LOGIN_MESSAGE);
      assert.deepEqual(loginMsg[1], {
        error: 'error',
        redirect: Constants.OAUTH_WEBCHANNEL_REDIRECT,
        state: 'state',
      });
    });
  });

  describe('delete account', () => {
    it('calls correct methods', async () => {
      await broker.afterDeleteAccount(account);

      const msg = broker.send.getCall(0).args;
      assert.equal(msg[0], OAUTH_DELETE_ACCOUNT_MESSAGE);
      assert.deepEqual(msg[1], {
        email: account.get('email'),
        uid: account.get('uid'),
      });
    });
  });

  describe('beforeSignUpConfirmationPoll', () => {
    it('notifies the channel of login with required fields', () => {
      return broker.beforeSignUpConfirmationPoll(account).then((result) => {
        assert.isTrue(broker.send.calledOnce);
        assert.calledWithExactly(broker.send, LOGIN_MESSAGE, {
          sessionToken: 'abc123',
          email: 'test@email.com',
          uid: 'uid',
          verified: true,
          verifiedCanLinkAccount: false,
        });
      });
    });

    it('does not notifiy the channel of login with missing fields', () => {
      account.unset('uid');
      return broker.beforeSignUpConfirmationPoll(account).then((result) => {
        assert.isTrue(broker.send.notCalled);
      });
    });
  });

  describe('afterSignIn', () => {
    it('redirects to ConnectAnotherDevice, notifies the channel of login with required fields', () => {
      return broker
        .afterSignIn(account)
        .then((behavior) => {
          assert.equal(behavior.type, 'connect-another-device');

          assert.calledWithExactly(broker.send.getCall(0), LOGIN_MESSAGE, {
            sessionToken: 'abc123',
            email: 'test@email.com',
            uid: 'uid',
            verified: true,
            verifiedCanLinkAccount: false,
          });
          return new Promise((resolve) => {
            // Hack to ensure 2nd broker.send assertion is after it occurs
            setTimeout(resolve, 0);
          });
        })
        .then(() => {
          assert.calledWithExactly(
            broker.send.getCall(1),
            OAUTH_LOGIN_MESSAGE,
            {
              code: VALID_OAUTH_CODE,
              state: 'state',
              redirect: 'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel',
              action: 'signin',
            }
          );
        });
    });

    it('does not notifiy the channel of login with missing fields', () => {
      account.unset('uid');
      return broker.afterSignIn(account).then(() => {
        assert.isTrue(broker.send.notCalled);
      });
    });
  });

  ['afterCompleteSignInWithCode', 'afterSignUpConfirmationPoll'].forEach(
    (brokerMethod) => {
      describe(brokerMethod, () => {
        it('notifies the channel of login with required fields', () => {
          return broker[brokerMethod](account).then((result) => {
            assert.isTrue(broker.send.calledTwice);
            assert.calledWithExactly(broker.send.getCall(0), LOGIN_MESSAGE, {
              sessionToken: 'abc123',
              email: 'test@email.com',
              uid: 'uid',
              verified: true,
              verifiedCanLinkAccount: false,
            });
            assert.calledWithExactly(
              broker.send.getCall(1),
              OAUTH_LOGIN_MESSAGE,
              {
                code: VALID_OAUTH_CODE,
                state: 'state',
                redirect: 'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel',
                action: brokerMethod.includes('SignIn') ? 'signin' : 'signup',
              }
            );
          });
        });

        it('does not notifiy the channel of login with missing fields', () => {
          account.unset('uid');
          return broker[brokerMethod](account).then((result) => {
            assert.isTrue(broker.send.calledOnce);
          });
        });
      });
    }
  );
});
