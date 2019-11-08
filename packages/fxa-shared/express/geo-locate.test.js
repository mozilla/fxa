/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const geoLocateBuilder = require('./geo-locate');
const sinon = require('sinon');
const results = {
  geodb: 'mock geodb result',
  remoteAddress: { clientAddress: 'mock remoteAddress result' },
};
const logger = {
  error: sinon.spy(),
};
const remoteAddress = sinon.spy(() => results.remoteAddress);

let geodb, geolocate, config;

describe('geo-locate, geodb succeeds', () => {
  beforeEach(() => {
    geodb = sinon.spy(() => results.geodb);
    geolocate = geoLocateBuilder(geodb)(remoteAddress)(logger);
  });

  afterEach(() => {
    logger.error.resetHistory();
    remoteAddress.resetHistory();
  });

  it('has a correct interface', () => {
    assert.isFunction(geolocate);
    assert.lengthOf(geolocate, 1);
  });

  it('behaves correctly if geodb succeeds', () => {
    const result = geolocate('blee');

    assert.equal(result, 'mock geodb result');

    assert.equal(remoteAddress.callCount, 1);
    let args = remoteAddress.args[0];
    assert.equal(args.length, 1);
    assert.equal(args[0], 'blee');

    assert.equal(geodb.callCount, 1);
    args = geodb.args[0];
    assert.equal(args.length, 1);
    assert.equal(args[0], 'mock remoteAddress result');

    assert.equal(logger.error.callCount, 0);
  });

  it('behaves correctly if config is disabled', () => {
    config.enabled = false;

    const result = geolocate('blee');

    assert.deepEqual(result, {});

    assert.equal(remoteAddress.callCount, 0);
    assert.equal(geodb.callCount, 0);
    assert.equal(logger.error.callCount, 0);
  });
});

describe('geo-locate, geodb fails', () => {
  beforeEach(() => {
    geodb = sinon.spy(() => {
      throw 'ohno';
    });
    geolocate = geoLocateBuilder(geodb, remoteAddress, logger);
  });

  it('behaves correctly if geodb fails', () => {
    const result = geolocate('fuffle');

    assert.deepEqual(result, {});

    assert.equal(remoteAddress.callCount, 1);
    assert.equal(geodb.callCount, 1);

    assert.equal(logger.error.callCount, 1);
    const args = logger.error.args[0];
    assert.equal(args.length, 2);
    assert.equal(args[0], 'geodb.error');
    assert.equal(args[1], 'ohno');
  });
});
