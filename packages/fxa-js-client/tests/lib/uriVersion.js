/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'sjcl',
], function(tdd, assert, FxAccountClient) {
  var xhr = function() {};
  var serverUri = 'https://mock.server';
  var VERSION = FxAccountClient.VERSION;

  with (tdd) {
    suite('fxa client', function() {
      test('#version appended to uri when not present', function() {
        var client = new FxAccountClient(sjcl, serverUri, { xhr: xhr });
        assert.equal(serverUri + '/' + VERSION, client.request.baseUri);
      });

      test('#version not appended to uri when already present', function() {
        var uri = serverUri + '/' + VERSION;
        var client = new FxAccountClient(sjcl, uri, { xhr: xhr });
        assert.equal(uri, client.request.baseUri);
      });
    });
  }
});
