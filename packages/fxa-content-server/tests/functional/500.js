/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
var url = intern._config.fxaContentRoot + 'boom';

registerSuite('500', {
  'visit an invalid page': function() {
    var expected = intern._config.fxaProduction
      ? 'fxa-404-home'
      : 'fxa-500-home';

    return (
      this.remote
        .get(url)
        .setFindTimeout(intern._config.pageLoadTimeout)
        .findById(expected)
        .click()
        .end()

        // success is going to the signup screen
        .findById('fxa-signup-header')
        .end()
    );
  },
});
