/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/Promise',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!fs',
  'intern/dojo/node!dgram',
  'intern/dojo/node!path',
  'intern/dojo/node!../../server/lib/statsd-collector'
], function (intern, registerSuite, assert, Promise, initLogging, fs, dgram, path, StatsDCollector) {
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
    name: 'statsd-collector'
  };

  // This test cannot be run remotely like the other tests in tests/server. So,
  // if production, just skip these tests (register a suite with no tests).
  if (intern.config.fxaProduction) {
    registerSuite(suite);
    return;
  }

  suite['properly maintains connected state'] = function () {
    var metricsCollector = new StatsDCollector();
    assert.isFalse(metricsCollector.connected);
    metricsCollector.init();
    assert.isTrue(metricsCollector.connected);
    metricsCollector.close();
    assert.isFalse(metricsCollector.connected);
  };

  suite['properly collects metrics events'] = function () {
    var dfd = new Promise.Deferred();

    var metricsCollector = new StatsDCollector();
    metricsCollector.init();

    var fixtureMessage = readFixture('statsd_body_1.json');

    var MESSAGES_TO_TEST = {
      'fxa.content.loaded.time': 'statsd_timer_body_login.txt',
      'fxa.content.marketing.impression': 'statsd_impression_body_marketing.txt',
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

  suite['properly collects navigationTiming stats'] = function () {
    var dfd = new Promise.Deferred();

    var metricsCollector = new StatsDCollector();
    metricsCollector.init();

    var fixtureMessage = readFixture('statsd_body_1.json');
    // expectedEvents are written to disk in alphabetical order already.
    var expectedEventBody = readExpectedData('statsd_navigation_timing_data_1.txt');

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
        dfd.resolve();
      }


    }, function (){
      metricsCollector.write(fixtureMessage);
    });

    return dfd.promise;
  };

  suite['properly collects metrics events with ab testing tags'] = function () {
    var dfd = new Promise.Deferred();

    var metricsCollector = new StatsDCollector();
    metricsCollector.init();

    var fixtureMessage = readFixture('statsd_body_ab.json');
    var expectedEventBody = readExpectedData('statsd_event_body_ab.txt');

    udpTest(function (message, server) {
      message = statsdMessageToObject(message);

      // navigationTiming timing data is sent if available, interfering
      // with the test. Ignore navigationTiming data.
      if (/navigationTiming\./.test(message.raw)) {
        return;
      }

      assert.equal(message.raw, expectedEventBody);

      // both types of message should have the normal tags.
      assert.equal(message.tags['ab_mailcheck_is_enable_or_disabled_mailcheckenabled'], 'true');
      metricsCollector.close();
      server.close();
      dfd.resolve();

    }, function (){
      metricsCollector.write(fixtureMessage);
    });

    return dfd.promise;

  };

  registerSuite(suite);

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

});
