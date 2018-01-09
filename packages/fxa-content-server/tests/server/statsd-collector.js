/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const fs = require('fs');
const dgram = require('dgram');
const path = require('path');
const StatsDCollector = require('../../server/lib/statsd-collector');
var STATSD_PORT = 8125;
var STATSD_HOST = '127.0.0.1';
var EXPECTED_DATA_ROOT = path.join('tests', 'server', 'expected');
var FIXTURE_ROOT = path.join('tests', 'server', 'fixtures');

function readFixture(fileToRead) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_ROOT, fileToRead)));
}

function readExpectedData(fileToRead) {
  var sourcePath = path.join(EXPECTED_DATA_ROOT, fileToRead);
  return fs.readFileSync(sourcePath).toString().trim();
}

var suite = {
  tests: {}
};

// This test cannot be run remotely like the other tests in tests/server. So,
// if production, just skip these tests (register a suite with no tests).
if (intern._config.fxaProduction) {
  registerSuite('statsd-collector', suite);
  return;
}

suite.tests['properly maintains connected state'] = function () {
  var metricsCollector = new StatsDCollector();
  assert.isFalse(metricsCollector.connected);
  metricsCollector.init();
  assert.isTrue(metricsCollector.connected);
  metricsCollector.close();
  assert.isFalse(metricsCollector.connected);
};

suite.tests['properly collects metrics events'] = function () {
  var dfd = this.async(10000);

  var metricsCollector = new StatsDCollector();
  metricsCollector.init();

  var fixtureMessage = readFixture('statsd_body_1.json');

  var MESSAGES_TO_TEST = {
    'fxa.content.loaded.time': 'statsd_timer_body_login.txt',
    'fxa.content.marketing.impression': 'statsd_impression_body_marketing.txt',
    'fxa.content.num_stored_accounts': 'statsd_count_body_numStoredAccounts.txt',
    'fxa.content.signup.success': 'statsd_event_body_signup_success.txt',
    'fxa.content.signup.success.time': 'statsd_timer_body_signup_success.txt'
  };

  var MESSAGES_TO_TEST_COUNT = Object.keys(MESSAGES_TO_TEST).length;
  var receivedCount = 0;

  udpTest(function (message, server) {
    message = statsdMessageToObject(message);

    if (MESSAGES_TO_TEST[message.name]) {
      var sourcePath = MESSAGES_TO_TEST[message.name];
      var expectedMessage = readExpectedData(sourcePath);
      assert.equal(message.raw, expectedMessage);
      receivedCount++;
    }

    // all types of message should have the normal tags.
    assert.equal(message.tags['lang'], 'en');

    if (receivedCount === MESSAGES_TO_TEST_COUNT) {
      metricsCollector.close();
      server.close();
      dfd.resolve();
    }
  }, function (){
    metricsCollector.write(fixtureMessage);
  });

  return dfd.promise;

};

suite.tests['properly collects navigationTiming stats'] = function () {
  return testStatsDEvents('statsd_body_1.json', 'statsd_navigation_timing_data_1.txt');
};

suite.tests['properly filters out of range timing stats'] = function () {
  return testStatsDEvents('statsd_body_filter_out_of_range.json', 'statsd_filter_out_of_range.txt');
};

suite.tests['properly collects utm params'] = function () {
  return testStatsDEvents('statsd_body_2.json', 'statsd_utm_data_2.txt');
};

registerSuite('statsd-collector', suite);

/**
 * Creates a test harness, that binds to an ephemeral port
 * @param {Function} test The test to run, should take message as the argument
 * @param {Function} callback The callback to call after the server is listening
 * @private
 */
function udpTest(test, callback){
  var server = dgram.createSocket('udp4');
  server.on('message', function (message){
    test(message.toString(), server);
  });

  server.on('error', function (err) {
    console.log('server error:\n' + err.stack);
    server.close();
  });

  server.bind(STATSD_PORT, STATSD_HOST, function () {
    callback(server);
  });
}

/**
 * Converts a UDP StatsD string into an object. Helps with assertions
 * @param {String} message
 */
function statsdMessageToObject(message) {
  message = message.toString();
  var split = message.split('#');
  var name = split[0].split(':')[0];
  var chunkTags = split[1];
  var tags = chunkTags.split(',');
  var obj = {
    name: name,
    raw: message,
    tags: {}
  };

  tags.forEach(function (rawTag) {
    var tagSplit = rawTag.split(':');
    obj.tags[tagSplit[0]] = tagSplit[1];
  });

  return obj;
}

/**
 * Tests to ensure StatsD events are collection as expected
 *
 * @param {string} fixtureFilename - JSON file to use as source info.
 * @param {string} expectedFilename - txt file containing
 *   expected StatsD messages.
 * @returns {promise}
 */
function testStatsDEvents(fixtureFilename, expectedFilename) {
  return new Promise((resolve) => {
    var metricsCollector = new StatsDCollector();
    metricsCollector.init();

    var fixtureMessage = readFixture(fixtureFilename);
    // expectedEvents are written to disk in alphabetical order already.
    var expectedEventBody = readExpectedData(expectedFilename);

    var expectedEvents = expectedEventBody.split('\n');
    var receivedEvents = [];

    udpTest(function (message, server) {
      message = statsdMessageToObject(message);

      // event data is sent if available, interfering
      // with the test. Only collect navigationTiming data.
      if (/navigationTiming\./.test(message.raw)) {
        receivedEvents.push(message.raw);
      }

      if (receivedEvents.length === expectedEvents.length) {
        // udp messages can be received out of order, sort them, the check
        // to ensure all the expected ones arrive.
        receivedEvents = receivedEvents.sort();
        assert.deepEqual(receivedEvents, expectedEvents);

        metricsCollector.close();
        server.close();
        resolve();
      }


    }, function (){
      metricsCollector.write(fixtureMessage);
    });

  });

}
