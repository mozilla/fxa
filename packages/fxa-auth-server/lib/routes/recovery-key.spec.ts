/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { AppError as errors } from '@fxa/accounts/errors';

const uuid = require('uuid');
const mocks = require('../../test/mocks');
const getRoute = require('../../test/routes_helpers').getRoute;
const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');

let log: any,
  db: any,
  customs: any,
  mailer: any,
  fxaMailer: any,
  glean: any,
  routes: any,
  route: any,
  request: any,
  response: any;
const email = 'test@email.com';
const recoveryKeyId = '000000';
const recoveryData = '11111111111';
const hint = 'super secret location';
const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');

let mockAuthorizedClientsList: any = sinon.stub().resolves([]);

jest.mock('../oauth/authorized_clients', () => ({
  list: (...args: any[]) => mockAuthorizedClientsList(...args),
}));

let mockAccountEventsManager: any;

function setup(results: any, _errors: any, path: string, requestOptions: any) {
  results = results || {};
  _errors = _errors || {};

  log = mocks.mockLog();
  db = mocks.mockDB(results.db, _errors.db);
  customs = mocks.mockCustoms(_errors.customs);
  mailer = mocks.mockMailer();
  glean = mocks.mockGlean();
  mockAuthorizedClientsList = results.mockAuthorizedClients
    ? results.mockAuthorizedClients.list
    : sinon.stub().resolves([]);
  routes = makeRoutes({
    log,
    db,
    customs,
    mailer,
    glean,
  });
  route = getRoute(routes, path, requestOptions.method);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));
  return route.handler(request);
}

function makeRoutes(options: any = {}) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || mocks.mockCustoms();
  const config = options.config || { signinConfirmation: {} };
  const Password = require('../crypto/password')(log, config);
  const mailer = options.mailer || mocks.mockMailer();
  return require('./recovery-key')(
    log,
    db,
    Password,
    config.verifierVersion,
    customs,
    mailer,
    glean
  );
}

describe('POST /recoveryKey', () => {
  beforeEach(() => {
    mockAccountEventsManager = mocks.mockAccountEventsManager();
    fxaMailer = mocks.mockFxaMailer();
  });

  afterEach(() => {
    mocks.unMockAccountEventsManager();
  });

  describe('should create an account recovery key', () => {
    let requestOptions: any;

    beforeEach(async () => {
      requestOptions = {
        credentials: { uid, email },
        log,
        payload: {
          recoveryKeyId,
          recoveryData,
          enabled: true,
        },
      };
      response = await setup(
        { db: { email } },
        {},
        '/recoveryKey',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response).toEqual({});
    });

    it('recorded security event', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_added',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('called log.begin correctly', () => {
      expect(log.begin.callCount).toBe(1);
      const args = log.begin.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('createRecoveryKey');
      expect(args[1]).toBe(request);
    });

    it('called db.createRecoveryKey correctly', () => {
      expect(db.createRecoveryKey.callCount).toBe(1);
      const args = db.createRecoveryKey.args[0];
      expect(args).toHaveLength(4);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(recoveryKeyId);
      expect(args[2]).toBe(recoveryData);
      expect(args[3]).toBe(true);
    });

    it('did not call db.deleteRecoveryKey', () => {
      expect(db.deleteRecoveryKey.callCount).toBe(0);
    });

    it('called log.info correctly', () => {
      expect(log.info.callCount).toBe(1);
      const args = log.info.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('account.recoveryKey.created');
    });

    it('called request.emitMetricsEvent correctly', () => {
      expect(request.emitMetricsEvent.callCount).toBe(1);
      const args = request.emitMetricsEvent.args[0];
      expect(args[0]).toBe('recoveryKey.created');
      expect(args[1]['uid']).toBe(uid);
    });

    it('called mailer.sendPostAddAccountRecoveryEmail correctly', () => {
      expect(fxaMailer.sendPostAddAccountRecoveryEmail.callCount).toBe(1);
      const args = fxaMailer.sendPostAddAccountRecoveryEmail.args[0];
      expect(args).toHaveLength(1);
      expect(args[0].to).toBe(email);
    });
  });

  describe('should change account recovery key when an enabled key exists and replaceKey is true', () => {
    let requestOptions: any;

    beforeEach(async () => {
      requestOptions = {
        credentials: { uid, email },
        log,
        payload: {
          recoveryKeyId,
          recoveryData,
          enabled: true,
          replaceKey: true,
        },
      };
      response = await setup(
        {
          db: {
            recoveryData,
            email,
            uid,
          },
        },
        {},
        '/recoveryKey',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response).toEqual({});
    });

    it('recorded security event for the key deletion', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_removed',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('recorded security event for the key creation', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_added',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('called log.begin correctly', () => {
      expect(log.begin.callCount).toBe(1);
      const args = log.begin.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('createRecoveryKey');
      expect(args[1]).toBe(request);
    });

    it('called db.createRecoveryKey correctly', () => {
      expect(db.createRecoveryKey.callCount).toBe(1);
      const args = db.createRecoveryKey.args[0];
      expect(args).toHaveLength(4);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(recoveryKeyId);
      expect(args[2]).toBe(recoveryData);
      expect(args[3]).toBe(true);
    });

    it('called db.deleteRecoveryKey correctly', () => {
      expect(db.deleteRecoveryKey.callCount).toBe(1);
      const args = db.deleteRecoveryKey.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe(uid);
    });

    it('called log.info correctly', () => {
      expect(log.info.callCount).toBe(1);
      const args = log.info.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('account.recoveryKey.changed');
    });

    it('called request.emitMetricsEvent correctly', () => {
      expect(request.emitMetricsEvent.callCount).toBe(1);
      const args = request.emitMetricsEvent.args[0];
      expect(args[0]).toBe('recoveryKey.changed');
      expect(args[1]['uid']).toBe(uid);
    });

    it('called mailer.sendPostChangeAccountRecoveryEmail correctly', () => {
      expect(fxaMailer.sendPostChangeAccountRecoveryEmail.callCount).toBe(1);
      const args = fxaMailer.sendPostChangeAccountRecoveryEmail.args[0];
      expect(args).toHaveLength(1);
      expect(args[0].to).toBe(email);
    });
  });

  describe('should not change account recovery key when a key exists and replaceKey is false', () => {
    let requestOptions: any;
    let error: any;

    beforeEach(async () => {
      requestOptions = {
        credentials: { uid, email },
        log,
        payload: {
          recoveryKeyId,
          recoveryData,
          enabled: true,
          replaceKey: false,
        },
      };

      try {
        response = await setup(
          { db: { recoveryData, email } },
          {},
          '/recoveryKey',
          requestOptions
        );
      } catch (e) {
        error = e;
      }
    });

    it('returned the correct response', () => {
      expect(error).toBeDefined();
      expect(error.errno).toBe(errors.ERRNO.RECOVERY_KEY_EXISTS);
    });

    it('recorded a security event', () => {
      expect(mockAccountEventsManager.recordSecurityEvent.callCount).toBe(0);
    });

    it('called log.begin correctly', () => {
      expect(log.begin.callCount).toBe(1);
      const args = log.begin.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('createRecoveryKey');
      expect(args[1]).toBe(request);
    });

    it('db.createRecoveryKey is not called', () => {
      expect(db.createRecoveryKey.callCount).toBe(0);
    });

    it('did not call db.deleteRecoveryKey', () => {
      expect(db.deleteRecoveryKey.callCount).toBe(0);
    });

    it('did not call log.info', () => {
      expect(log.info.callCount).toBe(0);
    });

    it('did not call request.emitMetricsEvent', () => {
      expect(request.emitMetricsEvent.callCount).toBe(0);
    });

    it('did not call fxaMailer.sendPostAddAccountRecoveryEmail', () => {
      expect(fxaMailer.sendPostAddAccountRecoveryEmail.callCount).toBe(0);
    });
  });

  describe('should create disabled account recovery key', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid, email },
        log,
        payload: { recoveryKeyId, recoveryData, enabled: false },
      };
      response = await setup(
        { db: { email } },
        {},
        '/recoveryKey',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response).toEqual({});
    });

    it('called db.createRecoveryKey correctly', () => {
      expect(db.createRecoveryKey.callCount).toBe(1);
      const args = db.createRecoveryKey.args[0];
      expect(args).toHaveLength(4);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(recoveryKeyId);
      expect(args[2]).toBe(recoveryData);
      expect(args[3]).toBe(false);
    });
  });

  describe('should verify account recovery key', () => {
    beforeEach(async () => {
      mockAccountEventsManager = mocks.mockAccountEventsManager();
      const requestOptions = {
        credentials: { uid, email, tokenVerified: true },
        log,
        payload: { recoveryKeyId, enabled: false },
      };
      response = await setup(
        { db: { email } },
        {},
        '/recoveryKey/verify',
        requestOptions
      );
    });
    afterAll(() => {
      mocks.unMockAccountEventsManager();
    });

    it('returned the correct response', () => {
      expect(response).toEqual({});
    });

    it('called customs.checkAuthenticated correctly', () => {
      expect(customs.checkAuthenticated.callCount).toBe(1);
      const args = customs.checkAuthenticated.args[0];
      expect(args).toHaveLength(4);
      expect(args[0]).toEqual(request);
      expect(args[1]).toBe(uid);
      expect(args[2]).toBe(email);
      expect(args[3]).toBe('getRecoveryKey');
    });

    it('called db.updateRecoveryKey correctly', () => {
      expect(db.updateRecoveryKey.callCount).toBe(1);
      const args = db.updateRecoveryKey.args[0];
      expect(args).toHaveLength(3);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(recoveryKeyId);
      expect(args[2]).toBe(true);
    });

    it('called request.emitMetricsEvent correctly', () => {
      expect(request.emitMetricsEvent.callCount).toBe(1);
      const args = request.emitMetricsEvent.args[0];
      expect(args[0]).toBe('recoveryKey.created');
      expect(args[1]['uid']).toBe(uid);
    });

    it('called mailer.sendPostAddAccountRecoveryEmail correctly', () => {
      expect(fxaMailer.sendPostAddAccountRecoveryEmail.callCount).toBe(1);
      const args = fxaMailer.sendPostAddAccountRecoveryEmail.args[0];
      expect(args).toHaveLength(1);
      expect(args[0].to).toBe(email);
    });

    it('records security event', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_challenge_success',
          ipAddr: '63.245.221.32',
          uid: uid,
          tokenId: undefined,
        })
      );
    });
  });
});

describe('GET /recoveryKey/{recoveryKeyId}', () => {
  describe('should get account recovery key', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid, email },
        params: { recoveryKeyId },
        log,
      };
      response = await setup(
        { db: { recoveryData, recoveryKeyId } },
        {},
        '/recoveryKey/{recoveryKeyId}',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response.recoveryData).toEqual(recoveryData);
    });

    it('called log.begin correctly', () => {
      expect(log.begin.callCount).toBe(1);
      const args = log.begin.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('getRecoveryKey');
      expect(args[1]).toBe(request);
    });

    it('called customs.checkAuthenticated correctly', () => {
      expect(customs.checkAuthenticated.callCount).toBe(1);
      const args = customs.checkAuthenticated.args[0];
      expect(args).toHaveLength(4);
      expect(args[0]).toEqual(request);
      expect(args[1]).toBe(uid);
      expect(args[2]).toBe(email);
      expect(args[3]).toBe('getRecoveryKey');
    });

    it('called db.getRecoveryKey correctly', () => {
      expect(db.getRecoveryKey.callCount).toBe(1);
      const args = db.getRecoveryKey.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(recoveryKeyId);
    });

    it('logged a Glean event', () => {
      sinon.assert.calledOnceWithExactly(
        glean.resetPassword.recoveryKeySuccess,
        request,
        { uid }
      );
    });
  });

  describe('fails to return recovery data with recoveryKeyId mismatch', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid, email },
        params: { recoveryKeyId },
        log,
      };
      try {
        await setup(
          { db: { recoveryData, recoveryKeyIdInvalid: true } },
          {},
          '/recoveryKey/{recoveryKeyId}',
          requestOptions
        );
      } catch (err) {
        response = err;
      }
    });

    it('returned the correct response', () => {
      expect(response.errno).toBe(errors.ERRNO.RECOVERY_KEY_INVALID);
    });
  });
});

describe('POST /recoveryKey/exists', () => {
  describe('should check if account recovery key exists using sessionToken', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid, email },
        log,
      };
      response = await setup(
        { db: { recoveryData, hint: 'so wow much encryption' } },
        {},
        '/recoveryKey/exists',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response.exists).toBe(true);
      expect(response.hint).toBe('so wow much encryption');
      expect(response.estimatedSyncDeviceCount).toBe(0);
    });

    it('called log.begin correctly', () => {
      expect(log.begin.callCount).toBe(1);
      const args = log.begin.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('recoveryKeyExists');
      expect(args[1]).toBe(request);
    });

    it('called db.getRecoveryKeyRecordWithHint correctly', () => {
      expect(db.getRecoveryKeyRecordWithHint.callCount).toBe(1);
      const args = db.getRecoveryKeyRecordWithHint.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe(uid);
    });
  });

  describe('should return estimatedSyncDeviceCount=0 with no sync devices', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid },
        log,
      };
      response = await setup(
        {
          db: {
            recoveryData,
            devices: [],
          },
        },
        {},
        '/recoveryKey/exists',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response.exists).toBe(true);
      expect(response.estimatedSyncDeviceCount).toBe(0);
    });
  });

  describe('should return estimatedSyncDeviceCount=1 with sync devices', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid },
        log,
      };
      response = await setup(
        {
          db: {
            recoveryData,
            devices: [
              {
                type: 'desktop',
                id: 'desktop1',
                lastAccess: new Date(),
                lastAccessVersion: '1.0',
              },
            ],
          },
        },
        {},
        '/recoveryKey/exists',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response.exists).toBe(true);
      expect(response.estimatedSyncDeviceCount).toBe(1);
    });
  });

  describe('should return estimatedSyncDeviceCount=1 with sync oauth clients', () => {
    beforeEach(async () => {
      const requestOptions = {
        credentials: { uid },
        log,
      };
      response = await setup(
        {
          mockAuthorizedClients: {
            list: sinon.stub().resolves([
              {
                client_id: 'desktop1',
                client_name: 'Desktop',
                created_time: new Date(),
                last_access_time: new Date(),
                scope: ['profile', OAUTH_SCOPE_OLD_SYNC],
              },
            ]),
          },
          db: {
            recoveryData,
            devices: [],
          },
        },
        {},
        '/recoveryKey/exists',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response.exists).toBe(true);
      expect(response.estimatedSyncDeviceCount).toBe(1);
    });
  });
});

describe('DELETE /recoveryKey', () => {
  beforeEach(() => {
    mockAccountEventsManager = mocks.mockAccountEventsManager();
    fxaMailer = mocks.mockFxaMailer();
  });

  afterEach(() => {
    mocks.unMockAccountEventsManager();
  });

  describe('should delete account recovery key', () => {
    beforeEach(async () => {
      const requestOptions = {
        method: 'DELETE',
        credentials: { uid, email },
        log,
      };
      response = await setup(
        { db: { recoveryData, email } },
        {},
        '/recoveryKey',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response).toBeTruthy();
    });

    it('called log.begin correctly', () => {
      expect(log.begin.callCount).toBe(1);
      const args = log.begin.args[0];
      expect(args).toHaveLength(2);
      expect(args[0]).toBe('recoveryKeyDelete');
      expect(args[1]).toBe(request);
    });

    it('called db.deleteRecoveryKey correctly', () => {
      expect(db.deleteRecoveryKey.callCount).toBe(1);
      const args = db.deleteRecoveryKey.args[0];
      expect(args).toHaveLength(1);
      expect(args[0]).toBe(uid);
    });

    it('called mailer.sendPostRemoveAccountRecoveryEmail correctly', () => {
      expect(fxaMailer.sendPostRemoveAccountRecoveryEmail.callCount).toBe(1);
      const args = fxaMailer.sendPostRemoveAccountRecoveryEmail.args[0];
      expect(args).toHaveLength(1);
      expect(args[0].to).toBe(email);
    });

    it('recorded security event', () => {
      sinon.assert.calledWith(
        mockAccountEventsManager.recordSecurityEvent,
        sinon.match.defined,
        sinon.match({
          name: 'account.recovery_key_removed',
          ipAddr: '63.245.221.32',
          uid: uid,
          tokenId: undefined,
        })
      );
    });
  });
});

describe('POST /recoveryKey/hint', () => {
  describe('should fail for unknown recovery key', () => {
    beforeEach(async () => {
      const requestOptions = {
        method: 'POST',
        credentials: { uid, email, tokenVerified: true },
        payload: { hint },
        log,
      };
      try {
        await setup({ db: {} }, {}, '/recoveryKey/hint', requestOptions);
      } catch (err) {
        response = err;
      }
    });

    it('returned the correct response', () => {
      expect(response.errno).toBe(errors.ERRNO.RECOVERY_KEY_NOT_FOUND);
    });
  });

  describe('should update the recovery key hint', () => {
    beforeEach(async () => {
      const requestOptions = {
        method: 'POST',
        credentials: { uid, email, tokenVerified: true },
        payload: { hint },
        log,
      };
      response = await setup(
        { db: { recoveryData } },
        {},
        '/recoveryKey/hint',
        requestOptions
      );
    });

    it('returned the correct response', () => {
      expect(response).toEqual({});
      sinon.assert.calledOnceWithExactly(db.updateRecoveryKeyHint, uid, hint);
    });
  });
});
