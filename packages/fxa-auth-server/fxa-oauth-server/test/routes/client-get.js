/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const mocks = require('../lib/mocks');
const realConfig = require('../../lib/config');

const routeModulePath = '../../lib/routes/client/get';
var dependencies = mocks.require([
  { path: '../../config' },
], routeModulePath, __dirname);

const CLIENT_ID = '98e6508e88680e1b';

describe('/client/:id', function () {

  describe('config handling', () => {
    let sandbox, route, request;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      request = {
        params: {
          client_id: CLIENT_ID
        },
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('clients that have not been disabled via config are not reported as disabled', async () => {
      route = proxyquire(routeModulePath, dependencies);
      const client = await route.handler(request);
      assert.equal(client.id, CLIENT_ID);
      assert.ok(! client.disabled);
    });

    it('clients that have been disabled via config are reported as disabled', async () => {
      sandbox.stub(dependencies['../../config'], 'get').callsFake((key) => {
        if (key === 'disabledClients') {
          return [CLIENT_ID];
        }
        return realConfig.get(key);
      });
      route = proxyquire(routeModulePath, dependencies);
      const client = await route.handler(request);
      assert.equal(client.id, CLIENT_ID);
      assert.ok(client.disabled);
    });
  });
});
