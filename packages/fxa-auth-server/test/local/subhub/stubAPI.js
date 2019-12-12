/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { mockLog } = require('../../mocks');
const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  subhub: {
    enabled: true,
    url: 'https://foo.bar',
    key: 'foo',
  },
};

const subhubApiClient = require('../../../lib/subhub/client').client(
  mockLog,
  mockConfig
);
const subhubStubApi = require('../../../lib/subhub/stubAPI').buildStubAPI(
  mockLog,
  mockConfig
);

describe('subhub stub api', () => {
  it('should have the same interface as the actual SubHub client', () => {
    const clientProps = Object.keys(subhubApiClient);
    const stubProps = Object.keys(subhubStubApi);
    const diff = clientProps.filter(x => !stubProps.includes(x));

    assert.equal(
      diff.length,
      0,
      `Stub SubHub API is missing the following functions: ${diff.join(', ')}`
    );
  });
});
