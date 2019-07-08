/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
var url = intern._config.fxaContentRoot + 'robots.txt';

registerSuite('robots.txt', {
  'should allow bots to access all pages': function() {
    return this.remote
      .get(url)
      .setFindTimeout(intern._config.pageLoadTimeout)
      .findByTagName('body')
      .getVisibleText()
      .then(function(source) {
        assert.isTrue(/^Allow:/gm.test(source));
      })
      .end();
  },
});
