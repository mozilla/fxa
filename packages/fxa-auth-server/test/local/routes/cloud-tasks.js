/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

import { assert } from 'chai';
import sinon from 'sinon';
import mocks from '../../mocks';
import { getRoute } from '../../routes_helpers';
import { cloudTaskRoutes } from '../../../lib/routes/cloud-tasks';
import { AccountDeleteManager } from '../../../lib/account-delete';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
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
