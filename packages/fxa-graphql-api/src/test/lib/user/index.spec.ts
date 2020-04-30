/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';
const sandbox = sinon.createSandbox();

import { configContainerToken, redisContainerToken } from '../../../lib/constants';
const mockConfig = {
  get: (k: string) => {
    return k === 'oauth.allowedClients' ? ['wibble'] : '';
  },
};
Container.set(configContainerToken, mockConfig);
const bearerToken = 'Bearer thisissomesecret';
const mockToken = { clientId: 'wibble', userId: '9001xyz', email: 'testo@example.com' };
const mockRedis = { get: sandbox.stub() };
Container.set(redisContainerToken, mockRedis);

import fetchUserByToken from '../../../lib/user';

describe('fetchUserByToken', () => {
  beforeEach(() => {
    sandbox.resetBehavior();
    sandbox.resetHistory();
    sandbox.restore();
  });

  it('should return null when token is not found', async () => {
    mockRedis.get.returns('');
    const acutal = await fetchUserByToken(bearerToken);
    assert.isNull(acutal);
  });

  it('should return null when the client is not in the allowed list', async () => {
    mockRedis.get.returns(JSON.stringify({ ...mockToken, clientId: 'nope' }));
    const acutal = await fetchUserByToken(bearerToken);
    assert.isNull(acutal);
  });

  it('should return an OAuthUser when token is found', async () => {
    mockRedis.get.returns(JSON.stringify(mockToken));
    const acutal = await fetchUserByToken(bearerToken);
    assert.deepEqual(acutal, { userId: mockToken.userId, email: mockToken.email });
  });
});
