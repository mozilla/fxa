/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const ScopeSet = require('../../../../fxa-shared').oauth.scopes;
const helpers = require('../../../lib/oauth/db/helpers');
const unique = require('../../../lib/oauth/unique');

describe('aggregateActiveClients', function() {
  var uid;
  var activeClientTokens;
  beforeEach(function() {
    uid = unique(16).toString('hex');

    activeClientTokens = [
      {
        id: uid,
        createdAt: '2017-01-26T14:28:16.219Z',
        name: '123Done',
        scope: ScopeSet.fromArray(['basket', 'profile:write']),
      },
      {
        id: uid,
        createdAt: '2017-01-27T14:28:16.219Z',
        name: '123Done',
        scope: ScopeSet.fromArray(['clients:write']),
      },
      {
        id: uid,
        createdAt: '2017-01-28T14:28:16.219Z',
        name: '123Done',
        scope: ScopeSet.fromArray(['profile']),
      },
    ];
  });

  it('returns union of sorted scopes, and latest createdAt as last access time', function() {
    var res = helpers.aggregateActiveClients(activeClientTokens);
    assert.equal(res[0].id, uid);
    assert.equal(res[0].name, '123Done');
    assert.deepEqual(res[0].scope, [
      'basket',
      'clients:write',
      'profile:write',
    ]);
    assert.equal(res[0].lastAccessTime, '2017-01-28T14:28:16.219Z');
  });
});
