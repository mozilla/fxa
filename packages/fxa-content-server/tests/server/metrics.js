/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const config = require('../../server/lib/configuration');
const got = require('got');
const fs = require('fs');
var serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

var suite = {
  tests: {},
};

const MAX_EVENT_OFFSET = config.get('client_metrics').max_event_offset;

const VALID_METRICS = JSON.parse(
  fs.readFileSync('tests/server/fixtures/metrics_valid.json')
);
const INVALID_METRICS_OVERWRITE_TOSTRING_METHOD = JSON.parse(
  fs.readFileSync('tests/server/fixtures/metrics_overwrite_toString.json')
);

const FLUSH_TIME_START_TIME_DIFF =
  VALID_METRICS.flushTime - VALID_METRICS.startTime;

suite.tests['#post /metrics - returns 200'] = function () {
  return testValidMetricsData(VALID_METRICS, 'application/json');
};

suite.tests[
  '#post /metrics - returns 200 if Content-Type is text/plain'
] = function () {
  return testValidMetricsData(VALID_METRICS, 'text/plain;charset=UTF-8');
};

suite.tests['#post /metrics - returns 200 with valid data'] = {
  'valid entrypoint (fxa:connect_another_device)': testValidMetricsField(
    'entrypoint',
    'fxa:connect_another_device'
  ),
  'valid entrypoint (fxa:signup)': testValidMetricsField(
    'entrypoint',
    'fxa:signup'
  ),
  'valid entrypoint (fxa:signup-complete)': testValidMetricsField(
    'entrypoint',
    'fxa:signup-complete'
  ),
  'valid entrypoint_experiment (wibble)': testValidMetricsField(
    'entrypoint_experiment',
    'wibble'
  ),
  'valid entrypoint_variation (blee)': testValidMetricsField(
    'entrypoint_variation',
    'blee'
  ),
  'valid error-type (error.unknown context.auth.108)': testValidMetricsEvent(
    'type',
    'error.unknown context.auth.108'
  ),
  'valid error-type (signin-permissions.checkbox.change.profile:display_name.unchecked)':
    testValidMetricsEvent(
      'type',
      'signin-permissions.checkbox.change.profile:display_name.unchecked'
    ),
  'valid experiment choice (pushLogin)': testValidMetricsField('experiments', [
    { choice: 'pushLogin', group: 'treatment' },
  ]),
  'valid initialView': testValidMetricsField('initialView', 'az_-'),
  'valid lang (pt)': testValidMetricsField('lang', 'pt'),
  'valid lang (pt-BR)': testValidMetricsField('lang', 'pt-BR'),
  'valid lang (pt-br)': testValidMetricsField('lang', 'pt-br'),
  'valid referrer (android-app://com.google.android.gm)': testValidMetricsField(
    'referrer',
    'android-app://com.google.android.gm'
  ),
  'valid referrer (none)': testValidMetricsField('referrer', 'none'),
  'valid screen.clientHeight (none)': testValidMetricsScreenField(
    'clientHeight',
    'none'
  ),
  'valid screen.clientWidth (none)': testValidMetricsScreenField(
    'clientWidth',
    'none'
  ),
  'valid screen.devicePixelRatio (none)': testValidMetricsScreenField(
    'devicePixelRatio',
    'none'
  ),
  'valid screen.height (none)': testValidMetricsScreenField('height', 'none'),
  'valid screen.width (none)': testValidMetricsScreenField('width', 'none'),
  'valid uniqueUserId (none)': testValidMetricsField('uniqueUserId', 'none'),
  'valid utm_campaign (from firstrun)': testValidMetricsField(
    'utm_campaign',
    'page+referral+-+not+part+of+a+campaign'
  ),
  'valid utm_content': testValidMetricsField('utm_campaign', 'firefox/sync'),
};

suite.tests['#post /metrics - returns 400 with invalid data'] = {
  'empty body': () => testInvalidMetricsData(''),
  'invalid broker (#)': testInvalidMetricsField('broker', '#'),
  'invalid context (!)': testInvalidMetricsField('context', '!'),
  'invalid duration (-1)': testInvalidMetricsField('duration', -1),
  'invalid duration (MAX_EVENT_OFFSET + 1)': testInvalidMetricsField(
    'duration',
    MAX_EVENT_OFFSET + 1
  ),
  'invalid flushTime (VALID_METRICS.startTime + MAX_EVENT_OFFSET + 1)':
    testInvalidMetricsData(
      'flushTime',
      VALID_METRICS.startTime + MAX_EVENT_OFFSET + 1
    ),
  'invalid startTime (VALID_METRICS.flushTime - MAX_EVENT_OFFSET - 1)':
    testInvalidMetricsData(
      'startTime',
      VALID_METRICS.flushTime - MAX_EVENT_OFFSET - 1
    ),
  'invalid entryPoint (15612!$@%%asdf<>)': testInvalidMetricsField(
    'entrypoint',
    '15612!$@%%asdf<>'
  ),
  'invalid entrypoint (!%!%)': testInvalidMetricsField('entrypoint', '!%!%'),
  'invalid entrypoint_experiment (wibble!)': testInvalidMetricsField(
    'entrypoint_experiment',
    'wibble!'
  ),
  'invalid entrypoint_variation (blee;)': testInvalidMetricsField(
    'entrypoint_variation',
    'blee;'
  ),
  'invalid event offset (<FLUSH_TIME_START_TIME_DIFF + 1>)':
    testInvalidMetricsField('events', [
      { offset: FLUSH_TIME_START_TIME_DIFF + 1, type: 'offset-too-high-nono' },
    ]), //eslint-disable-line max-len
  'invalid event offset (<MAX_EVENT_OFFSET + 1>)': testInvalidMetricsField(
    'events',
    [{ offset: MAX_EVENT_OFFSET + 1, type: 'more-than-two-days-nono' }]
  ),
  'invalid event offset (a)': testInvalidMetricsField('events', [
    { offset: 'a', type: 'allgood' },
  ]),
  'invalid event type (<owned>)': testInvalidMetricsField('events', [
    { offset: 12, type: '<owned>' },
  ]),
  'invalid events ({})': testInvalidMetricsField('events', {}),
  'invalid experiment choice ({})': testInvalidMetricsField('experiments', [
    { choice: {}, group: 'treatment' },
  ]),
  'invalid experiment group (1255{})': testInvalidMetricsField('experiments', [
    { choice: 'pushLogin', group: '1255{}' },
  ]),
  'invalid experiments (123)': testInvalidMetricsField('experiments', '123'),
  'invalid flowBeginTime (asdf)': testInvalidMetricsField(
    'flowBeginTime',
    'asdf'
  ),
  'invalid flowId (deadbeef)': testInvalidMetricsField('flowId', 'deadbeef'),
  'invalid flushTime (<script>)': testInvalidMetricsField(
    'flushTime',
    '<script>'
  ),
  'invalid initialView': testInvalidMetricsField('initialView', 'A'),
  'invalid isSampledUser (no)': testInvalidMetricsField('isSampledUser', 'no'),
  'invalid lang (es:ES)': testInvalidMetricsField('lang', 'es:ES'),
  'invalid marketing ({})': testInvalidMetricsField('marketing', {}),
  'invalid marketing campaignId (l33t!@$)': testInvalidMetricsField(
    'marketing',
    [{ campaignId: 'l33t!@$', clicked: true, url: 'https://thestore.com' }]
  ),
  'invalid marketing clicked ({})': testInvalidMetricsField('marketing', [
    { campaignId: 'marketing123', clicked: {}, url: 'https://thestore.com' },
  ]),
  'invalid marketing url (notaurl)': testInvalidMetricsField('marketing', [
    { campaignId: 'marketing123', clicked: true, url: 'notaurl' },
  ]),
  'invalid numStoredAccounts ({})': testInvalidMetricsField(
    'numStoredAccounts',
    {}
  ),
  'invalid referrer (not a url)': testInvalidMetricsField(
    'referrer',
    'not a url'
  ),
  'invalid screen (not an object)': testInvalidMetricsField(
    'screen',
    'not an object'
  ),
  'invalid screen clientHeight (null)': testInvalidMetricsField('screen', {
    clientHeight: null,
    clientWidth: 12,
    devicePixelRatio: 2.3,
    height: 31,
    width: 32,
  }), //eslint-disable-line max-len
  'invalid screen clientWidth (a)': testInvalidMetricsField('screen', {
    clientHeight: 10,
    clientWidth: 'a',
    devicePixelRatio: 2.3,
    height: 31,
    width: 32,
  }),
  'invalid screen devicePixelRatio (b)': testInvalidMetricsField('screen', {
    clientHeight: 10,
    clientWidth: 12,
    devicePixelRatio: 'b',
    height: 31,
    width: 32,
  }), //eslint-disable-line max-len
  'invalid screen height (undefined)': testInvalidMetricsField('screen', {
    clientHeight: 10,
    clientWidth: 12,
    devicePixelRatio: 2.3,
    height: undefined,
    width: 32,
  }), //eslint-disable-line max-len
  'invalid screen width (f)': testInvalidMetricsField('screen', {
    clientHeight: 10,
    clientWidth: 12,
    devicePixelRatio: 2.3,
    height: 31,
    width: 'f',
  }),
  'invalid service (124154adf123124242123)': testInvalidMetricsField(
    'service',
    '124154adf123124242123'
  ),
  'invalid startTime (true)': testInvalidMetricsField('startTime', true),
  'invalid timers ([])': testInvalidMetricsField('timers', []),
  'invalid uniqueUserId': testInvalidMetricsField(
    'uniqueUserId',
    '123-123-123-123-123-123-123-123-123-123-123-123-123-123-123-123-123-123-123'
  ),
  'invalid utm_campaign (#)': testInvalidMetricsField('utm_campaign', '#'),
  'invalid utm_campaign (asdf#)': testInvalidMetricsField(
    'utm_campaign',
    '123#'
  ),
  'invalid utm_content (!)': testInvalidMetricsField('utm_content', '!'),
  'invalid utm_medium (,)': testInvalidMetricsField('utm_medium', ','),
  'invalid utm_source (>)': testInvalidMetricsField('utm_source', '>'),
  'invalid utm_term (?)': testInvalidMetricsField('utm_term', '?'),
  'overwrite `toString` method': () =>
    testInvalidMetricsData(INVALID_METRICS_OVERWRITE_TOSTRING_METHOD),
};

function testValidMetricsField(fieldName, fieldValue) {
  return function () {
    var metrics = deepCopy(VALID_METRICS);
    metrics[fieldName] = fieldValue;
    return testValidMetricsData(metrics);
  };
}

function testValidMetricsScreenField(fieldName, fieldValue) {
  return function () {
    var metrics = deepCopy(VALID_METRICS);
    metrics.screen[fieldName] = fieldValue;
    return testValidMetricsData(metrics);
  };
}

function testValidMetricsEvent(fieldName, fieldValue) {
  return function () {
    var metrics = deepCopy(VALID_METRICS);
    metrics.events[0][fieldName] = fieldValue;
    return testValidMetricsData(metrics);
  };
}

function testValidMetricsData(body, contentType) {
  return got
    .post(serverUrl + '/metrics', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': contentType || 'application/json',
      },
    })
    .then((res) => {
      assert.equal(res.statusCode, 200);
    });
}

function testInvalidMetricsField(fieldName, fieldValue) {
  return function () {
    var metrics = deepCopy(VALID_METRICS);
    metrics[fieldName] = fieldValue;
    return testInvalidMetricsData(metrics);
  };
}

function testInvalidMetricsData(body) {
  return got
    .post(serverUrl + '/metrics', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    })
    .then(assert.fail, (err) => {
      assert.equal(err.response.statusCode, 400);
    });
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

registerSuite('metrics', suite);
