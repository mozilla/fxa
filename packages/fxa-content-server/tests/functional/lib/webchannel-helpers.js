/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Provides helpers for WebChannel tests
 */

define([
  'intern/chai!assert',
  'intern/node_modules/dojo/node!querystring',
  'tests/functional/lib/helpers',
], function (assert, queryString, FunctionalHelpers) {

  function openFxaFromRp(context, page, queryParams) {
    queryParams = queryParams || {};
    queryParams.webChannelId = 'test';
    var searchString = '?' + queryString.stringify(queryParams);

    return FunctionalHelpers.openFxaFromRp(context, page, searchString);
  }

  function testIsBrowserNotifiedOfLogin(context, options) {
    options = options || {};
    return FunctionalHelpers.testIsBrowserNotified(context, 'oauth_complete', function (data) {
      assert.ok(data.redirect);
      assert.ok(data.code);
      assert.ok(data.state);
      // None of these flows should produce encryption keys.
      assert.notOk(data.keys);
      assert.equal(data.closeWindow, options.shouldCloseTab);
    });
  }

  function testIsBrowserNotifiedOfLoginWithKeys(context, options) {
    options = options || {};
    return FunctionalHelpers.testIsBrowserNotified(context, 'oauth_complete', function (data) {
      assert.ok(data.redirect);
      assert.ok(data.code);
      assert.ok(data.state);
      // All of these flows should produce encryption keys.
      assert.ok(data.keys);
      assert.equal(data.closeWindow, options.shouldCloseTab);
    });
  }

  return {
    openFxaFromRp: openFxaFromRp,
    testIsBrowserNotifiedOfLogin: testIsBrowserNotifiedOfLogin,
    testIsBrowserNotifiedOfLoginWithKeys: testIsBrowserNotifiedOfLoginWithKeys
  };
});

