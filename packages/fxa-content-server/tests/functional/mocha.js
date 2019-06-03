/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
var ERROR_COLOR = '\x1b[1;31m';       // red
var DESCRIPTION_COLOR = '\x1b[1;36m'; // cyan
var DEFAULT_COLOR = '\x1b[0;0m';      // off

function errorColor(text) {
  return ERROR_COLOR + text + DEFAULT_COLOR;
}

function descriptionColor(text) {
  return DESCRIPTION_COLOR + text + DEFAULT_COLOR;
}

var url = intern._config.fxaContentRoot + 'tests/index.html';
var MOCHA_LOADER_SLEEP = 50;

registerSuite('mocha tests', {
  'run the mocha tests': function () {
    var self = this;
    // timeout after 300 seconds
    this.timeout = 300000;

    return this.remote
      .setFindTimeout(this.timeout)
      .get(url)
      .refresh()
      // let the mocha reporter load up
      .sleep(MOCHA_LOADER_SLEEP)

      // wait for the tests to complete
      .findById('total-failures')
      .getVisibleText()
      .then(function (text) {
        if (text !== '0') {
          return self.remote
            // print the errors to the console
            .findAllByCssSelector('.fail')
            .then(function (elements) {
              return Promise.all(elements.map(function (element) {
                return element.getVisibleText()
                  .then(function (errorText) {
                    var parts = errorText.split('‣');
                    console.error(errorColor('Failed test: ' + parts[0].trim()));
                    console.error(descriptionColor(' => ' + parts[1].trim()));
                  });
              }));
            })
            .end()

            .then(function () {
              throw new Error('Expected 0 mocha test failures');
            });
        }
      })
      .end();

  }
});
