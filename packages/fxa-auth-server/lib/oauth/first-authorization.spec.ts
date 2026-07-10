/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';

import {
  isFirstAuthorization,
  FirstAuthorizationDb,
} from './first-authorization';

const UID = 'a'.repeat(32);
const DESKTOP = OAuthNativeClients.FirefoxDesktop; // native
const WEB_RP = '98e6508e88680e1b'; // arbitrary non-native web RP (no enum)

function mockDb(
  overrides: Partial<jest.Mocked<FirstAuthorizationDb>> = {}
): jest.Mocked<FirstAuthorizationDb> {
  return {
    hasConsentForService: jest.fn().mockResolvedValue(false),
    hasConsentForClient: jest.fn().mockResolvedValue(false),
    ...overrides,
  };
}

describe('isFirstAuthorization', () => {
  describe('native (browser) client with a resolved service', () => {
    it('is true when the user has no prior consent for the service', async () => {
      const db = mockDb();
      await expect(
        isFirstAuthorization(db, {
          uid: UID,
          serviceValue: OAuthNativeServices.SmartWindow,
          clientIdHex: DESKTOP,
          isNativeClient: true,
        })
      ).resolves.toBe(true);
      expect(db.hasConsentForService).toHaveBeenCalledWith(
        UID,
        OAuthNativeServices.SmartWindow
      );
      expect(db.hasConsentForClient).not.toHaveBeenCalled();
    });

    it('is false when the user already has consent for the service', async () => {
      const db = mockDb({
        hasConsentForService: jest.fn().mockResolvedValue(true),
      });
      await expect(
        isFirstAuthorization(db, {
          uid: UID,
          serviceValue: OAuthNativeServices.Vpn,
          clientIdHex: DESKTOP,
          isNativeClient: true,
        })
      ).resolves.toBe(false);
    });

    it('is true on the first sync authorization (sync is included, though unreliable)', async () => {
      const db = mockDb();
      await expect(
        isFirstAuthorization(db, {
          uid: UID,
          serviceValue: OAuthNativeServices.Sync,
          clientIdHex: DESKTOP,
          isNativeClient: true,
        })
      ).resolves.toBe(true);
      expect(db.hasConsentForService).toHaveBeenCalledWith(
        UID,
        OAuthNativeServices.Sync
      );
    });
  });

  describe('web RP (non-native client)', () => {
    it('is true when the user has no prior consent for the client', async () => {
      const db = mockDb();
      await expect(
        isFirstAuthorization(db, {
          uid: UID,
          serviceValue: '',
          clientIdHex: WEB_RP,
          isNativeClient: false,
        })
      ).resolves.toBe(true);
      expect(db.hasConsentForClient).toHaveBeenCalledWith(UID, WEB_RP);
      expect(db.hasConsentForService).not.toHaveBeenCalled();
    });

    it('is false when the user already authorized the client', async () => {
      const db = mockDb({
        hasConsentForClient: jest.fn().mockResolvedValue(true),
      });
      await expect(
        isFirstAuthorization(db, {
          uid: UID,
          serviceValue: '',
          clientIdHex: WEB_RP,
          isNativeClient: false,
        })
      ).resolves.toBe(false);
    });

    it('ignores a service= sent by a web RP and keys on clientId (no spoofing a browser service)', async () => {
      const db = mockDb();
      await isFirstAuthorization(db, {
        uid: UID,
        serviceValue: OAuthNativeServices.Sync,
        clientIdHex: WEB_RP,
        isNativeClient: false,
      });
      expect(db.hasConsentForClient).toHaveBeenCalledWith(UID, WEB_RP);
      expect(db.hasConsentForService).not.toHaveBeenCalled();
    });
  });

  describe('native client with no resolved service', () => {
    it('is false without any DB query (ambiguous)', async () => {
      const db = mockDb();
      await expect(
        isFirstAuthorization(db, {
          uid: UID,
          serviceValue: '',
          clientIdHex: DESKTOP,
          isNativeClient: true,
        })
      ).resolves.toBe(false);
      expect(db.hasConsentForService).not.toHaveBeenCalled();
      expect(db.hasConsentForClient).not.toHaveBeenCalled();
    });
  });
});
