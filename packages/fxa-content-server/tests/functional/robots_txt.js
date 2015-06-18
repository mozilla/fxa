/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  var url = intern.config.fxaContentRoot + 'robots.txt';

  registerSuite({
    name: 'robots.txt',

    'should disallow root': function () {

      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByTagName('body')
        .getVisibleText()
        .then(function (source) {
          assert.isTrue(/Disallow: \//g.test(source));
        })
        .end();
    }

  });
});
