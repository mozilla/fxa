/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = { ...require('sinon').assert, ...require('chai').assert };

async function assertFailure(asyncFn, assertFn) {
  let err;
  try {
    await asyncFn;
  } catch (e) {
    err = e;
  }
  assertFn(err);
}

module.exports = {
  assert,
  assertFailure,
};
