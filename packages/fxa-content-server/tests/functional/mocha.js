/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/Deferred',
  'require',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!child_process'
], function (intern, registerSuite, assert, config, Deferred, require, child_process) {
  'use strict';

  /* global process */
  var travis = process && process.env.TRAVIS_COMMIT;
  var url = intern.config.fxaContentRoot + 'tests/index.html?coverage';
  if (travis) {
    url += '&travis=true';
  }
  var bodyText;
  var MOCHA_LOADER_SLEEP = 15000;

  registerSuite({
    name: 'mocha tests',

    'run the mocha tests': function () {
      var self = this;
      // timeout after 300 seconds
      this.timeout = 300000;

      return this.get('remote')
        .setFindTimeout(this.timeout)
        .get(require.toUrl(url))
        .refresh()
        // let the mocha reporter load up
        .sleep(MOCHA_LOADER_SLEEP)
        // wait for the tests to complete
        .findById('total-failures')
        .getVisibleText()
        .then(function (text) {
          if (text !== '0') {
            console.log(bodyText);
          }
          assert.equal(text, '0');
        })
        .end()
        .findByCssSelector('body')
        .getVisibleText()
        .then(function (text) {
          bodyText = text;
        })
        .end()

        .then(function () {
          if (travis) {
            return sendCoverageToCoveralls(self);
          } else {
            return validateCoverageLocally(self);
          }
        });

    }
  });

  /**
   * Sends test coverage data to https://coveralls.io
   * This runs with Travis CI. It pipes "coverageData" gathered from "_$blanket_LCOV" LCOV reporter.
   *
   * @param {Test} context
   * @returns {Deferred}
   */
  function sendCoverageToCoveralls(context) {
    var dfd = new Deferred();
    var spawn = child_process.spawn;

    console.log('Sending code coverage to coveralls.io');
    context.get('remote')
      // get code coverage data
      .execute(function () {
        /* global window */
        return window._$blanket_LCOV;
      }, [])
      .then(function (coverageData) {
        var child = spawn('node', ['node_modules/coveralls/bin/coveralls.js']);
        child.on('error', function (err) {
          throw err;
        });
        child.stderr.pipe(process.stdout);
        child.stdout.pipe(process.stdout);

        child.on('exit', function () {
          console.log('Code coverage sent');
          dfd.resolve();
        });
        child.stdin.write(coverageData);
        child.stdin.end();
      });

    return dfd;
  }

  /**
   * Checks the grand-total code coverage, looks for blanket.js errors
   *
   * @param {Test} context
   * @returns {Deferred}
   */
  function validateCoverageLocally(context) {
    var dfd = new Deferred();

    console.log('Validating code coverage...');
    context
      .get('remote')
      .findByCssSelector('.grand-total .rs')
      .getVisibleText()
      .then(function (text) {
        text = text.replace('%', '').trim();
        var covered = parseFloat(text);
        assert.ok(covered > config.get('tests.coverage.globalThreshold'),
            'code coverage is insufficient at ' + text + '%');
      })
      .end()

      // any individual failures?
      .setFindTimeout(3000)
      .findByCssSelector('.bl-error .bl-file a')
      .then(
      function () {
        throw new Error('Blanket.js Errors');
      },
      function (err) {
        // No Blanket.js errors
        assert.strictEqual(err.name, 'NoSuchElement', 'Error was: ' + err.message);
        dfd.resolve();
      }
    )
      .end();

    return dfd;
  }
});
