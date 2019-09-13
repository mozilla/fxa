/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const constants = require(`${ROOT_DIR}/lib/constants`);

describe('constants:', function() {
  it('exports the correct properties', () => {
    assert.ok(constants.OAUTH_SCOPE_OLD_SYNC);
    assert.ok(constants.OAUTH_SCOPE_SESSION_TOKEN);
  });
});
