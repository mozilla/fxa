/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const selectors = require('./lib/selectors');

const { click, openPage } = require('./lib/helpers');

const url = intern._config.fxaContentRoot + 'boom';

registerSuite('500', {
  'visit an invalid page': function() {
    const expected = intern._config.fxaProduction
      ? selectors['404'].HEADER
      : selectors['500'].HEADER;

    const button = intern._config.fxaProduction
      ? selectors['404'].LINK_HOME
      : selectors['500'].LINK_HOME;

    return this.remote
      .then(openPage(url, expected))
      .then(click(button, selectors.ENTER_EMAIL.HEADER));
  },
});
