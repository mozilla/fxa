/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import ScopeSet from '../oauth/scopes';
import { IClientFormatter } from './formatters';
import {
  AttachedClient,
  attachedClientsDefaults,
} from './models/AttachedClient';
import { AttachedDevice } from './models/AttachedDevice';
import { AttachedOAuthClient } from './models/AttachedOAuthClient';
import { AttachedSession } from './models/AttachedSession';
import { SerializableAttachedClient } from './models/SerializableAttachedClient';
import { hex, serialize, synthesizeClientName } from './util';

/**
 * Bindings for authorized client factory. Provides access to
 * access and refresh token for a targeted account via the uid.
 */
export interface IAuthorizedClientsBindings {
  getRefreshTokensByUid(uid: string): any;
  getAccessTokensByUid(uid: string): any;
}

/**
 * Builds a list of serializable authorized clients based on account UID.
 */
export class AuthorizedClientsFactory {
  /**
   * Creates new instance
   * @param bindings Callbacks for attaching to greater context
   */
  constructor(protected readonly bindings: IAuthorizedClientsBindings) {}

  /**
   * Creates a list of authorized clients
   * @param uid a unique identifier, probably the account uid.
   * @returns A list of serialable attached client objects
   */
  async build(uid: string): Promise<SerializableAttachedClient[]> {
    const authorizedClients: SerializableAttachedClient[] = [];

    // First, enumerate all the refresh tokens.
    // Each of these is a separate instance of an authorized client
    // and should be displayed to the user as such. Nice and simple!
    const seenClientIds = new Set();
    for (const token of await this.bindings.getRefreshTokensByUid(uid)) {
      const clientId = hex(token.clientId);
      authorizedClients.push(serialize(clientId, token));
      seenClientIds.add(clientId);
    }

    // Next, enumerate all the access tokens. In the interests of giving the user a
    // complete-yet-comprehensible list of all the things attached to their account,
    // we want to:
    //
    //  1. Show a single unified record for any client that is not using refresh tokens.
    //  2. Avoid showing access tokens for `canGrant` clients; such clients will always
    //     hold some other sort of token, and we don't want them to appear in the list twice.
    const accessTokenRecordsByClientId = new Map();
    for (const token of await this.bindings.getAccessTokensByUid(uid)) {
      const clientId = hex(token.clientId);
      if (!seenClientIds.has(clientId) && !token.clientCanGrant) {
        let record = accessTokenRecordsByClientId.get(clientId);
        if (typeof record === 'undefined') {
          record = {
            clientId,
            clientName: token.clientName,
            createdAt: token.createdAt,
            lastUsedAt: token.createdAt,
            scope: ScopeSet.fromArray([]),
          };
          accessTokenRecordsByClientId.set(clientId, record);
        }
        // Merge details of all access tokens into a single record.
        record.scope.add(token.scope);
        if (token.createdAt < record.createdAt) {
          record.createdAt = token.createdAt;
        }
        if (record.lastUsedAt < token.createdAt) {
          record.lastUsedAt = token.createdAt;
        }
      }
    }
    for (const [clientId, record] of accessTokenRecordsByClientId.entries()) {
      authorizedClients.push(serialize(clientId, record));
    }

    // Sort the final list first by last_access_time, then by client_name, then by created_time.
    authorizedClients.sort(function (a, b) {
      if (b.last_access_time > a.last_access_time) {
        return 1;
      }
      if (b.last_access_time < a.last_access_time) {
        return -1;
      }
      if (a.client_name > b.client_name) {
        return 1;
      }
      if (a.client_name < b.client_name) {
        return -1;
      }
      if (a.created_time > b.created_time) {
        return 1;
      }
      if (a.created_time < b.created_time) {
        return -1;
      }
      // To help provide a deterministic result order to simplify testing, also sort of scope values.
      if (a.scope > b.scope) {
        return 1;
      }
      if (a.scope < b.scope) {
        return -1;
      }
      return 0;
    });
    return authorizedClients;
  }
}

/**
 * Bindings for the connected services factor. Provides access to the
 * deviceList, oauthClients, and sessions of the current context.
 */
export interface IConnectedServicesFactoryBindings extends IClientFormatter {
  deviceList: () => Promise<AttachedDevice[]>;
  oauthClients: () => Promise<AttachedOAuthClient[]>;
  sessions: () => Promise<AttachedSession[]>;
}

/**
 * Merges connected services into unified list of 'Attached Clients'
 */
export class ConnectedServicesFactory {
  protected clientsBySessionTokenId = new Map<string, AttachedClient>();
  protected clientsByRefreshTokenId = new Map<string, AttachedClient>();
  protected clientsByDeviceId = new Map<string, AttachedClient>();
  protected attachedClients: AttachedClient[] = [];

  constructor(protected readonly bindings: IConnectedServicesFactoryBindings) {}

  protected init() {
    this.attachedClients = [];
    this.clientsBySessionTokenId = new Map<string, AttachedClient>();
    this.clientsByRefreshTokenId = new Map<string, AttachedClient>();
    this.clientsByDeviceId = new Map<string, AttachedClient>();
  }

  /**
   * Provides a list of all connected services
   * @param sessionTokenId
   * @param acceptLanguage
   * @returns
   */
  public async build(
    sessionTokenId: string,
    acceptLanguage: string
  ): Promise<AttachedClient[]> {
    this.init();

    await this.mergeDevices();
    await this.mergeOauthClients();
    await this.mergeSessions(sessionTokenId);

    // Now we can do some final tweaks of each item for display.
    for (const client of this.attachedClients) {
      this.bindings.formatTimestamps(client, { app: { acceptLanguage } });
      this.bindings.formatLocation(client, { app: { acceptLanguage } });
      if (client.deviceId && !client.deviceType) {
        client.deviceType = 'desktop';
      }
      if (client.name) {
        client.name = client.name.replace('Mac OS X', 'macOS');
      }
    }

    return this.attachedClients;
  }

  protected async mergeSessions(sessionTokenId: string) {
    for (const session of await this.bindings.sessions()) {
      if (!session.id) {
        // on the off chance a session without an ID is returned, skip it.
        continue;
      }

      let client = this.clientsBySessionTokenId.get(session.id);
      if (!client) {
        client = {
          ...this.getDefaultClientFields(),
          sessionTokenId: session.id,
          createdTime: session.createdAt,
        };
        this.attachedClients.push(client);

        this.clientsBySessionTokenId.set(session.id, client);
      } else {
        if (!client.sessionTokenId) {
          client.sessionTokenId = session.id;
        }
        if (!this.clientsBySessionTokenId.has(session.id)) {
          this.clientsBySessionTokenId.set(session.id, client);
        }
      }

      client.createdTime = Math.min(
        client.createdTime || Number.POSITIVE_INFINITY,
        session.createdAt
      );

      client.lastAccessTime = Math.max(
        client.lastAccessTime || 0,
        session.lastAccessTime
      );

      client.isCurrentSession = client.sessionTokenId === sessionTokenId;

      // Any client holding a sessionToken can grant themselves any scope.
      client.scope = null;

      // Location, OS and UA are currently only available on sessionTokens, so we can
      // copy across without worrying about merging with data from the device record.
      // Only update if the session has the data (to avoid overwriting with empty values from duplicate rows)
      if (session.location) {
        client.location = { ...session.location };
      }
      if (session.uaOS) {
        client.os = session.uaOS;
      }

      // Only set userAgent if session has browser info
      if (session.uaBrowser) {
        if (!session.uaBrowserVersion) {
          client.userAgent = session.uaBrowser;
        } else {
          const { uaBrowser: browser, uaBrowserVersion: version } = session;
          client.userAgent = `${browser} ${version.split('.')[0]}`;
        }
      } else if (!client.userAgent) {
        // Only set empty if client doesn't already have a userAgent
        client.userAgent = '';
      }

      if (!client.name) {
        client.name = synthesizeClientName(session);
      }
    }
  }

  protected async mergeOauthClients() {
    for (const oauthClient of await this.bindings.oauthClients()) {
      if (!oauthClient.refresh_token_id) {
        continue;
      }
      let client = this.clientsByRefreshTokenId.get(
        oauthClient.refresh_token_id
      );
      if (client) {
        client.refreshTokenId = oauthClient.refresh_token_id;
      } else {
        client = {
          ...this.getDefaultClientFields(),
          refreshTokenId: oauthClient.refresh_token_id || null,
          createdTime: oauthClient.created_time,
          lastAccessTime: oauthClient.last_access_time,
        };
        this.attachedClients.push(client);
        this.clientsByRefreshTokenId.set(oauthClient.refresh_token_id, client);
      }

      client.clientId = oauthClient.client_id;
      client.scope = oauthClient.scope;
      client.createdTime = Math.min(
        client.createdTime || Number.POSITIVE_INFINITY,
        oauthClient.created_time
      );
      client.lastAccessTime = Math.max(
        client.lastAccessTime || 0,
        oauthClient.last_access_time
      );
      // We fill in a default device name from the OAuth client name,
      // but individual clients can override this in their device record registration.
      if (!client.name) {
        client.name = oauthClient.client_name;
      }
      // For now we assume that all oauth clients that register a device record are mobile apps.
      // Ref https://github.com/mozilla/fxa/issues/449
      if (client.deviceId && !client.deviceType) {
        client.deviceType = 'mobile';
      }
    }
  }

  protected async mergeDevices() {
    for (const device of await this.bindings.deviceList()) {
      if (!device.id) {
        // on the off chance a device without an ID is returned, skip it.
        continue;
      }

      // Since the device record is returned via the accountDevices_17 stored procedure,
      // the device.id is a Buffer object. We need to convert it to a hex string for the Map key.
      const deviceIdHex = hex(device.id);
      const client = this.clientsByDeviceId.get(deviceIdHex);

      if (!client) {
        const client: AttachedClient = {
          ...this.getDefaultClientFields(),
          sessionTokenId: device.sessionTokenId || null,
          // The refreshTokenId might be a dangling pointer, don't set it
          // until we know whether the corresponding token exists in the OAuth db.
          refreshTokenId: null,
          deviceId: device.id,
          deviceType: device.type,
          name: device.name,
          createdTime: device.createdAt,
          lastAccessTime: device.lastAccessTime,
        };
        this.attachedClients.push(client);

        this.clientsByDeviceId.set(deviceIdHex, client);

        if (device.sessionTokenId) {
          this.clientsBySessionTokenId.set(device.sessionTokenId, client);
        }
        if (device.refreshTokenId) {
          this.clientsByRefreshTokenId.set(device.refreshTokenId, client);
        }
      } else {
        // otherwise, we have record of the client for this device and we
        // can update the client with the new information.
        if (device.sessionTokenId) {
          client.sessionTokenId = device.sessionTokenId;
          this.clientsBySessionTokenId.set(device.sessionTokenId, client);
        }
        if (device.refreshTokenId) {
          client.refreshTokenId = device.refreshTokenId;
          this.clientsByRefreshTokenId.set(device.refreshTokenId, client);
        }
        client.createdTime = Math.min(
          client.createdTime || Number.POSITIVE_INFINITY,
          device.createdAt || Number.POSITIVE_INFINITY
        );
        client.lastAccessTime = Math.max(
          client.lastAccessTime || 0,
          device.lastAccessTime || 0
        );
      }
      ``;
    }
  }

  protected getDefaultClientFields(): AttachedClient {
    return attachedClientsDefaults;
  }
}
