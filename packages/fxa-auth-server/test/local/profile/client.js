/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');

// Common prefix for all API URL paths
const PATH_PREFIX = '/v1';
const error = require('../../../lib/error.js');

const Profile = require('../../../lib/profile/client');

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
  let profile;

  const log = {
    trace: () => {},
    activityEvent: () => {},
    error() {},
  };

  beforeEach(() => {
    profile = new Profile(log, mockConfig, error, {});
  });

  afterEach(() => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
  });

  describe('makeRequest', () => {
    it('should make a generic request', async () => {
      const method = 'post';
      const endpoint = `${PATH_PREFIX}/testEndpoint`;
      const requestData = { data: 'test' };
      mockServer[method](endpoint).reply(200, {});

      const result = await profile.makeRequest(endpoint, requestData, method);
      assert.deepEqual(result, {});
    });

    it('should handle request 5XX errors', async () => {
      const method = 'post';
      const endpoint = `${PATH_PREFIX}/testEndpoint`;
      const requestData = { data: 'test' };
      mockServer[method](endpoint).reply(500, {});

      try {
        await profile.makeRequest(endpoint, requestData, method);
        assert.fail('Expected error was not thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }
    });

    it('should handle request 4XX errors', async () => {
      const method = 'post';
      const endpoint = `${PATH_PREFIX}/testEndpoint`;
      const requestData = { data: 'test' };
      mockServer[method](endpoint).reply(403, {});

      try {
        await profile.makeRequest(endpoint, requestData, method);
        assert.fail('Expected error was not thrown');
      } catch (err) {
        assert.equal(err.response.status, 403);
        assert.isTrue(err.isAxiosError);
      }
    });
  });

  describe('deleteCache', () => {
    it('makes a DELETE request to the cache invalidation resource', async () => {
      const uid = '8675309uid';
      const expected = {};
      mockServer.delete(`${PATH_PREFIX}/cache/${uid}`).reply(200, expected);
      const result = await profile.deleteCache(uid);
      assert.deepEqual(result, expected);
    });
  });

  describe('updateDisplayName', () => {
    it('makes a POST request to update user display name', async () => {
      const uid = '8675309uid';
      const expected = {};
      mockServer
        .post(`${PATH_PREFIX}/_display_name/${uid}`)
        .reply(200, expected);
      const result = await profile.updateDisplayName(uid, 'kobe bryant');
      assert.deepEqual(result, expected);
    });
  });
});
