/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
var url = intern._config.fxaContentRoot + 'signin';
var nonFiraUrl = intern._config.fxaContentRoot + 'zh-CN/legal/privacy';

registerSuite('fonts', {
  'Uses Fira for en': function () {

    return this.remote
      .get(url)
      .setFindTimeout(intern._config.pageLoadTimeout)

      .findByCssSelector('#fxa-signin-header')
      .getComputedStyle('font-family')
      .then(function (value) {
        assert.ok(value.indexOf('Fira Sans') > -1);
      })
      .end()

      .findByCssSelector('body')
      .getComputedStyle('font-family')
      .then(function (value) {
        assert.ok(value.indexOf('Fira Sans') > -1);
      })
      .end();
  },

  'Does not use Fira for non-supported locale': function () {

    return this.remote
      .get(nonFiraUrl)

      .findByCssSelector('#fxa-pp-header')
      .getComputedStyle('font-family')
      .then(function (value) {
        assert.ok(value.indexOf('Fira Sans') === -1);
      })
      .end()

      .findByCssSelector('body')
      .getComputedStyle('font-family')
      .then(function (value) {
        assert.ok(value.indexOf('Fira Sans') === -1);
      })
      .end();
  }
});
