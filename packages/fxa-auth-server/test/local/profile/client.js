/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const { mockLog } = require('../../mocks');
const proxyquire = require('proxyquire');

// Common prefix for all API URL paths
const PATH_PREFIX = '/v1';

const profileModule = proxyquire('../../../lib/profile/client', {});

const mockConfig = {
  profileServer: {
    url: 'https://foo.bar',
    secretBearerToken: 'foo',
  },
};

const mockServer = nock(mockConfig.profileServer.url, {
  reqheaders: {
    Authorization: `Bearer ${mockConfig.profileServer.secretBearerToken}`,
  },
}).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

describe('profile-server client', () => {
  const makeSubject = (profileConfig = {}) => {
    const log = mockLog();
    const profile = profileModule(log, {
      ...mockConfig,
      profileServer: {
        ...mockConfig.profileServer,
        ...profileConfig,
      },
    });
    return { log, profile };
  };

  afterEach(() => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
  });

  describe('deleteCache', () => {
    it('makes a DELETE request to the cache invalidation resource', async () => {
      const uid = '8675309uid';
      const expected = {};
      mockServer.delete(`${PATH_PREFIX}/cache/${uid}`).reply(200, expected);
      const { profile } = makeSubject();
      const result = await profile.deleteCache(uid);
      assert.deepEqual(result, expected);
    });
  });
});
