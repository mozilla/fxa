/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
const { openPage } = require('./lib/helpers');
const selectors = require('./lib/selectors');

var FROM_URL = 'http://example.com/';
var ENTER_EMAIL_URL = intern._config.fxaContentRoot;

registerSuite('back button after navigating to the root', {
  'start at github, visit Fxa root, click `back` - should go back to example': function () {
    return (
      this.remote
        .get(FROM_URL)
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))

        // click back.
        .goBack()

        .getCurrentUrl()
        .then(function (resultUrl) {
          assert.equal(resultUrl, FROM_URL);
        })
        .end()
    );
  },
});
