/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const avatarShared = require('../../../lib/routes/avatar/_shared');
const config = require('../../../lib/config').getProperties();

/*global describe,it,beforeEach*/
describe('routes/avatar/_shared', function() {
  describe('fxaUrl', function() {
    it('creates a proper avatarUrl', function() {
      const id = 'foo';
      assert.equal(avatarShared.fxaUrl(id), config.img.url.replace('{id}', id));
    });
  });
});
