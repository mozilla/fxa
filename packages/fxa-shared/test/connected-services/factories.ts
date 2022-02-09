/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { assert } from 'chai';
import Sinon, { SinonSpiedInstance } from 'sinon';

import {
  AttachedDevice,
  AttachedOAuthClient,
  AttachedSession,
  AuthorizedClientsFactory,
  ConnectedServicesFactory,
  IAuthorizedClientsBindings,
  IConnectedServicesFactoryBindings,
} from '../../connected-services';

describe('connected-services/factories', () => {
  describe('authorized clients', () => {
    class Bindings implements IAuthorizedClientsBindings {
      async getRefreshTokensByUid(uid: string) {
        return refreshTokens;
      }
      async getAccessTokensByUid(uid: string) {
        return accessTokens;
      }
    }

    let refreshTokens: any[] = [];
    let accessTokens: any[] = [];
    let bindings: Bindings;
    let bStubbed: SinonSpiedInstance<Bindings>;
    let factory: AuthorizedClientsFactory;

    const defaultToken = {
      clientId: '1234',
      clientName: 'test',
      createdAt: new Date(Date.now() - 1e4),
      lastUsedAt: new Date(Date.now() - 1e4),
    };
    const defaultRefreshToken = {
      ...defaultToken,
      scope: {
        getScopeValues() {
          return ['s1'];
        },
      },
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
    const defaultAccessToken = {
      ...defaultToken,
    };

    beforeEach(() => {
      refreshTokens = [];
      accessTokens = [];
      bindings = new Bindings();
      bStubbed = Sinon.spy(bindings);
      factory = new AuthorizedClientsFactory(bindings);
      refreshTokens.push({ ...defaultRefreshToken });
      accessTokens.push({ ...defaultAccessToken });
    });

    it('invokes bindings', async () => {
      const results = await factory.build('test');

      assert.exists(results);
      Sinon.assert.calledOnce(bStubbed.getAccessTokensByUid);
      Sinon.assert.calledOnce(bStubbed.getRefreshTokensByUid);
    });

    it('builds authorized clients with overlapping client names', async () => {
      const results = await factory.build('test');

      assert.lengthOf(results, 1);
    });

    it('updates timestamps', async () => {
      const results = await factory.build('test');

      assert.equal(
        results[0].last_access_time,
        refreshTokens[0].lastUsedAt.getTime()
      );
      assert.equal(
        results[0].created_time,
        refreshTokens[0].createdAt.getTime()
      );
    });

    it('builds authorized clients with differing client names', async () => {
      accessTokens[0].clientId = 'abcd';
      const results = await factory.build('test');

      assert.lengthOf(results, 2);
    });

    it('it ingores can grant tokens', async () => {
      accessTokens[0].clientId = 'abcd';
      accessTokens[0].clientCanGrant = true;
      const results = await factory.build('test');

      assert.lengthOf(results, 1);
    });
  });

  describe('connected services', () => {
    class Bindings implements IConnectedServicesFactoryBindings {
      formatLocation() {}
      formatTimestamps() {}
      async deviceList() {
        return deviceList;
      }
      async oauthClients() {
        return oauthClients;
      }
      async sessions() {
        return sessions;
      }
    }

    let deviceList: AttachedDevice[];
    let oauthClients: AttachedOAuthClient[];
    let sessions: AttachedSession[];
    let bindings = new Bindings();
    let bStubbed: SinonSpiedInstance<Bindings>;
    let factory: ConnectedServicesFactory;

    beforeEach(() => {
      deviceList = [
        {
          id: 'test',
          sessionTokenId: 'test',
          refreshTokenId: 'test',
          location: {},
        } as AttachedDevice,
      ];
      oauthClients = [
        {
          refresh_token_id: 'test',
          created_time: Date.now(),
          last_access_time: Date.now(),
        } as AttachedOAuthClient,
      ];
      sessions = [
        {
          id: 'test',
          createdAt: Date.now(),
          lastAccessTime: Date.now(),
          location: {},
          uaBrowser: 'test',
          uaOS: 'test',
          uaBrowserVersion: 'test',
          uaOSVersion: 'test',
          uaFormFactor: 'test',
        } as AttachedSession,
      ];
      bindings = new Bindings();
      bStubbed = Sinon.spy(bindings);
      factory = new ConnectedServicesFactory(bindings);
    });

    it('invokes bindings', async () => {
      const results = await factory.build('1234', 'en');

      assert.exists(results);
      Sinon.assert.calledOnce(bStubbed.deviceList);
      Sinon.assert.calledOnce(bStubbed.oauthClients);
      Sinon.assert.calledOnce(bStubbed.sessions);
    });

    it('builds ConnectedServicesFactory with overlapping tokens', async () => {
      const results = await factory.build('1234', 'en');
      assert.lengthOf(results, 1);
    });

    it('builds ConnectedServicesFactory with differing tokens', async () => {
      sessions[0].id = 'test1';
      oauthClients[0].refresh_token_id = 'test2';
      const results = await factory.build('1234', 'en');
      assert.lengthOf(results, 3);
    });

    it('builds ConnectedServicesFactory with overlapping tokens', async () => {
      const bindings = new Bindings();
      let bStubbed = Sinon.spy(bindings);
      const factory = new ConnectedServicesFactory(bindings);

      const results = await factory.build('1234', 'en');

      assert.lengthOf(results, 1);
      Sinon.assert.calledOnce(bStubbed.deviceList);
      Sinon.assert.calledOnce(bStubbed.oauthClients);
      Sinon.assert.calledOnce(bStubbed.sessions);
    });
  });
});
