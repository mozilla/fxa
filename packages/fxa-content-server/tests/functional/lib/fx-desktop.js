/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'intern/chai!assert'
], function (assert) {

  /**
   * Listens for FirefoxAccountsCommand events coming from FxA and
   * automatically responds so that no error messages are displayed
   * and the flows can complete.
   *
   * Run in the context of the web page.
   */
  function listenForFxaCommands() {
    /* global window, document */
    // postMessage back responses to the browser so that no error messages
    // are displayed and the flows can be completed. Mirrors how the browser
    // handles things in
    // http://mxr.mozilla.org/mozilla-central/source/browser/base/content/aboutaccounts/aboutaccounts.js#252
    function sendMessageToFxa(content) {
      window.postMessage({
        type: 'message',
        content: content
      }, '*');
    }

    // Add an event listener that auto responds to FirefoxAccountsCommands so
    // that flows can complete and no error messages are displayed.
    window.addEventListener('FirefoxAccountsCommand', function (e) {
      var command = e.detail.command;

      // the firefox Selenium driver does not support querying
      // localStorage, and data appended to the URL is overwritten
      // when the router updates a route. Waiting for cookies to be
      // set is difficult, and selenium is great at searching for
      // DOM elements. Append an element every time a FirefoxAccountsCommand
      // is received that Selenium can look for to see if the message was
      // actually received.

      var element = document.createElement('div');
      element.setAttribute('id', 'message-' + command);
      element.innerText = JSON.stringify(e.detail.data);
      document.body.appendChild(element);

      var DOES_NOT_RESPOND = [
        'loaded',
        'change_password',
        'delete_account'
      ];

      if (DOES_NOT_RESPOND.indexOf(command) === -1) {
        sendMessageToFxa({
          status: command
        });
      }
    });

    return true;
  }

  function testIsBrowserNotifiedOfLogin(context, email, options) {
    return context.remote
      .findByCssSelector('#message-login')
        .getProperty('innerText')
        .then(function (innerText) {
          options = options || {};
          var data = JSON.parse(innerText);
          assert.equal(data.email, email);
          assert.ok(data.unwrapBKey);
          assert.ok(data.keyFetchToken);
          if (options.checkVerified) {
            assert.isTrue(data.verified);
          } else {
            assert.isFalse(data.verified);
          }
        })
      .end();
  }

  function testIsBrowserNotifiedOfMessage(context, message) {
    return context.remote
      .findByCssSelector('#message-' + message)
      .end();
  }

  return {
    listenForFxaCommands: listenForFxaCommands,
    testIsBrowserNotifiedOfLogin: testIsBrowserNotifiedOfLogin,
    testIsBrowserNotifiedOfMessage: testIsBrowserNotifiedOfMessage
  };
});


