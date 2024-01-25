/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Container } = require('typedi');
const { assert } = require('chai');
const sinon = require('sinon');
const mocks = require('../../mocks');
const getRoute = require('../../routes_helpers').getRoute;
const { cloudTaskRoutes } = require('../../../lib/routes/cloud-tasks');
const { AccountDeleteManager } = require('../../../lib/account-delete');
const error = require('../../../lib/error');

const mockConfig = {
  cloudTasks: {
    deleteAccounts: { queueName: 'del-accts' },
  },
};

const sandbox = sinon.createSandbox();

describe('/cloud-tasks/accounts/delete', () => {
  const uid = '0f0f0f9001';
  let mockLog;
  let mockDb;
  let mockPush;
  let route, routes;
  let deleteAccountStub;
  let cleanupAccountStub;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    mockDb = mocks.mockDB();
    mockPush = mocks.mockPush();
    sandbox.reset();

    deleteAccountStub = sandbox.stub().callsFake((uid, { notify }) => {
      notify();
    });
    cleanupAccountStub = sandbox.stub().resolves();
    Container.set(AccountDeleteManager, {
      deleteAccount: deleteAccountStub,
      cleanupAccount: cleanupAccountStub,
    });

    routes = cloudTaskRoutes(mockLog, mockDb, mockConfig, mockPush);
    route = getRoute(routes, '/cloud-tasks/accounts/delete');
  });

  it('should delete the account', async () => {
    try {
      const devices = [{ x: 'yz' }];
      const account = { uid };
      mockDb.account = sandbox.stub().resolves(account);
      mockDb.devices = sandbox.stub().resolves(devices);

      const req = {
        payload: { uid },
      };

      await route.handler(req);

      sinon.assert.calledOnceWithExactly(mockDb.account, uid);
      sinon.assert.calledOnceWithExactly(mockDb.devices, uid);
      sinon.assert.calledOnce(deleteAccountStub);
      sinon.assert.notCalled(cleanupAccountStub);
      assert.equal(deleteAccountStub.args[0][0], uid);
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'accountDeleted.byCloudTask',
        account
      );
      sinon.assert.calledOnceWithExactly(
        mockPush.notifyAccountDestroyed,
        uid,
        devices
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.notifyAttachedServices,
        'delete',
        {},
        { uid }
      );
      sinon.assert.calledOnceWithExactly(mockLog.activityEvent, {
        uid,
        event: 'account.deleted',
      });
    } catch (err) {
      assert.fail('An error should not have been thrown.');
    }
  });

  it('should clean up the account data', async () => {
    try {
      mockDb.account = sandbox.stub().rejects(error.unknownAccount());
      const req = {
        payload: { uid },
      };

      await route.handler(req);
      sinon.assert.calledOnceWithExactly(mockDb.account, uid);
      sinon.assert.calledOnce(cleanupAccountStub);
      sinon.assert.notCalled(deleteAccountStub);
    } catch (err) {
      assert.fail('An error should not have been thrown.');
    }
  });
});
