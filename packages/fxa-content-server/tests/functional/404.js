/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const selectors = require('./lib/selectors');

const { click, openPage } = require('./lib/helpers');

registerSuite('404', {
  'visit an invalid page': function () {
    const url = `${intern._config.fxaContentRoot}/four-oh-four`;

    return this.remote
      .then(openPage(url, selectors['404'].HEADER))
      .then(click(selectors['404'].LINK_HOME, selectors.ENTER_EMAIL.HEADER));
  },
});
