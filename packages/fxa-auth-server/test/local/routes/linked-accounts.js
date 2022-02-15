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

const makeRoutes = function (options = {}, requireMocks) {
  const config = options.config || {};
  config.signinConfirmation = config.signinConfirmation || {};
  config.signinConfirmation.tokenVerificationCode =
    config.signinConfirmation.tokenVerificationCode || {};

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || mocks.mockMailer();

  const { linkedAccountRoutes } = proxyquire(
    '../../../lib/routes/linked-accounts',
    requireMocks || {}
  );

  return linkedAccountRoutes(log, db, config, mailer);
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
            idToken: JSON.stringify({
              credentials: 'id_token_returned_from_google_oauth_flow',
            }),
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

        assert.isTrue(mockDB.getGoogleId.calledOnceWith(mockGoogleUser.sub));
        assert.isTrue(mockDB.createAccount.calledOnce);
        assert.isTrue(
          mockDB.createLinkedGoogleAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub
          )
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

        assert.isTrue(axiosMock.post.notCalled);
        assert.isTrue(mockDB.getGoogleId.calledOnceWith(mockGoogleUser.sub));
        assert.isTrue(mockDB.createAccount.calledOnce);
        assert.isTrue(
          mockDB.createLinkedGoogleAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub
          )
        );
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
      });

      it('should linking existing fxa account and new google account and return session', async () => {
        const result = await runTest(route, mockRequest);

        assert.isTrue(axiosMock.post.notCalled);
        assert.isTrue(mockDB.getGoogleId.calledOnceWith(mockGoogleUser.sub));
        assert.isTrue(mockDB.createAccount.notCalled);
        assert.isTrue(
          mockDB.createLinkedGoogleAccount.calledOnceWith(
            UID,
            mockGoogleUser.sub
          )
        );
        assert.equal(mockMailer.sendPostAddLinkedAccountEmail.callCount, 1);
        assert.isTrue(mockDB.createSessionToken.calledOnce);
        assert.equal(result.uid, UID);
        assert.ok(result.sessionToken);
      });

      it('should return session with valid google id token', async () => {
        mockDB.getGoogleId = sinon.spy(() =>
          Promise.resolve({
            id: mockGoogleUser.sub,
            uid: UID,
          })
        );

        const result = await runTest(route, mockRequest);

        assert.isTrue(axiosMock.post.notCalled);
        assert.isTrue(mockDB.getGoogleId.calledOnceWith(mockGoogleUser.sub));
        assert.isTrue(mockDB.account.calledOnceWith(UID));
        assert.isTrue(mockDB.createLinkedGoogleAccount.notCalled);
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

    it('calls deleteLinkedGoogleAccount', async () => {
      const result = await runTest(route, mockRequest);
      assert.isTrue(mockDB.deleteLinkedGoogleAccount.calledOnceWith(UID));
      assert.isTrue(result.success);
    });
  });
});
