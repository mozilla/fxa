/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AuthorizedClientsFactory,
  ConnectedServicesFactory,
  IAuthorizedClientsBindings,
  IConnectedServicesFactoryBindings,
} from './factories';
import { AttachedDevice } from './models/AttachedDevice';
import { AttachedOAuthClient } from './models/AttachedOAuthClient';
import { AttachedSession } from './models/AttachedSession';

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
      jest.spyOn(bindings, 'getAccessTokensByUid');
      jest.spyOn(bindings, 'getRefreshTokensByUid');
      factory = new AuthorizedClientsFactory(bindings);
      refreshTokens.push({ ...defaultRefreshToken });
      accessTokens.push({ ...defaultAccessToken });
    });

    it('invokes bindings', async () => {
      const results = await factory.build('test');

      expect(results).toEqual(expect.anything());
      expect(bindings.getAccessTokensByUid).toHaveBeenCalledTimes(1);
      expect(bindings.getRefreshTokensByUid).toHaveBeenCalledTimes(1);
    });

    it('builds authorized clients with overlapping client names', async () => {
      const results = await factory.build('test');

      expect(results).toHaveLength(1);
    });

    it('updates timestamps', async () => {
      const results = await factory.build('test');

      expect(results[0].last_access_time).toBe(
        refreshTokens[0].lastUsedAt.getTime()
      );
      expect(results[0].created_time).toBe(
        refreshTokens[0].createdAt.getTime()
      );
    });

    it('builds authorized clients with differing client names', async () => {
      accessTokens[0].clientId = 'abcd';
      const results = await factory.build('test');

      expect(results).toHaveLength(2);
    });

    it('it ingores can grant tokens', async () => {
      accessTokens[0].clientId = 'abcd';
      accessTokens[0].clientCanGrant = true;
      const results = await factory.build('test');

      expect(results).toHaveLength(1);
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
      serializeSessionTokenId(sessionTokenId: string) {
        return `handle-${sessionTokenId}`;
      }
    }

    let deviceList: AttachedDevice[];
    let oauthClients: AttachedOAuthClient[];
    let sessions: AttachedSession[];
    let bindings = new Bindings();
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
      jest.spyOn(bindings, 'deviceList');
      jest.spyOn(bindings, 'oauthClients');
      jest.spyOn(bindings, 'sessions');
      jest.spyOn(bindings, 'serializeSessionTokenId');
      factory = new ConnectedServicesFactory(bindings);
    });

    it('invokes bindings', async () => {
      const results = await factory.build('1234', 'en');

      expect(results).toEqual(expect.anything());
      expect(bindings.deviceList).toHaveBeenCalledTimes(1);
      expect(bindings.oauthClients).toHaveBeenCalledTimes(1);
      expect(bindings.sessions).toHaveBeenCalledTimes(1);
    });

    it('builds ConnectedServicesFactory with overlapping tokens', async () => {
      const results = await factory.build('1234', 'en');
      expect(results).toHaveLength(1);
    });

    it('builds ConnectedServicesFactory with differing tokens', async () => {
      sessions[0].id = 'test1';
      oauthClients[0].refresh_token_id = 'test2';
      const results = await factory.build('1234', 'en');
      expect(results).toHaveLength(3);
    });

    it('opaques the raw sessionTokenId via serializeSessionTokenId', async () => {
      const results = await factory.build('1234', 'en');

      expect(results[0].sessionTokenId).toBe('handle-test');
      expect(bindings.serializeSessionTokenId).toHaveBeenCalledWith('test');
    });

    it('builds ConnectedServicesFactory with overlapping tokens', async () => {
      const bindings = new Bindings();
      jest.spyOn(bindings, 'deviceList');
      jest.spyOn(bindings, 'oauthClients');
      jest.spyOn(bindings, 'sessions');
      const factory = new ConnectedServicesFactory(bindings);

      const results = await factory.build('1234', 'en');

      expect(results).toHaveLength(1);
      expect(bindings.deviceList).toHaveBeenCalledTimes(1);
      expect(bindings.oauthClients).toHaveBeenCalledTimes(1);
      expect(bindings.sessions).toHaveBeenCalledTimes(1);
    });

    it('coerces undefined device name to null', async () => {
      deviceList = [
        {
          id: 'test-device',
          sessionTokenId: 'test',
          name: undefined as any, // Simulate undefined from database
          pushEndpointExpired: false,
          availableCommands: {},
          location: {},
        } as AttachedDevice,
      ];
      oauthClients = [];
      sessions = [];

      const results = await factory.build('1234', 'en');

      expect(results[0].name).toBe(null);
    });

    it('coerces undefined client_name to null', async () => {
      oauthClients = [
        {
          refresh_token_id: 'test-oauth',
          created_time: Date.now(),
          last_access_time: Date.now(),
          client_name: undefined as any, // Simulate undefined from database
          client_id: null as any,
          scope: null as any,
        } as AttachedOAuthClient,
      ];
      deviceList = [];
      sessions = [];

      const results = await factory.build('1234', 'en');

      // Verify name is null, not undefined (required for validation)
      expect(results[0].name).toBe(null);
    });
  });
});
