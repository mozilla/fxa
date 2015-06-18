/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Additional tests.
 */

define([
  'intern',
  'intern/chai!assert'
], function (intern, assert) {
  function noElementByCssSelector(context, selector) {
    return function () {
      return context.remote
        .setFindTimeout(0)

        .findByCssSelector(selector)
          .then(assert.fail, function (err) {
            assert.isTrue(/NoSuchElement/.test(String(err)));
          })
        .end()

        .setFindTimeout(intern.config.pageLoadTimeout);
    };
  }

  function noElementById(context, id) {
    return noElementByCssSelector(context, '#' + id);
  }

  return {
    noElementByCssSelector: noElementByCssSelector,
    noElementById: noElementById
  };

});


