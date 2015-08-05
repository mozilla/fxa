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
  'intern/dojo/node!../../server/lib/statsd-collector'
], function (intern, registerSuite, assert, Promise, initLogging, fs, dgram, StatsDCollector) {
  var STATSD_PORT = 8125;
  var STATSD_HOST = '127.0.0.1';

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

    var fixtureMessage = JSON.parse(fs.readFileSync('tests/server/fixtures/statsd_body_1.json'));
    var expectedEventBody = fs.readFileSync('tests/server/expected/statsd_event_body_1.txt').toString().trim();
    var expectedImpressionBody = fs.readFileSync('tests/server/expected/statsd_impression_body_1.txt').toString().trim();

    var EXPECTED_TOTAL_MESSAGES = 3;
    var count = 0;
    var timingOffsetTracked = false;
    udpTest(function (message, server) {
      message = statsdMessageToObject(message);

      // ensure both the single event and the single impression are logged.
      if (message.name === 'fxa.content.signup.success') {
        assert.equal(message.raw, expectedEventBody);
      } else if (message.name === 'fxa.content.signup.success.time') {
        timingOffsetTracked = true;
      } else if (message.name === 'fxa.content.marketing.impression') {
        assert.equal(message.raw, expectedImpressionBody);
      }

      // both types of message should have the normal tags.
      assert.equal(message.tags['lang'], 'en');

      count++;
      if (count === EXPECTED_TOTAL_MESSAGES) {
        assert.isTrue(timingOffsetTracked, 'timing events are submitted');
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

    var fixtureMessage = JSON.parse(fs.readFileSync('tests/server/fixtures/statsd_body_ab.json'));
    var expectedEventBody = fs.readFileSync('tests/server/expected/statsd_event_body_ab.txt').toString().trim();

    udpTest(function (message, server) {
      message = statsdMessageToObject(message);

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
