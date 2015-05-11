/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/Deferred',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!fs',
  'intern/dojo/node!dgram',
  'intern/dojo/node!../../server/lib/statsd-collector'
], function (intern, registerSuite, assert, Deferred, initLogging, fs, dgram, StatsDCollector) {
  'use strict';

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
    var dfd = new Deferred();

    var metricsCollector = new StatsDCollector();
    metricsCollector.init();
    var fixture_message = JSON.parse(fs.readFileSync('tests/server/fixtures/statsd_body_1.json'));
    var expected_message = fs.readFileSync('tests/server/expected/statsd_body_1.txt');

    udpTest(function (message, server) {
      message = statsdMessageToObject(message);
      assert.equal(message.raw, expected_message.toString().trim());
      assert.equal(message.name, 'fxa.content.screen.signup');
      assert.equal(message.tags['lang'], 'en');
      assert.equal(message.tags['screen_device_pixel_ratio'], '2');

      metricsCollector.close();
      server.close();
      dfd.resolve();
    }, function (){
      metricsCollector.write(fixture_message);
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
