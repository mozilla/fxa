/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const sinon = require('sinon');

const routeModule = require('../../../server/lib/routes/post-nimbus-experiments');
const mockStatsD = {
  increment: sinon.spy(),
  timing: sinon.spy(),
};

let fetchStub;
let route = {};

registerSuite('routes/post-nimbus-experiments', {
  before: function () {},

  afterEach: () => {
    fetchStub?.restore();
    mockStatsD.increment.resetHistory();
    mockStatsD.timing.resetHistory();
  },

  'route function is correct': function () {
    route = routeModule(
      {
        get: function (key) {
          if (key === 'nimbus') {
            return {
              timeout: 1000,
              host: 'http://localhost:8001',
            };
          }
        },
      },
      mockStatsD
    );
    fetchStub = sinon.stub(global, 'fetch');
    assert.isObject(route);
    assert.equal(route.method, 'post');
    assert.equal(route.path, '/nimbus-experiments');
    assert.isFunction(route.process);
    assert.lengthOf(route.process, 2);
  },

  'handle nimbus host timeout': async function () {
    route = routeModule(
      {
        get: function (key) {
          if (key === 'nimbus') {
            return {
              // set really small timeout, to emulate aborted request
              timeout: 1,
              host: 'http://localhost:8001',
            };
          }
        },
      },
      mockStatsD
    );
    fetchStub.resolves({
      status: '200',
    });

    const mockEnd = sinon.spy();
    const mockStatus = sinon.spy();

    await route.process(
      {
        body: {
          client_id: '123',
          context: {},
        },
      },
      {
        end: mockEnd,
        status: mockStatus,
      }
    );

    assert.equal(mockEnd.callCount, 1);
    assert.equal(mockStatus.callCount, 1);
    assert.equal(mockStatus.args[0], '503');

    assert.equal(mockStatsD.increment.callCount, 1);
    assert.equal(mockStatsD.increment.args[0], 'cirrus.experiment-fetch-error');

    assert.equal(mockStatsD.timing.callCount, 1);
  },
});
