/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  var url = intern.config.fxaContentRoot + 'signin';
  var nonFiraUrl = intern.config.fxaContentRoot + 'zh-CN/legal/privacy';

  registerSuite({
    name: 'fonts',

    'Uses Fira for en': function () {

      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)

        .findByCssSelector('#fxa-signin-header')
          .getComputedStyle('font-family')
          .then(function (value) {
            assert.ok(value.indexOf('Fira Sans') > -1);
          })
        .end()

        .findByCssSelector('body')
          .getComputedStyle('font-family')
          .then(function (value) {
            assert.ok(value.indexOf('Clear Sans') > -1);
          })
        .end();
    },

    'Does not use Fira for non-supported locale': function () {

      return this.remote
        .get(require.toUrl(nonFiraUrl))

        .findByCssSelector('#fxa-pp-header')
          .getComputedStyle('font-family')
          .then(function (value) {
            assert.ok(value.indexOf('Fira Sans') === -1);
          })
        .end()

        .findByCssSelector('body')
          .getComputedStyle('font-family')
          .then(function (value) {
            assert.ok(value.indexOf('Clear Sans') === -1);
          })
        .end();
    }
  });
});
