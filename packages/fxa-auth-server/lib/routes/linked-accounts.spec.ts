/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

import sinon from 'sinon';
import { Container } from 'typedi';

// Mutable mock implementations — changed per-test via makeRoutes(options, requireMocks)
// eslint-disable-next-line no-var
var mockOAuth2ClientClass: any = class {};
// eslint-disable-next-line no-var
var mockThirdPartyEventsModule: any = {};

// jest.mock with getters so linked-accounts.ts picks up per-test values.
// Use jest.requireActual to preserve real exports (googleapis depends on google-auth-library internals).
jest.mock('google-auth-library', () => {
  const actual = jest.requireActual('google-auth-library');
  return {
    ...actual,
    get OAuth2Client() {
      return mockOAuth2ClientClass;
    },
  };
});

// Mock axios with a getter so per-test overrides work.
// Default returns the real axios so transitive deps (googleapis, google-maps) work at init time.
// eslint-disable-next-line no-var
var axiosDefaultOverride: any = null;
jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    __esModule: true,
    get default() {
      return axiosDefaultOverride || actual;
    },
  };
});

jest.mock('./utils/third-party-events', () => {
  const actual = jest.requireActual('./utils/third-party-events');
  return new Proxy(actual, {
    get: (target: any, prop: string) =>
      prop in mockThirdPartyEventsModule
        ? mockThirdPartyEventsModule[prop]
        : target[prop],
  });
});

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');
const { AppError: error } = require('@fxa/accounts/errors');

// Set up mock FxaMailer in Container before loading linked-accounts
const mockFxaMailer: any = {
  canSend: sinon.stub().returns(true),
  sendPostAddLinkedAccountEmail: sinon.stub().resolves(),
};
const { FxaMailer } = require('../senders/fxa-mailer');
Container.set(FxaMailer, mockFxaMailer);

const { linkedAccountRoutes } = require('./linked-accounts');

const glean = mocks.mockGlean();

const GOOGLE_PROVIDER = 'google';
const APPLE_PROVIDER = 'apple';

const makeRoutes = function (options: any = {}, requireMocks?: any) {
  const config = options.config || {};
  config.signinConfirmation = config.signinConfirmation || {};

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || mocks.mockMailer();
  const profile = options.profile || mocks.mockProfile();
  const statsd = options.statsd || { increment: sinon.spy() };

  // Apply per-test mock implementations
  if (requireMocks) {
    if (requireMocks['google-auth-library']) {
      mockOAuth2ClientClass = requireMocks['google-auth-library'].OAuth2Client;
    }
    if (requireMocks['axios']) {
      axiosDefaultOverride = requireMocks['axios'];
    } else {
      axiosDefaultOverride = null;
    }
    if (requireMocks['./utils/third-party-events']) {
      mockThirdPartyEventsModule = requireMocks['./utils/third-party-events'];
    }
  } else {
    axiosDefaultOverride = null;
  }

  // Reset FxaMailer stubs
  mockFxaMailer.canSend.resetHistory();
  mockFxaMailer.canSend.returns(true);
  mockFxaMailer.sendPostAddLinkedAccountEmail.resetHistory();
  mockFxaMailer.sendPostAddLinkedAccountEmail.resolves();

  return linkedAccountRoutes(log, db, config, mailer, profile, statsd, glean);
};

function runTest(route: any, request: any, assertions?: any) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('/linked_account', () => {
  let mockLog: any,
    mockDB: any,
    mockMailer: any,
    mockFxaMailer: any,
    mockRequest: any,
    route: any,
    axiosMock: any,
    statsd: any;

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
        mockFxaMailer = mocks.mockFxaMailer();
        mocks.mockOAuthClientInfo();
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
        const mockConfig: any = {};
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
          throw new Error('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(error.ERRNO.THIRD_PARTY_ACCOUNT_ERROR);
        }
      });

      it('should exchange oauth code for `id_token` and create account', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockGoogleUser.email))
        );

        mockRequest.payload.code = 'oauth code';
        const result: any = await runTest(route, mockRequest);

        expect(axiosMock.post.calledOnce).toBe(true);
        expect(axiosMock.post.args[0][1].code).toBe('oauth code');

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createAccount.calledOnce).toBe(true);
        expect(
          mockDB.createLinkedAccount.calledOnceWith(UID, mockGoogleUser.sub)
        ).toBe(true);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
      });

      it('should create new fxa account from new google account, return session, emit Glean events', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockGoogleUser.email))
        );

        const result: any = await runTest(route, mockRequest);

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createAccount.calledOnce).toBe(true);
        expect(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        ).toBe(true);
        expect(
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
        ).toBe(true);

        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
        sinon.assert.calledOnce(glean.registration.complete);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.googleRegComplete,
          mockRequest
        );
      });

      it('should link existing fxa account and new google account and return session', async () => {
        const result: any = await runTest(route, mockRequest);

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createAccount.notCalled).toBe(true);
        expect(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        ).toBe(true);
        expect(mockFxaMailer.sendPostAddLinkedAccountEmail.callCount).toBe(1);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
        // should not be called for existing account
        sinon.assert.notCalled(glean.registration.complete);
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

        const result: any = await runTest(route, mockRequest);

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockGoogleUser.sub,
            GOOGLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.account.calledOnceWith(UID)).toBe(true);
        expect(mockDB.createLinkedAccount.notCalled).toBe(true);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
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

        const result: any = await runTest(route, mockRequest);

        expect(mockDB.totpToken.calledOnce).toBe(true);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(
          mockDB.createSessionToken.args[0][0].tokenVerificationId
        ).toBeTruthy();
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
        expect(result.verificationMethod).toBe('totp-2fa');
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
        const mockConfig: any = {};
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
          throw new Error('should have thrown');
        } catch (err: any) {
          expect(err.errno).toBe(error.ERRNO.THIRD_PARTY_ACCOUNT_ERROR);
        }
      });

      it('should exchange oauth code for `id_token` and create account', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockAppleUser.email))
        );

        mockRequest.payload.code = 'oauth code';
        const result: any = await runTest(route, mockRequest);

        expect(axiosMock.post.calledOnce).toBe(true);
        const urlSearchParams = new URLSearchParams(axiosMock.post.args[0][1]);
        const params = Object.fromEntries(urlSearchParams.entries());

        expect(params.client_secret).toBeDefined();

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createAccount.calledOnce).toBe(true);
        expect(
          mockDB.createLinkedAccount.calledOnceWith(UID, mockAppleUser.sub)
        ).toBe(true);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
      });

      it('should create new fxa account from new apple account, return session, emit Glean events', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(error.unknownAccount(mockAppleUser.email))
        );

        const result: any = await runTest(route, mockRequest);

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createAccount.calledOnce).toBe(true);
        expect(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
        sinon.assert.calledOnce(glean.registration.complete);
        sinon.assert.calledOnceWithExactly(
          glean.thirdPartyAuth.appleRegComplete,
          mockRequest
        );
      });

      it('should link existing fxa account and new apple account and return session', async () => {
        const result: any = await runTest(route, mockRequest);

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.createAccount.notCalled).toBe(true);
        expect(
          mockDB.createLinkedAccount.calledOnceWith(
            UID,
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        ).toBe(true);
        expect(mockFxaMailer.sendPostAddLinkedAccountEmail.callCount).toBe(1);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
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

        const result: any = await runTest(route, mockRequest);

        expect(
          mockDB.getLinkedAccount.calledOnceWith(
            mockAppleUser.sub,
            APPLE_PROVIDER
          )
        ).toBe(true);
        expect(mockDB.account.calledOnceWith(UID)).toBe(true);
        expect(mockDB.createLinkedAccount.notCalled).toBe(true);
        expect(mockDB.createSessionToken.calledOnce).toBe(true);
        expect(result.uid).toBe(UID);
        expect(result.sessionToken).toBeTruthy();
        sinon.assert.calledWithExactly(
          glean.thirdPartyAuth.appleLoginComplete,
          mockRequest
        );
      });
    });
  });

  describe('/linked_account/unlink', () => {
    let mockLog: any, mockDB: any, mockRequest: any, route: any;

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
      const result: any = await runTest(route, mockRequest);
      expect(mockDB.deleteLinkedAccount.calledOnceWith(UID)).toBe(true);
      expect(result.success).toBe(true);
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
        throw new Error('should have failed');
      } catch (err: any) {
        expect(mockDB.deleteLinkedAccount.notCalled).toBe(true);
        expect(err.errno).toBe(138);
      }
    });
  });

  describe('/linked_account/webhook/google_event_receiver', () => {
    const SUB = '7375626A656374';
    let mockLog: any, mockDB: any, mockRequest: any, route: any;

    function makeJWT(type = 'test') {
      const baseEvent: any = {
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

    function setupTest(options: any) {
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
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Received test event: Celo'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.verification'
      );
    });

    it('handles session revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('sessionRevoked') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledOnceWithExactly(
        mockDB.getLinkedAccount,
        SUB,
        'google'
      );
      sinon.assert.calledOnceWithExactly(mockDB.sessions, UID);
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles tokens revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('tokensRevoked') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledOnceWithExactly(
        mockDB.getLinkedAccount,
        SUB,
        'google'
      );
      sinon.assert.calledOnceWithExactly(mockDB.sessions, UID);
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.tokens_revoked'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles token revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('tokenRevoked') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledOnceWithExactly(
        mockDB.getLinkedAccount,
        SUB,
        'google'
      );
      sinon.assert.calledOnceWithExactly(mockDB.sessions, UID);
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.token_revoked'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles account purged event', async () => {
      setupTest({ validateSecurityToken: makeJWT('accountPurged') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 1,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.account_purged'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      sinon.assert.calledWithExactly(
        mockDB.deleteLinkedAccount,
        UID,
        'google'
      );
    });

    it('handles credentials changed event', async () => {
      setupTest({ validateSecurityToken: makeJWT('passwordChanged') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: 'fxauid',
        providerId: 1,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.credential_change_required'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
    });

    it('handles account disabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('accountDisabled') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledOnceWithExactly(
        mockDB.getLinkedAccount,
        SUB,
        'google'
      );
      sinon.assert.calledOnceWithExactly(mockDB.sessions, UID);
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 1,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.account_disabled'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      sinon.assert.calledWithExactly(
        mockDB.deleteLinkedAccount,
        UID,
        'google'
      );
    });

    it('handles account enabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('accountEnabled') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.notCalled(mockDB.getLinkedAccount);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.account_enabled'
      );
    });

    it('handles unknown event', async () => {
      setupTest({ validateSecurityToken: makeJWT('unknown event') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Received unknown event: https://schemas.openid.net/secevent/risc/event-type/unknown'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.unknownEventType.unknown'
      );
    });

    it('ignores unknown sub', async () => {
      const jwt = makeJWT('accountDisabled');
      setupTest({ validateSecurityToken: jwt, unknownAccount: true });
      await runTest(route, mockRequest);
      sinon.assert.notCalled(mockDB.deleteLinkedAccount);
      sinon.assert.notCalled(mockDB.deleteSessionToken);
    });

    it('handles database errors gracefully without unhandled promise rejection', async () => {
      setupTest({ validateSecurityToken: makeJWT('sessionRevoked') });

      // Mock database to throw an error
      mockDB.getLinkedAccount = sinon
        .stub()
        .rejects(new Error('Database connection failed'));

      // This should not throw an unhandled promise rejection
      await runTest(route, mockRequest);

      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.decoded'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processing.sessions_revoked'
      );
      // Should not call processed because the event handler failed
      sinon.assert.notCalled(mockDB.sessions);
      sinon.assert.notCalled(mockDB.deleteSessionToken);
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

      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.decoded'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );
      // Should still process the first session successfully
      sinon.assert.calledWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 1,
      });
      sinon.assert.calledWithExactly(mockDB.deleteSessionToken, {
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
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.decoded'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processing.sessions_revoked'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processed.sessions_revoked'
      );

      // Reset the statsd spy to clear previous calls
      statsd.increment.resetHistory();

      // Second call - should fail because sessions were already revoked
      await runTest(route, mockRequest);

      // Verify that the expected statsd metrics are called for second call
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.decoded'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleGoogleSET.processing.sessions_revoked'
      );
      // The processed metric should still be called even if no sessions were found to revoke
      sinon.assert.calledWithExactly(
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
        statsd.increment.getCalls().map((call: any) => call.args)
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
      sinon.assert.notCalled(mockDB.getLinkedAccount);
      sinon.assert.notCalled(mockDB.sessions);
      sinon.assert.notCalled(mockDB.deleteSessionToken);
    });
  });

  describe('/linked_account/webhook/apple_event_receiver', () => {
    const SUB = '7375626A656374';
    let mockLog: any, mockDB: any, mockRequest: any, route: any;

    function makeJWT(type = 'test') {
      const baseEvent: any = {
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

    function setupTest(options: any) {
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
      mockDB.getLinkedAccount = sinon.spy(() =>
        Promise.resolve({ uid: UID })
      );
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
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.received'
      );
      sinon.assert.notCalled(mockDB.getLinkedAccount);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.email-disabled'
      );
    });

    it('handles email enabled event', async () => {
      setupTest({ validateSecurityToken: makeJWT('email-enabled') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.received'
      );
      sinon.assert.notCalled(mockDB.getLinkedAccount);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.email-enabled'
      );
    });

    it('handles consent revoked event', async () => {
      setupTest({ validateSecurityToken: makeJWT('consent-revoked') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.received'
      );
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 2,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.consent-revoked'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      sinon.assert.calledWithExactly(
        mockDB.deleteLinkedAccount,
        UID,
        'apple'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.consent-revoked'
      );
    });

    it('handles account delete event', async () => {
      setupTest({ validateSecurityToken: makeJWT('account-delete') });
      await runTest(route, mockRequest);
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.received'
      );
      sinon.assert.calledOnceWithExactly(mockDB.deleteSessionToken, {
        id: 'sessionTokenId1',
        uid: UID,
        providerId: 2,
      });
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.account-delete'
      );
      sinon.assert.calledWithExactly(
        mockLog.debug,
        'Revoked 1 third party sessions for user fxauid'
      );
      sinon.assert.calledWithExactly(
        mockDB.deleteLinkedAccount,
        UID,
        'apple'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.account-delete'
      );
    });

    it('ignores unknown sub', async () => {
      const jwt = makeJWT();
      setupTest({ validateSecurityToken: jwt, unknownAccount: true });
      await runTest(route, mockRequest);
      sinon.assert.notCalled(mockDB.deleteLinkedAccount);
      sinon.assert.notCalled(mockDB.deleteSessionToken);
    });

    it('handles database errors gracefully without unhandled promise rejection', async () => {
      setupTest({ validateSecurityToken: makeJWT('consent-revoked') });

      // Mock database to throw an error
      mockDB.getLinkedAccount = sinon
        .stub()
        .rejects(new Error('Database connection failed'));

      // This should not throw an unhandled promise rejection
      await runTest(route, mockRequest);

      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.decoded'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processing.consent-revoked'
      );
      // Should not call processed because the event handler failed
      sinon.assert.notCalled(mockDB.sessions);
      sinon.assert.notCalled(mockDB.deleteLinkedAccount);
    });

    it('verifies statsd metrics are incremented for successful operations', async () => {
      setupTest({ validateSecurityToken: makeJWT('consent-revoked') });

      await runTest(route, mockRequest);

      // Verify that the expected statsd metrics are called
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.received'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.decoded'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processing.consent-revoked'
      );
      sinon.assert.calledWithExactly(
        statsd.increment,
        'handleAppleSET.processed.consent-revoked'
      );
    });
  });
});
