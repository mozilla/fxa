/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

let hashResult = Array(40).fill('0');
const hash = {
  update: sinon.spy(),
  digest: sinon.spy(() => hashResult),
};
const crypto = {
  createHash: sinon.spy(() => hash),
};

const config = {
  lastAccessTimeUpdates: {},
  signinConfirmation: {},
  signinUnblock: {},
  securityHistory: {},
};

const MODULE_PATH = '../../lib/features';

const features = proxyquire(MODULE_PATH, {
  crypto: crypto,
})(config);

describe('features', () => {
  it('interface is correct', () => {
    assert.equal(
      typeof require(MODULE_PATH).schema,
      'object',
      'features.schema is object'
    );
    assert.notEqual(
      require(MODULE_PATH).schema,
      null,
      'features.schema is not null'
    );

    assert.equal(typeof features, 'object', 'object type should be exported');
    assert.equal(
      Object.keys(features).length,
      2,
      'object should have correct number of properties'
    );
    assert.equal(
      typeof features.isSampledUser,
      'function',
      'isSampledUser should be function'
    );
    assert.equal(
      typeof features.isLastAccessTimeEnabledForUser,
      'function',
      'isLastAccessTimeEnabledForUser should be function'
    );

    assert.equal(
      crypto.createHash.callCount,
      1,
      'crypto.createHash should have been called once on require'
    );
    let args = crypto.createHash.args[0];
    assert.equal(
      args.length,
      1,
      'crypto.createHash should have been passed one argument'
    );
    assert.equal(
      args[0],
      'sha1',
      'crypto.createHash algorithm should have been sha1'
    );

    assert.equal(
      hash.update.callCount,
      2,
      'hash.update should have been called twice on require'
    );
    args = hash.update.args[0];
    assert.equal(
      args.length,
      1,
      'hash.update should have been passed one argument first time'
    );
    assert.equal(
      typeof args[0],
      'string',
      'hash.update data should have been a string first time'
    );
    args = hash.update.args[1];
    assert.equal(
      args.length,
      1,
      'hash.update should have been passed one argument second time'
    );
    assert.equal(
      typeof args[0],
      'string',
      'hash.update data should have been a string second time'
    );

    assert.equal(
      hash.digest.callCount,
      1,
      'hash.digest should have been called once on require'
    );
    args = hash.digest.args[0];
    assert.equal(
      args.length,
      1,
      'hash.digest should have been passed one argument'
    );
    assert.equal(args[0], 'hex', 'hash.digest ecnoding should have been hex');

    crypto.createHash.resetHistory();
    hash.update.resetHistory();
    hash.digest.resetHistory();
  });

  it('isSampledUser', () => {
    let uid = Array(64).fill('f').join('');
    let sampleRate = 1;
    hashResult = Array(40).fill('f').join('');

    assert.equal(
      features.isSampledUser(sampleRate, uid, 'foo'),
      true,
      'should always return true if sample rate is 1'
    );

    assert.equal(
      crypto.createHash.callCount,
      0,
      'crypto.createHash should not have been called'
    );
    assert.equal(
      hash.update.callCount,
      0,
      'hash.update should not have been called'
    );
    assert.equal(
      hash.digest.callCount,
      0,
      'hash.digest should not have been called'
    );

    sampleRate = 0;
    hashResult = Array(40).fill('0').join('');

    assert.equal(
      features.isSampledUser(sampleRate, uid, 'foo'),
      false,
      'should always return false if sample rate is 0'
    );

    assert.equal(
      crypto.createHash.callCount,
      0,
      'crypto.createHash should not have been called'
    );
    assert.equal(
      hash.update.callCount,
      0,
      'hash.update should not have been called'
    );
    assert.equal(
      hash.digest.callCount,
      0,
      'hash.digest should not have been called'
    );

    sampleRate = 0.05;
    // First 27 characters are ignored, last 13 are 0.04 * 0xfffffffffffff
    hashResult = '0000000000000000000000000000a3d70a3d70a6';

    assert.equal(
      features.isSampledUser(sampleRate, uid, 'foo'),
      true,
      'should return true if sample rate is greater than the extracted cohort value'
    );

    assert.equal(
      crypto.createHash.callCount,
      1,
      'crypto.createHash should have been called once'
    );
    let args = crypto.createHash.args[0];
    assert.equal(
      args.length,
      1,
      'crypto.createHash should have been passed one argument'
    );
    assert.equal(
      args[0],
      'sha1',
      'crypto.createHash algorithm should have been sha1'
    );

    assert.equal(
      hash.update.callCount,
      2,
      'hash.update should have been called twice'
    );
    args = hash.update.args[0];
    assert.equal(
      args.length,
      1,
      'hash.update should have been passed one argument first time'
    );
    assert.equal(
      args[0],
      uid.toString('hex'),
      'hash.update data should have been stringified uid first time'
    );
    args = hash.update.args[1];
    assert.equal(
      args.length,
      1,
      'hash.update should have been passed one argument second time'
    );
    assert.equal(
      args[0],
      'foo',
      'hash.update data should have been key second time'
    );

    assert.equal(
      hash.digest.callCount,
      1,
      'hash.digest should have been called once'
    );
    args = hash.digest.args[0];
    assert.equal(
      args.length,
      1,
      'hash.digest should have been passed one argument'
    );
    assert.equal(args[0], 'hex', 'hash.digest ecnoding should have been hex');

    crypto.createHash.resetHistory();
    hash.update.resetHistory();
    hash.digest.resetHistory();

    sampleRate = 0.04;

    assert.equal(
      features.isSampledUser(sampleRate, uid, 'bar'),
      false,
      'should return false if sample rate is equal to the extracted cohort value'
    );

    assert.equal(
      crypto.createHash.callCount,
      1,
      'crypto.createHash should have been called once'
    );
    assert.equal(
      hash.update.callCount,
      2,
      'hash.update should have been called twice'
    );
    assert.equal(
      hash.update.args[0][0],
      uid.toString('hex'),
      'hash.update data should have been stringified uid first time'
    );
    assert.equal(
      hash.update.args[1][0],
      'bar',
      'hash.update data should have been key second time'
    );
    assert.equal(
      hash.digest.callCount,
      1,
      'hash.digest should have been called once'
    );

    crypto.createHash.resetHistory();
    hash.update.resetHistory();
    hash.digest.resetHistory();

    sampleRate = 0.03;

    assert.equal(
      features.isSampledUser(sampleRate, uid, 'foo'),
      false,
      'should return false if sample rate is less than the extracted cohort value'
    );

    crypto.createHash.resetHistory();
    hash.update.resetHistory();
    hash.digest.resetHistory();

    uid = Array(64).fill('7').join('');
    sampleRate = 0.03;
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852';

    assert.equal(
      features.isSampledUser(sampleRate, uid, 'wibble'),
      true,
      'should return true if sample rate is greater than the extracted cohort value'
    );

    assert.equal(
      hash.update.callCount,
      2,
      'hash.update should have been called twice'
    );
    assert.equal(
      hash.update.args[0][0],
      uid,
      'hash.update data should have been stringified uid first time'
    );
    assert.equal(
      hash.update.args[1][0],
      'wibble',
      'hash.update data should have been key second time'
    );

    crypto.createHash.resetHistory();
    hash.update.resetHistory();
    hash.digest.resetHistory();
  });

  it('isLastAccessTimeEnabledForUser', () => {
    const uid = 'foo';
    const email = 'bar@mozilla.com';
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852';

    config.lastAccessTimeUpdates.enabled = true;
    config.lastAccessTimeUpdates.sampleRate = 0;

    config.lastAccessTimeUpdates.sampleRate = 0.03;
    assert.equal(
      features.isLastAccessTimeEnabledForUser(uid, email),
      true,
      'should return true when sample rate matches'
    );

    config.lastAccessTimeUpdates.sampleRate = 0.02;
    assert.equal(
      features.isLastAccessTimeEnabledForUser(uid, email),
      false,
      'should return false when sample rate does not match'
    );

    config.lastAccessTimeUpdates.enabled = false;
    config.lastAccessTimeUpdates.sampleRate = 0.03;
    assert.equal(
      features.isLastAccessTimeEnabledForUser(uid, email),
      false,
      'should return false when feature is disabled'
    );
  });
});
