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
  hex,
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

    // Detailed deduplication tests for the Buffer comparison bug fix
    describe('deduplication', () => {
      // Helper to create Buffer IDs
      const bufferFromHex = (hexStr: string) => Buffer.from(hexStr, 'hex');

      // Test device IDs
      const deviceId1 = bufferFromHex('d1000000000000000000000000000001');
      const deviceId2 = bufferFromHex('d2000000000000000000000000000002');

      // Test session IDs (strings)
      const sessionId1 = 's1000000000000000000000000000001';
      const sessionId2 = 's2000000000000000000000000000002';
      const sessionId3 = 's3000000000000000000000000000003';

      // Test OAuth refresh token IDs (strings)
      const refreshTokenId1 = 'oauth1000000000000000000000000001';

      describe('mergeDevices()', () => {
        it('should deduplicate devices with same Buffer reference', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox on Windows',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
            },
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox on Windows',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2500000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
            },
            {
              id: deviceId2,
              sessionTokenId: sessionId2,
              refreshTokenId: null,
              name: 'Firefox on Mac',
              type: 'desktop',
              createdAt: 1100000,
              lastAccessTime: 2200000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'San Francisco', country: 'USA' },
            },
          ];

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices as any,
            oauthClients: async () => [],
            sessions: async () => [],
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 2);
          const device1Client = clients.find(
            (c) => hex(c.deviceId) === hex(deviceId1)
          );
          assert.equal(device1Client!.lastAccessTime, 2500000);
        });

        it('should deduplicate devices with DIFFERENT Buffer instances (real MySQL behavior)', async () => {
          const deviceIdBytes = 'd1000000000000000000000000000001';
          const mockDevices = [
            {
              id: Buffer.from(deviceIdBytes, 'hex'),
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox on Windows',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
            },
            {
              id: Buffer.from(deviceIdBytes, 'hex'),
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox on Windows',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2500000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
            },
          ];

          assert.notEqual(mockDevices[0].id, mockDevices[1].id);
          assert.equal(
            mockDevices[0].id.toString('hex'),
            mockDevices[1].id.toString('hex')
          );

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices as any,
            oauthClients: async () => [],
            sessions: async () => [],
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].lastAccessTime, 2500000);
          assert.equal(hex(clients[0].deviceId), deviceIdBytes);
        });

        it('should skip devices without IDs', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Valid Device',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
            },
            {
              id: null,
              sessionTokenId: sessionId2,
              refreshTokenId: null,
              name: 'Invalid Device',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
            },
          ] as any;

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices,
            oauthClients: async () => [],
            sessions: async () => [],
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(hex(clients[0].deviceId), hex(deviceId1));
        });

        it('should merge device data across multiple rows', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: { city: 'Toronto', country: 'Canada' },
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
            },
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2500000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
              uaBrowser: null,
              uaOS: null,
            },
          ];

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices as any,
            oauthClients: async () => [],
            sessions: async () => [],
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].lastAccessTime, 2500000);
          // Devices don't populate os/userAgent - only sessions do that
          // So without session data, os will be null and userAgent will be empty string
          assert.isNull(clients[0].os);
          assert.equal(clients[0].userAgent, '');
        });
      });

      describe('mergeSessions()', () => {
        it('should deduplicate sessions with same sessionId', async () => {
          const mockSessions = [
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2000000,
              location: { city: 'Toronto', country: 'Canada' },
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
              uaBrowserVersion: '100',
              uaOSVersion: '10',
              uaFormFactor: 'desktop',
            },
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2500000,
              location: {},
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
              uaBrowserVersion: '100',
              uaOSVersion: '10',
              uaFormFactor: 'desktop',
            },
          ];

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => [],
            oauthClients: async () => [],
            sessions: async () => mockSessions as any,
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].lastAccessTime, 2500000);
        });

        it('should skip sessions without IDs', async () => {
          const mockSessions = [
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2000000,
              location: { city: 'Toronto', country: 'Canada' },
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
              uaBrowserVersion: '100',
              uaOSVersion: '10',
              uaFormFactor: 'desktop',
            },
            {
              id: null,
              createdAt: 1000000,
              lastAccessTime: 2000000,
              location: {},
              uaBrowser: 'Chrome',
              uaOS: 'Mac',
              uaBrowserVersion: '90',
              uaOSVersion: '11',
              uaFormFactor: 'desktop',
            },
          ] as any;

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => [],
            oauthClients: async () => [],
            sessions: async () => mockSessions,
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].sessionTokenId, sessionId1);
        });

        it('should enrich existing device clients with session data', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Firefox',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
            },
          ];

          const mockSessions = [
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2500000,
              location: { city: 'Toronto', country: 'Canada' },
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
              uaBrowserVersion: '100',
              uaOSVersion: '10',
              uaFormFactor: 'desktop',
            },
          ];

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices as any,
            oauthClients: async () => [],
            sessions: async () => mockSessions as any,
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          // Factory formats userAgent as "Browser MajorVersion" when version is present
          assert.equal(clients[0].os, 'Windows');
          assert.equal(clients[0].userAgent, 'Firefox 100');
        });
      });

      describe('mergeOauthClients()', () => {
        it('should skip OAuth clients without refresh_token_id', async () => {
          const mockOAuthClients = [
            {
              refresh_token_id: refreshTokenId1,
              client_id: 'oauth-client-1',
              created_time: 1000000,
              last_access_time: 2000000,
              scope: ['profile', 'openid'],
            },
            {
              refresh_token_id: null,
              client_id: 'oauth-client-2',
              created_time: 1000000,
              last_access_time: 2000000,
              scope: ['profile'],
            },
          ] as any;

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => [],
            oauthClients: async () => mockOAuthClients,
            sessions: async () => [],
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].refreshTokenId, refreshTokenId1);
        });

        it('should enrich device with OAuth client data', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: refreshTokenId1,
              name: 'Firefox',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
            },
          ];

          const mockOAuthClients = [
            {
              refresh_token_id: refreshTokenId1,
              client_id: 'oauth-client-1',
              created_time: 1000000,
              last_access_time: 2500000,
              scope: ['profile', 'openid'],
              name: 'Firefox Sync',
            },
          ];

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices as any,
            oauthClients: async () => mockOAuthClients as any,
            sessions: async () => [],
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].clientId, 'oauth-client-1');
        });
      });

      describe('integration scenarios', () => {
        it('should handle complex scenario with all duplicate types', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: refreshTokenId1,
              name: 'Firefox',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
            },
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: refreshTokenId1,
              name: 'Firefox',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2500000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
            },
          ];

          const mockSessions = [
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2600000,
              location: { city: 'Toronto', country: 'Canada' },
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
              uaBrowserVersion: '100',
              uaOSVersion: '10',
              uaFormFactor: 'desktop',
            },
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2700000,
              location: {},
              uaBrowser: null,
              uaOS: null,
              uaBrowserVersion: null,
              uaOSVersion: null,
              uaFormFactor: null,
            },
          ];

          const mockOAuthClients = [
            {
              refresh_token_id: refreshTokenId1,
              client_id: 'oauth-client-1',
              created_time: 1000000,
              last_access_time: 2800000,
              scope: ['profile'],
              name: 'Firefox Sync',
            },
          ];

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices as any,
            oauthClients: async () => mockOAuthClients as any,
            sessions: async () => mockSessions as any,
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 1);
          assert.equal(clients[0].lastAccessTime, 2800000);
          // Factory formats userAgent as "Browser MajorVersion" when version is present
          assert.equal(clients[0].os, 'Windows');
          assert.equal(clients[0].userAgent, 'Firefox 100');
        });

        it('should handle mixed valid and invalid records', async () => {
          const mockDevices = [
            {
              id: deviceId1,
              sessionTokenId: sessionId1,
              refreshTokenId: null,
              name: 'Valid Device',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
            },
            {
              id: null,
              sessionTokenId: sessionId2,
              refreshTokenId: null,
              name: 'Invalid Device',
              type: 'desktop',
              createdAt: 1000000,
              lastAccessTime: 2000000,
              pushEndpointExpired: false,
              availableCommands: {},
              location: {},
            },
          ] as any;

          const mockSessions = [
            {
              id: sessionId1,
              createdAt: 1000000,
              lastAccessTime: 2000000,
              location: {},
              uaBrowser: 'Firefox',
              uaOS: 'Windows',
              uaBrowserVersion: '100',
              uaOSVersion: '10',
              uaFormFactor: 'desktop',
            },
            {
              id: null,
              createdAt: 1000000,
              lastAccessTime: 2000000,
              location: {},
              uaBrowser: 'Chrome',
              uaOS: 'Mac',
              uaBrowserVersion: '90',
              uaOSVersion: '11',
              uaFormFactor: 'desktop',
            },
            {
              id: sessionId3,
              createdAt: 1000000,
              lastAccessTime: 2000000,
              location: {},
              uaBrowser: 'Safari',
              uaOS: 'iOS',
              uaBrowserVersion: '14',
              uaOSVersion: '14',
              uaFormFactor: 'mobile',
            },
          ] as any;

          const mockOAuthClients = [
            {
              refresh_token_id: refreshTokenId1,
              client_id: 'oauth-client-1',
              created_time: 1000000,
              last_access_time: 2000000,
              scope: ['profile'],
            },
            {
              refresh_token_id: null,
              client_id: 'oauth-client-2',
              created_time: 1000000,
              last_access_time: 2000000,
              scope: ['profile'],
            },
          ] as any;

          const factory = new ConnectedServicesFactory({
            formatTimestamps: () => {},
            formatLocation: () => {},
            deviceList: async () => mockDevices,
            oauthClients: async () => mockOAuthClients,
            sessions: async () => mockSessions,
          });

          const clients = await factory.build('', 'en');

          assert.equal(clients.length, 3);
        });
      });
    });
  });
});
