/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const got = require('got');
const TestHelpers = require('../../lib/helpers');

const REPORT_URL =
  intern._config.fxaContentRoot.replace(/\/$/, '') + '/_/csp-violation';
const VALID_CSP_REPORT = {
  'csp-report': {
    'blocked-uri': 'http://bing.com',
    'document-uri': 'https://accounts.firefox.com/signin',
    'original-policy': 'connect-src https://accounts.firefox.com',
    referrer: 'https://addons.mozilla.org/?',
    'source-file': 'https://accounts.firefox.com',
    'violated-directive': 'style-src',
  },
};

// ensure we don't get any module from the cache, but to load it fresh every time
proxyquire.noPreserveCache();

const mockRequest = {
  body: {
    'csp-report': {
      'blocked-uri': 'http://bing.com',
    },
  },
  get: function() {},
};

const mockResponse = {
  json: function() {},
};

const createRandomHexString = TestHelpers.createRandomHexString;

const suite = {
  tests: {},
};

suite.tests['it works with csp reports'] = function() {
  const mockLogger = {
    info: sinon.spy(),
  };
  const postCsp = proxyquire(
    path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'),
    {
      '../logging/log': () => mockLogger,
    }
  )({ op: 'server.csp' });
  // check 5 times that all messages drop
  postCsp.process(mockRequest, mockResponse);
  postCsp.process(mockRequest, mockResponse);
  postCsp.process(mockRequest, mockResponse);
  postCsp.process(mockRequest, mockResponse);
  postCsp.process(mockRequest, mockResponse);

  assert.equal(mockLogger.info.callCount, 5);
};

suite.tests['it strips PII from the referrer and source fields'] = function() {
  const mockRequest = {
    body: {
      'csp-report': {
        'blocked-uri': 'http://bing.com',
        referrer:
          'https://addons.mozilla.org/?email=testuser@testuser.com&notaffected=1',
        'source-file':
          'https://accounts.firefox.com/settings?uid=bigscaryuid&email=testuser@testuser.com&notaffected=1',
      },
    },
    get: function() {},
  };

  const mockLogger = {
    info: sinon.spy(),
  };
  const postCsp = proxyquire(
    path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'),
    {
      '../logging/log': () => mockLogger,
    }
  )({ op: 'server.csp' });

  postCsp.process(mockRequest, mockResponse);

  assert.strictEqual(mockLogger.info.args[0][0], 'server.csp');
  const entry = mockLogger.info.args[0][1];
  assert.equal(entry.referrer, 'https://addons.mozilla.org/?notaffected=1');
  assert.equal(
    entry.source,
    'https://accounts.firefox.com/settings?notaffected=1'
  );
};

suite.tests['works correctly if query params do not contain PII'] = function() {
  const mockRequest = {
    body: {
      'csp-report': {
        'blocked-uri': 'http://bing.com',
        referrer: 'https://addons.mozilla.org/?notaffected=1',
        'source-file': 'https://accounts.firefox.com/settings?notaffected=1',
      },
    },
    get: function() {},
  };

  const mockLogger = {
    info: sinon.spy(),
  };
  const postCsp = proxyquire(
    path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'),
    {
      '../logging/log': () => mockLogger,
    }
  )({ op: 'server.csp' });

  postCsp.process(mockRequest, mockResponse);

  assert.strictEqual(mockLogger.info.args[0][0], 'server.csp');
  const entry = mockLogger.info.args[0][1];
  assert.equal(entry.referrer, 'https://addons.mozilla.org/?notaffected=1');
  assert.equal(
    entry.source,
    'https://accounts.firefox.com/settings?notaffected=1'
  );
};

suite.tests['works correctly if no query params'] = function() {
  const mockRequest = {
    body: VALID_CSP_REPORT,
    get: function() {},
  };

  const mockLogger = {
    info: sinon.spy(),
  };
  const postCsp = proxyquire(
    path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'),
    {
      '../logging/log': () => mockLogger,
    }
  )({ op: 'server.csp' });

  postCsp.process(mockRequest, mockResponse);

  assert.strictEqual(mockLogger.info.args[0][0], 'server.csp');
  const entry = mockLogger.info.args[0][1];
  assert.equal(entry.referrer, 'https://addons.mozilla.org/?');
  assert.equal(entry.source, 'https://accounts.firefox.com');
};

suite.tests['#post csp - returns 400 if CSP report is invalid'] = {
  'blocked-uri not a URL (1)': testInvalidCspValue('blocked-uri', 1),
  'column-number negative (-1)': testInvalidCspValue('column-number', -1),
  'column-number not a number (a)': testInvalidCspValue('column-number', 'a'),
  'csp-report ({})': testInvalidCspReport({
    'csp-report': {},
  }),
  'csp-report not set': testInvalidCspReport({}),
  'disposition is too long': testInvalidCspValue(
    'disposition',
    createRandomHexString(1025)
  ),
  'disposition not a string (1)': testInvalidCspValue('disposition', 1),
  'document-uri empty ()': testInvalidCspValue('document-uri', ''),
  'document-uri invalid scheme (telnet)': testInvalidCspValue(
    'document-uri',
    'telnet://bing.com'
  ),
  'effective-directive not a string (true)': testInvalidCspValue(
    'effective-directive',
    true
  ),
  'line-number negative (-1)': testInvalidCspValue('line-number', -1),
  'line-number not a number (a)': testInvalidCspValue('line-number', 'a'),
  'referrer not a string (null)': testInvalidCspValue('referrer', null),
  'script-sample not a string (123)': testInvalidCspValue('script-sample', 123),
  'source-file not a string (123)': testInvalidCspValue('script-sample', 123),
  'status-code negative (-1)': testInvalidCspValue('status-code', -1),
  'status-code not a number (false)': testInvalidCspValue('status-code', false),
  'violated-directive empty ()': testInvalidCspValue('violated-directive', ''),
  'violated-directive not a string (321)': testInvalidCspValue(
    'violated-directive',
    321
  ),
};

suite.tests['#post csp - returns 400 if csp-report is empty'] = function() {
  testInvalidCspReport({
    'csp-report': {},
  });
};

suite.tests['#post csp - returns 200 if CSP report is valid'] = {
  'blocked-uri (asset)': testValidCspValue('blocked-uri', 'asset'),
  'blocked-uri (blob)': testValidCspValue('blocked-uri', 'blob'),
  'blocked-uri (data)': testValidCspValue('blocked-uri', 'data'),
  'blocked-uri (empty)': testValidCspValue('blocked-uri', ''),
  'blocked-uri (eval)': testValidCspValue('blocked-uri', 'eval'),
  'blocked-uri (inline)': testValidCspValue('blocked-uri', 'inline'),
  'blocked-uri (null)': testValidCspValue('blocked-uri'),
  'blocked-uri (self)': testValidCspValue('blocked-uri', 'self'),
  'column-number missing': testValidCspValue('column-number', undefined),
  'disposition missing': testValidCspValue('disposition', undefined),
  'document-uri (about:srcdoc)': testValidCspValue(
    'document-uri',
    'about:srcdoc'
  ),
  'effective-directive missing': testValidCspValue(
    'effective-directive',
    undefined
  ),
  'line-number missing': testValidCspValue('line-number', undefined),
  'original-policy empty ()': testValidCspValue('original-policy', undefined),
  'referrer empty ()': testValidCspValue('referrer', ''),
  'script-sample empty ()': testValidCspValue('script-sample', ''),
  'script-sample missing': testValidCspValue('script-sample', undefined),
  'source-file empty ()': testValidCspValue('source-file', ''),
  'source-file missing': testValidCspValue('source-file', undefined),
  'status-code missing': testValidCspValue('status-code', undefined),
  'unknown-field': testValidCspValue('unknown-field', 'hey-ho'), // unknown fields are silently dropped.
  valid: testValidCspValue(VALID_CSP_REPORT),
};

function testInvalidCspReport(cspReport) {
  return function() {
    return got
      .post(REPORT_URL, {
        body: JSON.stringify(cspReport),
        headers: { 'Content-Type': 'application/json' },
      })
      .then(assert.fail, resp => {
        //console.log('resp', resp);
        assert.equal(resp.statusCode, 400);
        assert.equal(resp.statusMessage, 'Bad Request');
      });
  };
}

function testInvalidCspValue(fieldName, fieldValue) {
  const cspReport = deepCopy(VALID_CSP_REPORT);

  cspReport['csp-report'][fieldName] = fieldValue;
  return testInvalidCspReport(cspReport);
}

function testValidCspReport(cspReport) {
  return function() {
    return got
      .post(REPORT_URL, {
        body: JSON.stringify(cspReport),
        headers: { 'Content-Type': 'application/json' },
      })
      .then(resp => {
        assert.equal(resp.statusCode, 200);
      });
  };
}

function testValidCspValue(fieldName, fieldValue) {
  const cspReport = deepCopy(VALID_CSP_REPORT);

  cspReport['csp-report'][fieldName] = fieldValue;
  return testValidCspReport(cspReport);
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

registerSuite('post-csp', suite);
