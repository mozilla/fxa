/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['intern!tdd', 'intern/chai!assert', 'client/FxAccountClient'], function(
  tdd,
  assert,
  FxAccountClient
) {
  with (tdd) {
    suite('init', function() {
      test('#should error if no options set', function() {
        try {
          void new FxAccountClient();
        } catch (e) {
          assert.isDefined(e.message);
        }
      });

      test('#should catch undefined parameters for the url', function() {
        try {
          void new FxAccountClient(undefined, {});
        } catch (e) {
          assert.isDefined(e.message);
        }
      });
    });
  }
});
