/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var _ = require('lodash');
var os = require('os');
var Promise = require('bluebird');

var DNT_ALLOWED_DATA = [
  'context',
  'entrypoint',
  'migration',
  'service',
];
var NO_DNT_ALLOWED_DATA = DNT_ALLOWED_DATA.concat([
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term'
]);
var HOSTNAME = os.hostname();
var MAX_DATA_LENGTH = 100;
var VERSION = 1;

module.exports = function (event, data, request) {
  var pickedData = _.pick(data, isDNT(request) ? DNT_ALLOWED_DATA : NO_DNT_ALLOWED_DATA);
  var eventData = _.assign({
    event: event.type,
    flow_id: data.flowId, //eslint-disable-line camelcase
    flow_time: event.flowTime, //eslint-disable-line camelcase
    hostname: HOSTNAME,
    op: 'flowEvent',
    pid: process.pid,
    time: event.time,
    userAgent: request.headers['user-agent'],
    v: VERSION
  }, _.mapValues(pickedData, sanitiseData));

  optionallySetFallbackData(eventData, 'service', data.client_id);
  optionallySetFallbackData(eventData, 'entrypoint', data.entryPoint);

  if (typeof eventData.time === 'number') {
    eventData.time = new Date(eventData.time).toISOString();
  }

  return new Promise(function (resolve) {
    setImmediate(function () {
      // The data pipeline listens on stderr.
      process.stderr.write(JSON.stringify(eventData) + '\n');
      resolve();
    });
  });
};

function isDNT (request) {
  return request.headers.dnt === '1';
}

function limitLength (data) {
  if (data && data.length > MAX_DATA_LENGTH) {
    return data.substr(0, MAX_DATA_LENGTH);
  }

  return data;
}

function sanitiseData (data) {
  if (data === 'none') {
    return undefined;
  }

  return limitLength(data);
}

function optionallySetFallbackData (eventData, key, fallback) {
  if (! eventData[key] && fallback) {
    eventData[key] = limitLength(fallback);
  }
}

