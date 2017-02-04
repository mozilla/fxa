/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const helpers = require('../../lib/db/helpers');
const unique = require('../../lib/unique');

describe('getActiveClientTokens', function() {
  var uid;
  var activeClientIds;
  beforeEach(function() {
    uid = unique(16).toString('hex');

    activeClientIds = [
      {
        id: uid,
        createdAt: '2017-01-26T14:28:16.219Z',
        name: '123Done',
        scope: ['profile', 'profile:write']
      },
      {
        id: uid,
        createdAt: '2017-01-27T14:28:16.219Z',
        name: '123Done',
        scope: ['clients:write']
      },
      {
        id: uid,
        createdAt: '2017-01-28T14:28:16.219Z',
        name: '123Done',
        scope: ['profile']
      }
    ];
  });

  it('returns union of sorted scopes and latest createdAt', function() {
    var res = helpers.getActiveClientTokens(activeClientIds);
    assert.equal(res[0].id, uid);
    assert.equal(res[0].name, '123Done');
    assert.deepEqual(res[0].scope, ['clients:write', 'profile', 'profile:write']);
    assert.equal(res[0].createdAt, '2017-01-28T14:28:16.219Z');
  });
});
