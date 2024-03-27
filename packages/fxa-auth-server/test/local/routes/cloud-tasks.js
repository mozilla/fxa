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
const { ReasonForDeletion } = require('@fxa/shared/cloud-tasks');
const mockConfig = {
  cloudTasks: {
    deleteAccounts: { queueName: 'del-accts' },
  },
};

const sandbox = sinon.createSandbox();

describe('/cloud-tasks/accounts/delete', () => {
  const uid = '0f0f0f9001';
  let mockLog;
  let route, routes;
  let deleteAccountStub;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    sandbox.reset();

    deleteAccountStub = sandbox
      .stub()
      .callsFake((uid, reason, customerId) => {});
    Container.set(AccountDeleteManager, {
      deleteAccount: deleteAccountStub,
    });

    routes = cloudTaskRoutes(mockLog, mockConfig);
    route = getRoute(routes, '/cloud-tasks/accounts/delete');
  });

  it('should delete the account', async () => {
    try {
      const req = {
        payload: { uid, reason: ReasonForDeletion.Unverified },
      };

      await route.handler(req);

      sinon.assert.calledOnce(deleteAccountStub);
      assert.equal(deleteAccountStub.args[0][0], uid);
    } catch (err) {
      console.log(err);
      assert.fail('An error should not have been thrown.');
    }
  });
});
