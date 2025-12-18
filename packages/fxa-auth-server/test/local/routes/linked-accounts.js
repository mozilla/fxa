/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const proxyquire = require('proxyquire');
const glean = mocks.mockGlean();

const GOOGLE_PROVIDER = 'google';
const APPLE_PROVIDER = 'apple';

const makeRoutes = function (options = {}, requireMocks) {
  const config = options.config || {};
  config.signinConfirmation = config.signinConfirmation || {};

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || mocks.mockMailer();
  const profile = options.profile || mocks.mockProfile();
  const statsd = options.statsd || { increment: sinon.spy() };

  const { linkedAccountRoutes } = proxyquire(
    '../../../lib/routes/linked-accounts',
    requireMocks || {}
  );

  return linkedAccountRoutes(log, db, config, mailer, profile, statsd, glean);
};

function runTest(route, request, assertions) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('/linked_account', function () {
  this.timeout(5000);
  let mockLog, mockDB, mockMailer, mockRequest, route, axiosMock, statsd;

  const UID = 'fxauid';

  describe('/linked_account/login', () => {
    describe('google auth', () => {
      const mockGoogleUser = {
        sub: '123123123',
        email: `${Math.random()}@gmail.com`,
      };

      beforeEach(async () => {
        mockLog = mocks.mockLog();
        mockDB = mocks.mockDB({
          email: mockGoogleUser.email,
          uid: UID,
        });
        const mockConfig = {
          googleAuthConfig: { clientId: 'OooOoo' },
        };
        mockMailer = mocks.mockMailer();
        mockRequest = mocks.mockRequest({
          log: mockLog,
          payload: {
            provider: 'google',
            code: '123',
            service: 'sync',
          },
        });
        statsd = { increment: sinon.spy() };

        const OAuth2ClientMock = class OAuth2Client {
          verifyIdToken() {
            return {
              getPayload: () => {
                return mockGoogleUser;
              },
            };
          }
        };

        const mockGoogleAuthResponse = {
          data: { id_token: 'somedata' },
        };
        axiosMock = {
          post: sinon.spy(() => mockGoogleAuthResponse),
        };

        route = getRoute(
          makeRoutes(
            {
              config: mockConfig,
              db: mockDB,
              log: mockLog,
              mailer: mockMailer,
              statsd,
            },
            {
              'google-auth-library': {
                OAuth2Client: OAuth2ClientMock,
              },
              axios: axiosMock,
            }
          ),
          '/linked_account/login'
        );
        glean.registration.complete.reset();
        glean.thirdPartyAuth.googleLoginComplete.reset();
        glean.thirdPartyAuth.googleRegComplete.reset();
      });

      it('fails if no google config', async () => {
        const mockConfig = {};
        mockConfig.googleAuthConfig = {};

        route = getRoute(
          makeRoutes({
            config: mockConfig,
            db: mockDB,
            log: mockLog,
            mailer: mockMailer,
            statsd,
          }),
          '/linked_account/login'
        );

        try {
          await runTest(route, mockRequest);
          assert.fail();
        } catch (err) {
          assert.equal(err.errno, error.ERRNO.THIRD_PARTY_ACCOUNT_ERROR);
        }
      });

      it('should exchange oauth code for `id_token` and create account', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockGoogleUser.email))
        );

        mockRequest.payload.code = 'oauth code';
        const result = await runTest(route, mockRequest);

        assert.isTrue(axiosMock.post.calledOnce);
        assert.equal(axiosMock.post.args[0][1].code, 'oauth code');

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createAccount.calledOnce);
        assert.isTrue(
          mockDB.createLinkedAccount.calledOnceWith(UID, mockGoogleUser.sub)
        );
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
      });

      it('should create new fxa account from new google account, return session, emit Glean events', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockGoogleUser.email))
        );

        const result = await runTest(route, mockRequest);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createAccount.calledOnce);
        assert.isTrue(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        );
        assert.isTrue(
          mockDB.createSessionToken.calledOnceWith(
            sinon.match({
              uid: 'fxauid',
              email: mockGoogleUser.email,
              mustVerify: false,
              uaBrowser: 'Firefox',
              uaBrowserVersion: '57.0',
              uaOS: 'Mac OS X',
              uaOSVersion: '10.13',
              uaDeviceType: null,
              uaFormFactor: null,
              providerId: 1,
            })
          )
        );

        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        assert.calledOnce(glean.registration.complete);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.googleRegComplete,
          mockRequest
        );
      });

      it('should link existing fxa account and new google account and return session', async () => {
        const result = await runTest(route, mockRequest);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createAccount.notCalled);
        assert.isTrue(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        );
        assert.equal(mockMailer.sendPostAddLinkedAccountEmail.callCount, 1);
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        // should not be called for existing account
        assert.notCalled(glean.registration.complete);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.googleLoginComplete,
          mockRequest,
          { reason: 'linking' }
        );
      });

      it('should return session with valid google id token', async () => {
        mockDB.getLinkedAccount = sinon.spy(() =>
          Promise.resolve({
            id: mockGoogleUser.sub,
            uid: UID,
          })
        );

        const result = await runTest(route, mockRequest);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.account.calledOnceWith(UID));
        assert.isTrue(mockDB.createLinkedAccount.notCalled);
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.googleLoginComplete,
          mockRequest
        );
      });

      it('with 2fa enabled', async () => {
        mockDB.getLinkedAccount = sinon.spy(() =>
          Promise.resolve({
            id: mockGoogleUser.sub,
            uid: UID,
          })
        );

        mockDB.totpToken = sinon.spy(() =>
          Promise.resolve({
            verified: true,
            enabled: true,
          })
        );

        const result = await runTest(route, mockRequest);

        assert.isTrue(mockDB.totpToken.calledOnce);
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.ok(mockDB.createSessionToken.args[0][0].tokenVerificationId);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        assert.equal(result.verificationMethod, 'totp-2fa');
      });
    });

    describe('apple auth', () => {
      const mockAppleUser = {
        sub: 'OooOoo',
        email: 'bloop@mozilla.com',
      };

      const privateKey = `-----BEGIN PRIVATE KEY-----
      MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiyvo0X+VQ0yIrOaN
      nlrnUclopnvuuMfoc8HHly3505OhRANCAAQWUcdZ8uTSAsFuwtNy4KtsKqgeqYxg
      l6kwL5D4N3pEGYGIDjV69Sw0zAt43480WqJv7HCL0mQnyqFmSrxj8jMa
      -----END PRIVATE KEY-----`;

      beforeEach(async () => {
        mockLog = mocks.mockLog();
        mockDB = mocks.mockDB({
          email: mockAppleUser.email,
          uid: UID,
        });
        const mockConfig = {
          appleAuthConfig: {
            clientId: 'OooOoo',
            keyId: 'ABC123DEFG',
            privateKey,
            teamId: 'My cool team yo',
          },
        };
        mockMailer = mocks.mockMailer();
        mockRequest = mocks.mockRequest({
          log: mockLog,
          payload: {
            provider: 'apple',
            code: 'ABC123DEFG',
          },
        });

        const mockAppleAuthResponse = {
          data: {
            id_token:
              'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQzEyM0RFRkcifQ.eyJpc3MiOiJERUYxMjNHSElKIiwic3ViIjoiT29vT29vIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTcyMzU4MDg2LCJhdWQiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiZW1haWwiOiJibG9vcEBtb3ppbGxhLmNvbSIsInRlYW1JZCI6Ik15IGNvb2wgdGVhbSB5byJ9.owz0xkgzDr9rLwXhd3TWV2QSRfH2YSnLt7LkS_TS42oGq_cbp1pyqhBtOBNTyvpZT6YKlxAxdmDkAr9x_KI7-A',
            email: 'bloop@mozilla.com',
            user: 'OooOoo',
          },
        };
        axiosMock = {
          post: sinon.spy(() => mockAppleAuthResponse),
        };

        route = getRoute(
          makeRoutes(
            {
              config: mockConfig,
              db: mockDB,
              log: mockLog,
              mailer: mockMailer,
            },
            {
              axios: axiosMock,
            }
          ),
          '/linked_account/login'
        );
        glean.registration.complete.reset();
        glean.thirdPartyAuth.appleLoginComplete.reset();
        glean.thirdPartyAuth.appleRegComplete.reset();
      });

      it('fails if no apple config', async () => {
        const mockConfig = {};
        mockConfig.appleAuthConfig = {};

        route = getRoute(
          makeRoutes({
            config: mockConfig,
            db: mockDB,
            log: mockLog,
            mailer: mockMailer,
            statsd,
          }),
          '/linked_account/login'
        );

        try {
          await runTest(route, mockRequest);
          assert.fail();
        } catch (err) {
          assert.equal(err.errno, error.ERRNO.THIRD_PARTY_ACCOUNT_ERROR);
        }
      });

      it('should exchange oauth code for `id_token` and create account', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockAppleUser.email))
        );

        mockRequest.payload.code = 'oauth code';
        const result = await runTest(route, mockRequest);

        assert.isTrue(axiosMock.post.calledOnce);
        const urlSearchParams = new URLSearchParams(axiosMock.post.args[0][1]);
        const params = Object.fromEntries(urlSearchParams.entries());

        assert.isDefined(params.client_secret);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createAccount.calledOnce);
        assert.isTrue(
          mockDB.createLinkedAccount.calledOnceWith(UID, mockAppleUser.sub)
        );
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
      });

      it('should create new fxa account from new apple account, return session, emit Glean events', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockAppleUser.email))
        );

        const result = await runTest(route, mockRequest);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createAccount.calledOnce);
        assert.isTrue(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        assert.calledOnce(glean.registration.complete);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.appleRegComplete,
          mockRequest
        );
      });

      it('should link existing fxa account and new apple account and return session', async () => {
        const result = await runTest(route, mockRequest);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.createAccount.notCalled);
        assert.isTrue(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        );
        assert.equal(mockMailer.sendPostAddLinkedAccountEmail.callCount, 1);
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.appleLoginComplete,
          mockRequest,
          { reason: 'linking' }
        );
      });

      it('should return session with valid apple id token', async () => {
        mockDB.getLinkedAccount = sinon.spy(() =>
          Promise.resolve({
            id: mockAppleUser.sub,
            uid: UID,
          })
        );

        const result = await runTest(route, mockRequest);

        assert.isTrue(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        );
        assert.isTrue(mockDB.account.calledOnceWith(UID));
        assert.isTrue(mockDB.createLinkedAccount.notCalled);
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
        sinon.assert.calledWithExactly(
          glean.thirdPartyAuth.appleLoginComplete,
          mockRequest
        );
      });
    });
  });

  describe('/linked_account/unlink', () => {
    let mockLog, mockDB, mockRequest, route;

    const UID = 'fxauid';
    const mockGoogleUser = {
      sub: '123123123',
      email: `${Math.random()}@gmail.com`,
    };

    beforeEach(async () => {
      mockLog = mocks.mockLog();
      mockDB = mocks.mockDB({
        email: mockGoogleUser.email,
        uid: UID,
      });
      const mockConfig = {
        googleAuthConfig: { clientId: 'OooOoo' },
      };
      mockRequest = mocks.mockRequest({
        log: mockLog,
        credentials: {
          uid: UID,
        },
        payload: {
          provider: 'google',
        },
      });

      const OAuth2ClientMock = class OAuth2Client {
        verifyIdToken() {
          return {
            getPayload: () => {
              return mockGoogleUser;
            },
          };
        }
      };

      route = getRoute(
        makeRoutes(
          {
            config: mockConfig,
            db: mockDB,
            log: mockLog,
            statsd,
          },
          {
            'google-auth-library': {
              OAuth2Client: OAuth2ClientMock,
            },
          }
        ),
        '/linked_account/unlink'
      );
    });

    it('calls deleteLinkedAccount', async () => {
      const result = await runTest(route, mockRequest);
      assert.isTrue(mockDB.deleteLinkedAccount.calledOnceWith(UID));
      assert.isTrue(result.success);
    });

    it('fails to unlink with incorrect assurance level', async () => {
      mockRequest.auth.credentials.authenticatorAssuranceLevel = 1;
      mockDB.totpToken = sinon.spy(() =>
        Promise.resolve({
          verified: true,
          enabled: true,
        })
      );

      try {
        await runTest(route, mockRequest);
        assert.fail('should have failed');
      } catch (err) {
        assert.isTrue(mockDB.deleteLinkedAccount.notCalled);
        assert.equal(err.errno, 138, 'unconfirmed session');
      }
    });
  });

  describe('/linked_account/webhook/google_event_receiver', () => {
    const SUB = '7375626A656374';
    let mockLog, mockDB, mockRequest, route;

    function makeJWT(type = 'test') {
      const baseEvent = {
        iss: 'https://accounts.google.com/',
        aud: '123456789-abcedfgh.apps.googleusercontent.com',
        iat: 1508184845,
        jti: '756E69717565206964656E746966696572',
      };
      const event = {
        subject: {
          subject_type: 'iss-sub',
          iss: 'https://accounts.google.com/',
          sub: SUB,
        },
        reason: 'hijacking',
      };
      switch (type) {
        case 'test':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/verification':
              { state: 'Celo' },
          };
          return baseEvent;
        case 'sessionRevoked':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked':
              event,
          };
          return baseEvent;
        case 'tokensRevoked':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked':
              event,
          };
          return baseEvent;
        case 'tokenRevoked':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/oauth/event-type/token-revoked':
              event,
          };
          return baseEvent;
        case 'accountPurged':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/account-purged':
              event,
          };
          return baseEvent;
        case 'passwordChanged':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required':
              event,
          };
          return baseEvent;
        case 'accountDisabled':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/account-disabled':
              event,
          };
          return baseEvent;
        case 'accountEnabled':
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/account-enabled':
              event,
          };
          return baseEvent;
        default:
          // Invalid event type
          baseEvent.events = {
            'https://schemas.openid.net/secevent/risc/event-type/unknown': {
              abc: '123',
            },
          };
          return baseEvent;
      }
    }

    function setupTest(options) {
      mockLog = mocks.mockLog();
      mockDB = mocks.mockDB({
        uid: UID,
        sessions: [
          {
            id: 'sessionTokenId1',
            uid: UID,
            providerId: 1, // Google based session
          },
          {
            id: 'sessionTokenId2',
            uid: UID,
            providerId: null, // FxA based session
          },
        ],
      });

      const linkedAccount = { uid: UID };
      mockDB.getLinkedAccount = sinon.spy(() =>
        Promise.resolve(options.unknownAccount ? undefined : linkedAccount)
      );
      const mockConfig = {
        googleAuthConfig: { clientId: 'OooOoo' },
      };
      mockRequest = mocks.mockRequest({
        payload: [],
      });
      statsd = { increment: sinon.spy() };

      route = getRoute(
        makeRoutes(
          {
            config: mockConfig,
            db: mockDB,
            log: mockLog,
            statsd,
          },
          {
            './utils/third-party-events': {
              validateSecurityToken: async () =>
                options.validateSecurityToken !== undefined
                  ? typeof options.validateSecurityToken === 'function'
                    ? await options.validateSecurityToken()
                    : options.validateSecurityToken
                  : makeJWT(),
              isValidClientId: () => true,
              getGooglePublicKey: () => {
                return {
                  pem: 'somekey',
                };
              },
            },
          }
        ),
        '/linked_account/webhook/google_event_receiver'
      );
    }

    it('handles test event', async () => {
      setupTest({ validateSecurityToken: makeJWT() });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledWithExactly(mockLog.debug, 'Received test event: Celo');
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.verification'
      );
    });

    it('handles session revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('sessionRevoked') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledOnceWithExactly(mockDB.getLinkedAccount, SUB, 'google');
      assert.calledOnceWithExactly(mockDB.sessions, UID);
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles tokens revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('tokensRevoked') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledOnceWithExactly(mockDB.getLinkedAccount, SUB, 'google');
      assert.calledOnceWithExactly(mockDB.sessions, UID);
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.tokens_revoked'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles token revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('tokenRevoked') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledOnceWithExactly(mockDB.getLinkedAccount, SUB, 'google');
      assert.calledOnceWithExactly(mockDB.sessions, UID);
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.token_revoked'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles account purged event', async () => {
      setupTest({ validateSecurityToken: makeJWT('accountPurged') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 1,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.account_purged'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      assert.calledWithExactly(mockDB.deleteLinkedAccount, UID, 'google');
    });

    it('handles credentials changed event', async () => {
      setupTest({ validateSecurityToken: makeJWT('passwordChanged') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.credential_change_required'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles account disabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('accountDisabled') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledOnceWithExactly(mockDB.getLinkedAccount, SUB, 'google');
      assert.calledOnceWithExactly(mockDB.sessions, UID);
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 1,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.account_disabled'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      assert.calledWithExactly(mockDB.deleteLinkedAccount, UID, 'google');
    });

    it('handles account enabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('accountEnabled') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.notCalled(mockDB.getLinkedAccount);
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.account_enabled'
      );
    });

    it('handles unknown event', async () => {
      setupTest({ validateSecurityToken: makeJWT('unknown event') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledWithExactly(
        mockLog.debug,
        'Received unknown event: https://schemas.openid.net/secevent/risc/event-type/unknown'
      );
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.unknownEventType.unknown'
      );
    });

    it('ignores unknown sub', async () => {
      const jwt = makeJWT('accountDisabled');
      setupTest({ validateSecurityToken: jwt, unknownAccount: true });
      await runTest(route, mockRequest);
      assert.notCalled(mockDB.deleteLinkedAccount);
      assert.notCalled(mockDB.deleteSessionToken);
    });

    it('handles database errors gracefully without unhandled promise rejection', async () => {
      setupTest({ validateSecurityToken: makeJWT('sessionRevoked') });

      // Mock database to throw an error
      mockDB.getLinkedAccount = sinon
        .stub()
        .rejects(new Error('Database connection failed'));

      // This should not throw an unhandled promise rejection
      await runTest(route, mockRequest);

      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.decoded');
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processing.sessions_revoked'
      );
      // Should not call processed because the event handler failed
      assert.notCalled(mockDB.sessions);
      assert.notCalled(mockDB.deleteSessionToken);
    });

    it('handles session deletion errors gracefully', async () => {
      setupTest({ validateSecurityToken: makeJWT('sessionRevoked') });

      // Mock database to throw an error during session deletion
      mockDB.getLinkedAccount = sinon.stub().resolves({ uid: UID });
      mockDB.sessions = sinon.stub().resolves([
        { id: 'sessionTokenId1', uid: UID, providerId: 1 },
        { id: 'sessionTokenId2', uid: UID, providerId: 1 },
      ]);
      mockDB.deleteSessionToken = sinon
        .stub()
        .onFirstCall()
        .resolves()
        .onSecondCall()
        .rejects(new Error('Session deletion failed'));

      await runTest(route, mockRequest);

      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.decoded');
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );
      // Should still process the first session successfully
      assert.calledWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 1,
      });
      assert.calledWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId2',
        uid: UID,
        providerId: 1,
      });
    });

    it('verifies statsd metrics are incremented for successful operations', async () => {
      setupTest({ validateSecurityToken: makeJWT('sessionRevoked') });

      // First call - should succeed and revoke sessions
      await runTest(route, mockRequest);

      // Verify that the expected statsd metrics are called for first call
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.decoded');
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processing.sessions_revoked'
      );
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );

      // Reset the statsd spy to clear previous calls
      statsd.increment.resetHistory();

      // Second call - should fail because sessions were already revoked
      await runTest(route, mockRequest);

      // Verify that the expected statsd metrics are called for second call
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.received');
      assert.calledWithExactly(statsd.increment, 'handleGoogleSET.decoded');
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processing.sessions_revoked'
      );
      // The processed metric should still be called even if no sessions were found to revoke
      assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );
    });

    it('handles JWT validation failure gracefully', async () => {
      setupTest({ validateSecurityToken: async () => undefined });

      await runTest(route, mockRequest);

      // Debug: print all calls to statsd.increment
      // eslint-disable-next-line no-console
      console.log(
        'statsd.increment calls:',
        statsd.increment.getCalls().map((call) => call.args)
      );

      // Only these two metrics should be called, in order
      sinon.assert.callCount(statsd.increment, 2);
      sinon.assert.calledWithExactly(
        statsd.increment.getCall(0),
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment.getCall(1),
        'handleGoogleSET.validationError'
      );

      // Should not call decoded or processing metrics since validation failed
      assert.notCalled(mockDB.getLinkedAccount);
      assert.notCalled(mockDB.sessions);
      assert.notCalled(mockDB.deleteSessionToken);
    });
  });

  describe('/linked_account/webhook/apple_event_receiver', () => {
    const SUB = '7375626A656374';
    let mockLog, mockDB, mockRequest, route;

    function makeJWT(type = 'test') {
      const baseEvent = {
        iss: 'https://appleid.apple.com',
        aud: 'teamId',
        iat: 1508184845,
        jti: '756E69717565206964656E746966696572',
        events: {
          type: 'email-disabled',
          sub: SUB,
          email: 'ep9ks2tnph@privaterelay.appleid.com',
          is_private_email: 'true',
          event_time: 1508184845,
        },
      };
      baseEvent.events.type = type;
      baseEvent.events = JSON.stringify(baseEvent.events);
      return baseEvent;
    }

    function setupTest(options) {
      mockLog = mocks.mockLog();
      mockDB = mocks.mockDB({
        uid: UID,
        sessions: [
          {
            id: 'sessionTokenId1',
            uid: UID,
            providerId: 2, // Apple based session
          },
          {
            id: 'sessionTokenId2',
            uid: UID,
            providerId: null, // FxA based session
          },
        ],
      });
      mockDB.getLinkedAccount = sinon.spy(() => Promise.resolve({ uid: UID }));
      const mockConfig = {
        appleAuthConfig: { clientId: 'OooOoo', teamId: 'teamId' },
      };
      mockRequest = mocks.mockRequest({
        payload: [],
      });
      statsd = { increment: sinon.spy() };

      route = getRoute(
        makeRoutes(
          {
            config: mockConfig,
            db: mockDB,
            log: mockLog,
            statsd,
          },
          {
            './utils/third-party-events': {
              validateSecurityToken: () =>
                options.validateSecurityToken || makeJWT(),
              isValidClientId: () => true,
              getApplePublicKey: () => {
                return {
                  pem: 'somekey',
                };
              },
            },
          }
        ),
        '/linked_account/webhook/apple_event_receiver'
      );
    }

    it('handles email disabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('email-disabled') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.received');
      assert.notCalled(mockDB.getLinkedAccount);
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.email-disabled'
      );
    });

    it('handles email enabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('email-enabled') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.received');
      assert.notCalled(mockDB.getLinkedAccount);
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.email-enabled'
      );
    });

    it('handles consent revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('consent-revoked') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.received');
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 2,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.consent-revoked'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      assert.calledWithExactly(mockDB.deleteLinkedAccount, UID, 'apple');
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.consent-revoked'
      );
    });

    it('handles account delete event', async () => {
      setupTest({ validateSecurityToken: makeJWT('account-delete') });
      await runTest(route, mockRequest);
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.received');
      assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 2,
      });
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.account-delete'
      );
      assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      assert.calledWithExactly(mockDB.deleteLinkedAccount, UID, 'apple');
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.account-delete'
      );
    });

    it('ignores unknown sub', async () => {
      const jwt = makeJWT();
      setupTest({ validateSecurityToken: jwt, unknownAccount: true });
      await runTest(route, mockRequest);
      assert.notCalled(mockDB.deleteLinkedAccount);
      assert.notCalled(mockDB.deleteSessionToken);
    });

    it('handles database errors gracefully without unhandled promise rejection', async () => {
      setupTest({ validateSecurityToken: makeJWT('consent-revoked') });

      // Mock database to throw an error
      mockDB.getLinkedAccount = sinon
        .stub()
        .rejects(new Error('Database connection failed'));

      // This should not throw an unhandled promise rejection
      await runTest(route, mockRequest);

      assert.calledWithExactly(statsd.increment, 'handleAppleSET.received');
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.decoded');
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processing.consent-revoked'
      );
      // Should not call processed because the event handler failed
      assert.notCalled(mockDB.sessions);
      assert.notCalled(mockDB.deleteLinkedAccount);
    });

    it('verifies statsd metrics are incremented for successful operations', async () => {
      setupTest({ validateSecurityToken: makeJWT('consent-revoked') });

      await runTest(route, mockRequest);

      // Verify that the expected statsd metrics are called
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.received');
      assert.calledWithExactly(statsd.increment, 'handleAppleSET.decoded');
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processing.consent-revoked'
      );
      assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.consent-revoked'
      );
    });
  });
});
