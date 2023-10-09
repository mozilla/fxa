/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const proxyquire = require('proxyquire');

const GOOGLE_PROVIDER = 'google';
const APPLE_PROVIDER = 'apple';

const makeRoutes = function (options = {}, requireMocks) {
  const config = options.config || {};
  config.signinConfirmation = config.signinConfirmation || {};

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || mocks.mockMailer();
  const profile = options.profile || mocks.mockProfile();

  const { linkedAccountRoutes } = proxyquire(
    '../../../lib/routes/linked-accounts',
    requireMocks || {}
  );

  return linkedAccountRoutes(log, db, config, mailer, profile);
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

describe('/linked_account', () => {
  let mockLog, mockDB, mockMailer, mockRequest, route, axiosMock;

  const UID = 'fxauid';

  describe('/linked_account/login', () => {
    describe('google auth', () => {
      const mockGoogleUser = {
        sub: '123123123',
        email: `${Math.random()}@gmail.com`,
      };

      beforeEach(async () => {
        mockLog = mocks.mockLog();
        mockLog.info = sinon.spy();
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
          Promise.reject(new error.unknownAccount(mockGoogleUser.email))
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

      it('should create new fxa account from new google account and return session', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(new error.unknownAccount(mockGoogleUser.email))
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
      });

      it('should linking existing fxa account and new google account and return session', async () => {
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
        mockLog.info = sinon.spy();
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
          Promise.reject(new error.unknownAccount(mockAppleUser.email))
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

      it('should create new fxa account from new apple account and return session', async () => {
        mockDB.accountRecord = sinon.spy(() =>
          Promise.reject(new error.unknownAccount(mockAppleUser.email))
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
      mockLog.info = sinon.spy();
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
  });
});
