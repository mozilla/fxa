/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const crypto = require('crypto');
const flowMetrics = require('../../server/lib/flow-metrics');
const sinon = require('sinon');

var suite = {
  tests: {}
};

var mockDateNow, mockRandomBytes, mockFlowIdKey, mockUserAgent;

suite.beforeEach = function () {
  mockFlowIdKey = 'test hmac key';
  mockUserAgent = 'test user agent';
  sinon.stub(Date, 'now').callsFake(function () {
    return mockDateNow;
  });
  sinon.stub(crypto, 'randomBytes').callsFake(function (size) {
    if (mockRandomBytes) {
      return new Buffer(mockRandomBytes);
    } else {
      var b = new Buffer(size);
      b.fill(0);
      return b;
    }
  });
  mockDateNow = 0;
  mockRandomBytes = null;
};

suite.afterEach = function () {
  mockDateNow = 0;
  mockRandomBytes = null;
  crypto.randomBytes.restore();
  Date.now.restore();
};

suite.tests['create and validate functions are exported'] = () => {
  assert.isObject(flowMetrics);
  assert.lengthOf(Object.keys(flowMetrics), 2);
  assert.equal(typeof flowMetrics.create, 'function');
  assert.equal(typeof flowMetrics.validate, 'function');
};

suite.tests['create returns current timestamp for flowBeginTime'] = () => {
  mockDateNow = 42;
  var flowEventData = flowMetrics.create(mockFlowIdKey, mockUserAgent);
  assert.equal(flowEventData.flowBeginTime, 42);
};

suite.tests['create correctly generates a known test vector'] = () => {
  mockDateNow = 1451566800000;
  mockFlowIdKey = 'S3CR37';
  mockUserAgent = 'Firefox';
  mockRandomBytes = 'MozillaFirefox!!';
  // Want to cross-check the test vector here?
  // The following python code was used to generate it:
  //
  //   import hashlib, hmac, binascii
  //   print binascii.hexlify('MozillaFirefox!!')
  //   print hmac.new('S3CR37', '\n'.join((
  //      binascii.hexlify('MozillaFirefox!!'),
  //      hex(1451566800000)[2:],
  //      'Firefox'
  //   )), hashlib.sha256).hexdigest()[:32]
  //
  var expectedSalt = '4d6f7a696c6c6146697265666f782121';
  var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206';

  var flowEventData = flowMetrics.create(mockFlowIdKey, mockUserAgent);

  assert.equal(flowEventData.flowBeginTime, 1451566800000);
  assert.equal(flowEventData.flowId, expectedSalt + expectedHmac);
};

suite.tests['create generates different flowIds for different keys'] = () => {
  var flowEventData1 = flowMetrics.create('key1', mockUserAgent);
  var flowEventData2 = flowMetrics.create('key2', mockUserAgent);

  assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
  assert.equal(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
};

suite.tests['create generates different flowIds for different user agents'] = () => {
  var flowEventData1 = flowMetrics.create(mockFlowIdKey, 'Firefox');
  var flowEventData2 = flowMetrics.create(mockFlowIdKey, 'Chrome');

  assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
  assert.equal(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
};

suite.tests['create generates different flowIds for different random salts'] = () => {
  mockRandomBytes = 'MozillaFirefox!!';
  var flowEventData1 = flowMetrics.create(mockFlowIdKey, mockUserAgent);

  mockRandomBytes = 'AllHailSeaMonkey';
  var flowEventData2 = flowMetrics.create(mockFlowIdKey, mockUserAgent);

  assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
  assert.equal(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
};

suite.tests['create generates different flowIds for different timestamps'] = () => {
  mockDateNow = +(new Date(2016, 0, 1));
  var flowEventData1 = flowMetrics.create(mockFlowIdKey, mockUserAgent);

  mockDateNow = +(new Date(2016, 1, 29));
  var flowEventData2 = flowMetrics.create(mockFlowIdKey, mockUserAgent);

  assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
  assert.notEqual(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
};

suite.tests['validate returns true for good data'] = () => {
  // Force the mocks to return bad data to be sure it really works
  mockDateNow = 1478626838531;
  mockFlowIdKey = 'foo';
  mockUserAgent = 'bar';
  mockRandomBytes = 'baz';

  const result = flowMetrics.validate(
    // Good data is from the create test
    'S3CR37',
    '4d6f7a696c6c6146697265666f782121c89d56556d22039fbbf54d34e0baf206',
    1451566800000,
    'Firefox'
  );

  assert.strictEqual(result, true);
};

suite.tests['validate returns false for a bad flow id'] = () => {
  // Force the mocks to return good data to be sure it really works
  mockDateNow = 1451566800000;
  mockFlowIdKey = 'S3CR37';
  mockUserAgent = 'Firefox';
  mockRandomBytes = 'MozillaFirefox!!';

  const result = flowMetrics.validate(
    'S3CR37',
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    1451566800000,
    'Firefox'
  );

  assert.strictEqual(result, false);
};

suite.tests['validate returns false for a bad key'] = () => {
  // Force the mocks to return good data to be sure it really works
  mockDateNow = 1451566800000;
  mockFlowIdKey = 'S3CR37';
  mockUserAgent = 'Firefox';
  mockRandomBytes = 'MozillaFirefox!!';

  const result = flowMetrics.validate(
    'foo',
    '4d6f7a696c6c6146697265666f782121c89d56556d22039fbbf54d34e0baf206',
    1451566800000,
    'Firefox'
  );

  assert.strictEqual(result, false);
};

suite.tests['validate returns false for a bad flow begin time'] = () => {
  // Force the mocks to return good data to be sure it really works
  mockDateNow = 1451566800000;
  mockFlowIdKey = 'S3CR37';
  mockUserAgent = 'Firefox';
  mockRandomBytes = 'MozillaFirefox!!';

  const result = flowMetrics.validate(
    'S3CR37',
    '4d6f7a696c6c6146697265666f782121c89d56556d22039fbbf54d34e0baf206',
    1478626838531,
    'Firefox'
  );

  assert.strictEqual(result, false);
};

suite.tests['validate returns false for a bad user agent string'] = () => {
  // Force the mocks to return good data to be sure it really works
  mockDateNow = 1451566800000;
  mockFlowIdKey = 'S3CR37';
  mockUserAgent = 'Firefox';
  mockRandomBytes = 'MozillaFirefox!!';

  const result = flowMetrics.validate(
    'S3CR37',
    '4d6f7a696c6c6146697265666f782121c89d56556d22039fbbf54d34e0baf206',
    1451566800000,
    'foo'
  );

  assert.strictEqual(result, false);
};

registerSuite('flow-metrics', suite);
