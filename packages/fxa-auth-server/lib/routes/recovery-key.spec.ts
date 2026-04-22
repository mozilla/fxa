/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

let mockAuthorizedClientsList: any = jest.fn().mockResolvedValue([]);

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
    : jest.fn().mockResolvedValue([]);
  routes = makeRoutes({
    log,
    db,
    customs,
    mailer,
    glean,
  });
  route = getRoute(routes, path, requestOptions.method);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = jest.fn(() => Promise.resolve({}));
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
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'account.recovery_key_added',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('called log.begin correctly', () => {
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(
        1,
        'createRecoveryKey',
        request
      );
    });

    it('called db.createRecoveryKey correctly', () => {
      expect(db.createRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.createRecoveryKey).toHaveBeenNthCalledWith(
        1,
        uid,
        recoveryKeyId,
        recoveryData,
        true
      );
    });

    it('did not call db.deleteRecoveryKey', () => {
      expect(db.deleteRecoveryKey).toHaveBeenCalledTimes(0);
    });

    it('called log.info correctly', () => {
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenNthCalledWith(
        1,
        'account.recoveryKey.created',
        expect.anything()
      );
    });

    it('called request.emitMetricsEvent correctly', () => {
      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
      expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
        1,
        'recoveryKey.created',
        expect.objectContaining({ uid })
      );
    });

    it('called mailer.sendPostAddAccountRecoveryEmail correctly', () => {
      expect(fxaMailer.sendPostAddAccountRecoveryEmail).toHaveBeenCalledTimes(
        1
      );
      expect(fxaMailer.sendPostAddAccountRecoveryEmail).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ to: email })
      );
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
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'account.recovery_key_removed',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('recorded security event for the key creation', () => {
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'account.recovery_key_added',
          ipAddr: '63.245.221.32',
          uid: requestOptions.credentials.uid,
          tokenId: requestOptions.credentials.id,
        })
      );
    });

    it('called log.begin correctly', () => {
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(
        1,
        'createRecoveryKey',
        request
      );
    });

    it('called db.createRecoveryKey correctly', () => {
      expect(db.createRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.createRecoveryKey).toHaveBeenNthCalledWith(
        1,
        uid,
        recoveryKeyId,
        recoveryData,
        true
      );
    });

    it('called db.deleteRecoveryKey correctly', () => {
      expect(db.deleteRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.deleteRecoveryKey).toHaveBeenNthCalledWith(1, uid);
    });

    it('called log.info correctly', () => {
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenNthCalledWith(
        1,
        'account.recoveryKey.changed',
        expect.anything()
      );
    });

    it('called request.emitMetricsEvent correctly', () => {
      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
      expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
        1,
        'recoveryKey.changed',
        expect.objectContaining({ uid })
      );
    });

    it('called mailer.sendPostChangeAccountRecoveryEmail correctly', () => {
      expect(
        fxaMailer.sendPostChangeAccountRecoveryEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        fxaMailer.sendPostChangeAccountRecoveryEmail
      ).toHaveBeenNthCalledWith(1, expect.objectContaining({ to: email }));
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
      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(0);
    });

    it('called log.begin correctly', () => {
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(
        1,
        'createRecoveryKey',
        request
      );
    });

    it('db.createRecoveryKey is not called', () => {
      expect(db.createRecoveryKey).toHaveBeenCalledTimes(0);
    });

    it('did not call db.deleteRecoveryKey', () => {
      expect(db.deleteRecoveryKey).toHaveBeenCalledTimes(0);
    });

    it('did not call log.info', () => {
      expect(log.info).toHaveBeenCalledTimes(0);
    });

    it('did not call request.emitMetricsEvent', () => {
      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(0);
    });

    it('did not call fxaMailer.sendPostAddAccountRecoveryEmail', () => {
      expect(fxaMailer.sendPostAddAccountRecoveryEmail).toHaveBeenCalledTimes(
        0
      );
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
      expect(db.createRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.createRecoveryKey).toHaveBeenNthCalledWith(
        1,
        uid,
        recoveryKeyId,
        recoveryData,
        false
      );
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
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenNthCalledWith(
        1,
        request,
        uid,
        email,
        'getRecoveryKey'
      );
    });

    it('called db.updateRecoveryKey correctly', () => {
      expect(db.updateRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.updateRecoveryKey).toHaveBeenNthCalledWith(
        1,
        uid,
        recoveryKeyId,
        true
      );
    });

    it('called request.emitMetricsEvent correctly', () => {
      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
      expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
        1,
        'recoveryKey.created',
        expect.objectContaining({ uid })
      );
    });

    it('called mailer.sendPostAddAccountRecoveryEmail correctly', () => {
      expect(fxaMailer.sendPostAddAccountRecoveryEmail).toHaveBeenCalledTimes(
        1
      );
      expect(fxaMailer.sendPostAddAccountRecoveryEmail).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ to: email })
      );
    });

    it('records security event', () => {
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
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
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(1, 'getRecoveryKey', request);
    });

    it('called customs.checkAuthenticated correctly', () => {
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenNthCalledWith(
        1,
        request,
        uid,
        email,
        'getRecoveryKey'
      );
    });

    it('called db.getRecoveryKey correctly', () => {
      expect(db.getRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.getRecoveryKey).toHaveBeenNthCalledWith(1, uid, recoveryKeyId);
    });

    it('logged a Glean event', () => {
      expect(glean.resetPassword.recoveryKeySuccess).toHaveBeenCalledTimes(1);
      expect(glean.resetPassword.recoveryKeySuccess).toHaveBeenCalledWith(
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
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(
        1,
        'recoveryKeyExists',
        request
      );
    });

    it('called db.getRecoveryKeyRecordWithHint correctly', () => {
      expect(db.getRecoveryKeyRecordWithHint).toHaveBeenCalledTimes(1);
      expect(db.getRecoveryKeyRecordWithHint).toHaveBeenNthCalledWith(1, uid);
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
            list: jest.fn().mockResolvedValue([
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
      expect(log.begin).toHaveBeenCalledTimes(1);
      expect(log.begin).toHaveBeenNthCalledWith(
        1,
        'recoveryKeyDelete',
        request
      );
    });

    it('called db.deleteRecoveryKey correctly', () => {
      expect(db.deleteRecoveryKey).toHaveBeenCalledTimes(1);
      expect(db.deleteRecoveryKey).toHaveBeenNthCalledWith(1, uid);
    });

    it('called mailer.sendPostRemoveAccountRecoveryEmail correctly', () => {
      expect(
        fxaMailer.sendPostRemoveAccountRecoveryEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        fxaMailer.sendPostRemoveAccountRecoveryEmail
      ).toHaveBeenNthCalledWith(1, expect.objectContaining({ to: email }));
    });

    it('recorded security event', () => {
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
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
      expect(db.updateRecoveryKeyHint).toHaveBeenCalledTimes(1);
      expect(db.updateRecoveryKeyHint).toHaveBeenCalledWith(uid, hint);
    });
  });
});
