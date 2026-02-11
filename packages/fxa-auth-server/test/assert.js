/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = {
  ...require('sinon').assert,
  ...require('chai').assert,
};

module.exports = {
  ...assert,

  async failsAsync(promise, expected, message) {
    let failed = false;
    try {
      await promise;
    } catch (err) {
      failed = true;
      if (expected) {
        assert.deepNestedInclude(err, expected, message);
      }
    }
    assert.isTrue(failed, message);
  },
};
