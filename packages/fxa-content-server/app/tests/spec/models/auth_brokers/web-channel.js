/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'models/auth_brokers/web-channel',
  'models/reliers/relier',
  'models/user',
  'lib/fxa-client',
  'lib/promise',
  'lib/channels/null',
  'lib/session',
  'lib/auth-errors',
  'views/base',
  '../../../mocks/window'
],
function (chai, sinon, WebChannelAuthenticationBroker, Relier, User, FxaClientWrapper,
      p, NullChannel, Session, AuthErrors, BaseView, WindowMock) {

  var assert = chai.assert;

  describe('models/auth_brokers/web-channel', function () {
    var broker;
    var windowMock;
    var relierMock;
    var channelMock;
    var fxaClientMock;
    var view;
    var user;
    var account;

    beforeEach(function () {
      windowMock = new WindowMock();
      relierMock = new Relier();
      user = new User();

      account = user.initAccount({
        uid: 'uid',
        sessionToken: 'abc123'
      });

      channelMock = new NullChannel();
      sinon.spy(channelMock, 'send');

      fxaClientMock = new FxaClientWrapper({
        relier: relierMock
      });
      broker = new WebChannelAuthenticationBroker({
        window: windowMock,
        relier: relierMock,
        channel: channelMock,
        fxaClient: fxaClientMock,
        session: Session
      });
    });

    function setupCompletesOAuthTest() {
      view = new BaseView({
        window: windowMock
      });

      sinon.stub(broker, 'getOAuthResult', function () {
        return p({});
      });

      sinon.stub(broker, 'sendOAuthResultToRelier', function () {
        return p();
      });

      sinon.spy(view, 'displayError');
    }

    function setupGeneratesOAuthCode() {
      broker._assertionLibrary = {
        generate: function mockGenerate() {
          return p('mock_assertion');
        }
      };

      broker._oAuthClient = {
        getCode: function mockGetCode() {
          var code = '00000000000000000000000000000000' +
                     '00000000000000000000000000000000';
          return p({
            redirect: 'mock?state=STATE&code=' + code
          });
        }
      };
    }


    describe('fetch', function () {
      describe('for the signin/signup flow', function () {
        it('fetches the webChannelId from the query parameters', function () {
          windowMock.location.search = '?webChannelId=test';

          return broker.fetch()
            .then(function () {
              assert.equal(broker.get('webChannelId'), 'test');
            });
        });
      });

      describe('for the verification flow', function () {
        it('fetches the webChannelId from Session.oauth if it exists', function () {
          windowMock.location.search = '?code=code';
          Session.set('oauth', {
            webChannelId: 'test'
          });

          return broker.fetch()
            .then(function () {
              assert.equal(broker.get('webChannelId'), 'test');
            });
        });

        it('does not set webChannelId if Session.oauth does not exist', function () {
          windowMock.location.search = '?code=code';

          return broker.fetch()
            .then(function () {
              assert.isFalse(broker.has('webChannelId'));
            });
        });
      });
    });

    describe('sendOAuthResultToRelier', function () {
      it('sets `closeWindow` to `false` if not already set to `true`', function () {
        return broker.sendOAuthResultToRelier({})
          .then(function () {
            assert.isFalse(channelMock.send.calledWith('oauth_complete', {
              closeWindow: true
            }));
          });
      });

      it('passes along `closeWindow: true`', function () {
        return broker.sendOAuthResultToRelier({ closeWindow: true })
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('oauth_complete', {
              closeWindow: true
            }));
          });
      });
    });

    describe('getChannel', function () {
      it('creates a WebChannel with the id set in the broker', function () {
        var broker = new WebChannelAuthenticationBroker({
          windowMock: windowMock,
          relier: relierMock
        });

        broker.set('webChannelId', 'test');

        var channel = broker.getChannel();
        assert.equal(channel._id, 'test');
      });
    });

    describe('afterSignIn', function () {
      it('calls sendOAuthResultToRelier, tells window to close', function () {
        setupCompletesOAuthTest();

        return broker.afterSignIn(account)
          .then(function () {
            assert.isTrue(
                broker.sendOAuthResultToRelier.calledWith({ closeWindow: true }));
            assert.isFalse(view.displayError.called);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('does not persist key-fetch material by default', function () {
        setupCompletesOAuthTest();
        assert.isFalse(broker.relier.wantsKeys());
        account.set('keyFetchToken', 'keyFetchToken');
        account.set('unwrapBKey', 'unwrapBKey');

        return broker.persist()
          .then(function () {
            return broker.beforeSignUpConfirmationPoll(account);
          })
          .then(function () {
            assert.isUndefined(broker.session.oauth.keyFetchToken);
            assert.isUndefined(broker.session.oauth.unwrapBKey);
          });
      });

      it('persists key-fetch material if the relier wants keys', function () {
        setupCompletesOAuthTest();
        sinon.stub(broker.relier, 'wantsKeys', function () {
          return true;
        });

        return broker.persist()
          .then(function () {
            account.set('keyFetchToken', 'keyFetchToken');
            account.set('unwrapBKey', 'unwrapBKey');
            return broker.beforeSignUpConfirmationPoll(account);
          })
          .then(function () {
            assert.equal(broker.session.oauth.keyFetchToken, 'keyFetchToken');
            assert.equal(broker.session.oauth.unwrapBKey, 'unwrapBKey');
          });
      });
    });

    describe('afterCompleteSignUp', function () {
      it('calls sendOAuthResultToRelier if there is session data present', function () {
        setupCompletesOAuthTest();
        return broker.persist()
          .then(function () {
            return broker.afterCompleteSignUp(account);
          })
          .then(function () {
            assert.isTrue(broker.sendOAuthResultToRelier.called);
            assert.isFalse(view.displayError.called);
          });
      });

      it('doesn\'t call sendOAuthResultToRelier if there is no session data', function () {
        setupCompletesOAuthTest();
        return broker.persist()
          .then(function () {
            broker.session.clear('oauth');
            return broker.afterCompleteSignUp(account);
          })
          .then(function () {
            assert.isFalse(broker.sendOAuthResultToRelier.called);
          });
      });

      it('retrieves key-fetch material from session if the relier wants keys', function () {
        setupCompletesOAuthTest();
        sinon.stub(broker.relier, 'wantsKeys', function () {
          return true;
        });

        return broker.persist()
          .then(function () {
            account.set('keyFetchToken', 'keyFetchToken');
            account.set('unwrapBKey', 'unwrapBKey');
            return broker.beforeSignUpConfirmationPoll(account);
          })
          .then(function () {
            account.set('keyFetchToken', null);
            account.set('unwrapBKey', null);
            return broker.afterCompleteSignUp(account);
          })
          .then(function () {
            assert.isTrue(broker.sendOAuthResultToRelier.called);
            assert.equal(account.get('keyFetchToken'), 'keyFetchToken');
            assert.equal(account.get('unwrapBKey'), 'unwrapBKey');
          });
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('calls sendOAuthResultToRelier if there is session data present', function () {
        setupCompletesOAuthTest();
        return broker.persist()
          .then(function () {
            return broker.afterSignUpConfirmationPoll(account);
          })
          .then(function () {
            assert.isTrue(broker.sendOAuthResultToRelier.called);
            assert.isFalse(view.displayError.called);
          });
      });

      it('doesn\'t call sendOAuthResultToRelier if there is no session data', function () {
        setupCompletesOAuthTest();
        return broker.persist()
          .then(function () {
            broker.session.clear('oauth');
            return broker.afterSignUpConfirmationPoll(account);
          })
          .then(function () {
            assert.isFalse(broker.sendOAuthResultToRelier.called);
          });
      });
    });

    describe('afterCompleteResetPassword', function () {
      it('calls sendOAuthResultToRelier if there is session data present', function () {
        setupCompletesOAuthTest();

        return broker.persist()
          .then(function () {
            return broker.afterCompleteResetPassword(account);
          })
          .then(function () {
            assert.isTrue(broker.sendOAuthResultToRelier.called);
            assert.isFalse(view.displayError.called);
          });
      });

      it('doesn\'t call sendOAuthResultToRelier if there is no session data', function () {
        setupCompletesOAuthTest();
        return broker.persist()
          .then(function () {
            broker.session.clear('oauth');
            return broker.afterCompleteResetPassword(account);
          })
          .then(function () {
            assert.isFalse(broker.sendOAuthResultToRelier.called);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('calls sendOAuthResultToRelier if there is session data present', function () {
        setupCompletesOAuthTest();

        return broker.persist()
          .then(function () {
            return broker.afterResetPasswordConfirmationPoll(account);
          })
          .then(function () {
            assert.isTrue(broker.sendOAuthResultToRelier.called);
            assert.isFalse(view.displayError.called);
          });
      });

      it('doesn\'t call sendOAuthResultToRelier if there is no session data', function () {
        setupCompletesOAuthTest();
        return broker.persist()
          .then(function () {
            broker.session.clear('oauth');
            return broker.afterResetPasswordConfirmationPoll(account);
          })
          .then(function () {
            assert.isFalse(broker.sendOAuthResultToRelier.called);
          });
      });
    });

    describe('getOAuthResult', function () {
      it('does not derive keys by default', function () {
        setupGeneratesOAuthCode();

        return broker.getOAuthResult(account)
          .then(function (result) {
            assert.isFalse('keys' in result);
          });
      });

      it('returns null keys when keyFetchToken is missing', function () {
        setupGeneratesOAuthCode();
        sinon.stub(broker.relier, 'wantsKeys', function () {
          return true;
        });

        return broker.getOAuthResult(account)
          .then(function (result) {
            assert.equal(result.keys, null);
          });
      });

      it('derives keys when keyFetchToken is available', function () {
        setupGeneratesOAuthCode();
        sinon.stub(broker.relier, 'wantsKeys', function () {
          return true;
        });
        sinon.stub(broker._fxaClient, 'accountKeys', function () {
          return p('MASTER KEYS');
        });
        sinon.stub(broker.relier, 'deriveRelierKeys', function () {
          return p('RELIER KEYS');
        });
        account.set('keyFetchToken', 'keyFetchToken');
        account.set('unwrapBKey', 'unwrapBKey');

        return broker.getOAuthResult(account)
          .then(function (result) {
            assert.isTrue(
                broker._fxaClient.accountKeys.calledWith('keyFetchToken', 'unwrapBKey'));
            assert.isTrue(
                broker.relier.deriveRelierKeys.calledWith('MASTER KEYS', 'uid'));
            assert.equal(result.keys, 'RELIER KEYS');
          });
      });
    });

    describe('old style channels', function () {
      describe('send', function () {
        it('sends a message', function () {
          return broker.send('message')
            .then(function () {
              assert.isTrue(channelMock.send.calledWith('message'));
            });
        });
      });

      describe('request', function () {
        it('sends a message and waits for a response', function () {
          return broker.request('request_message')
            .then(function () {
              assert.isTrue(channelMock.send.calledWith('request_message'));
            });
        });
      });
    });

    describe('new style channels', function () {
      beforeEach(function () {
        channelMock.send = sinon.spy(function () {
          return p();
        });

        channelMock.request = sinon.spy(function () {
          return p();
        });
      });

      describe('send', function () {
        it('sends a message', function () {
          return broker.send('message')
            .then(function () {
              assert.isTrue(channelMock.send.calledWith('message'));
            });
        });
      });

      describe('request', function () {
        it('sends a message and waits for a response', function () {
          return broker.request('request_message')
            .then(function () {
              assert.isTrue(channelMock.request.calledWith('request_message'));
            });
        });
      });
    });
  });
});


