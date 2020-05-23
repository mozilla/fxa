/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { DataSourceConfig } from 'apollo-datasource';
import { assert } from 'chai';
import nock from 'nock';
import sinon, { stubInterface } from 'ts-sinon';
import { Container } from 'typedi';

import {
  configContainerToken,
  fxAccountClientToken,
} from '../../../lib/constants';
import { ProfileServerSource } from '../../../lib/datasources/profileServer';
import { Context } from '../../../lib/server';
import { mockContext } from '../mocks';

const sandbox = sinon.createSandbox();

describe('ProfileServerSource', () => {
  let authClient: any;
  let context;
  let profileSource: ProfileServerSource;

  beforeEach(() => {
    sandbox.resetBehavior();
    sandbox.resetHistory();
    authClient = {
      createOAuthToken: sandbox.stub(),
    };
    const config = {
      getProperties: sinon.stub().returns({
        oauth: {
          clientId: 'testClient',
        },
        profileServer: {
          url: 'localhost',
        },
      }),
    };
    Container.set(fxAccountClientToken, authClient);
    Container.set(configContainerToken, config);
    context = mockContext();
    profileSource = new ProfileServerSource();
    const pluginConfig = stubInterface<DataSourceConfig<Context>>();
    pluginConfig.context = context;
    profileSource.initialize(pluginConfig);
  });

  describe('fetchToken', () => {
    it('uses existing oauth token if set', async () => {
      (profileSource as any).oauthToken = 'test';
      const result = await (profileSource as any).fetchToken();
      assert.equal(result, 'test');
    });

    it('calls auth server to create a token', async () => {
      authClient.createOAuthToken.resolves({ access_token: 'testToken' });
      const result = await (profileSource as any).fetchToken();
      assert.equal(result, 'testToken');
    });
  });

  describe('profilePostRequest', () => {
    it('returns data', async () => {
      (profileSource as any).oauthToken = 'test';
      nock('http://localhost')
        .post('/test')
        .reply(200, { testkey: 'testvalue' });
      const result = await (profileSource as any).profilePostRequest(
        '/test',
        {}
      );
      assert.deepEqual(result.body, { testkey: 'testvalue' });
    });
  });

  describe('updateDisplayName', () => {
    it('updates the display name', async () => {
      (profileSource as any).oauthToken = 'test';
      nock('http://localhost').post('/display_name').reply(200, {});
      const result = await profileSource.updateDisplayName('george');
      assert.isTrue(result);
    });
  });

  describe('avatarUpload', () => {
    it('uploads', async () => {
      (profileSource as any).oauthToken = 'test';
      nock('http://localhost')
        .post('/avatar/upload')
        .reply(200, { url: 'testurl' });
      const result = await profileSource.avatarUpload('image/png', 'data');
      assert.equal(result, 'testurl');
    });
  });
});
