/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import {
  AccountDatabase,
  AccountDbProvider,
  PasskeyFactory,
} from '@fxa/shared/db/mysql/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { PasskeyManager } from './passkey.manager';
import { PasskeyConfig, MAX_PASSKEY_NAME_LENGTH } from './passkey.config';
import * as PasskeyRepository from './passkey.repository';
import { bufferToAaguid } from './passkey.repository';
import { AppError } from '../../../errors/src';

// Mock the repository module, keeping isMysqlDupEntry as the real implementation
// since it is a pure synchronous helper (no DB access) and the manager relies on
// its actual logic to detect ER_DUP_ENTRY errors.
jest.mock('./passkey.repository', () => ({
  ...jest.requireActual('./passkey.repository'),
  countPasskeysByUid: jest.fn(),
  deleteAllPasskeysForUser: jest.fn(),
  deletePasskey: jest.fn(),
  findPasskeyByCredentialId: jest.fn(),
  findPasskeysByUid: jest.fn(),
  insertPasskey: jest.fn(),
  updatePasskeyCounterAndLastUsed: jest.fn(),
  updatePasskeyName: jest.fn(),
}));

const mockDb = {} as unknown as AccountDatabase;
const MOCK_MAX_PASSKEYS_PER_USER = 3;
const CHALLENGE_TIMEOUT_MS = 1000 * 60 * 5;

const mockConfig = new PasskeyConfig({
  allowedOrigins: ['https://accounts.example.com'],
  enabled: true,
  rpId: 'accounts.example.com',
  challengeTimeout: CHALLENGE_TIMEOUT_MS,
  maxPasskeysPerUser: MOCK_MAX_PASSKEYS_PER_USER,
});

const mockMetrics = {
  increment: jest.fn(),
  timing: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('PasskeyManager', () => {
  let manager: PasskeyManager;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasskeyManager,
        { provide: AccountDbProvider, useValue: mockDb },
        { provide: PasskeyConfig, useValue: mockConfig },
        { provide: StatsDService, useValue: mockMetrics },
        { provide: LOGGER_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    manager = module.get(PasskeyManager);
  });

  describe('registerPasskey', () => {
    // PasskeyFactory produces the DB-row shape (credentialId: Buffer); the
    // manager takes NewPasskeyData (credentialId: base64url string).
    const newPasskeyData = (passkey: ReturnType<typeof PasskeyFactory>) => ({
      ...passkey,
      credentialId: passkey.credentialId.toString('base64url'),
      aaguid: bufferToAaguid(passkey.aaguid),
    });

    it('checks the limit and inserts the passkey', async () => {
      const passkey = PasskeyFactory();
      const uid = passkey.uid.toString('hex');
      const data = newPasskeyData(passkey);

      (PasskeyRepository.countPasskeysByUid as jest.Mock).mockResolvedValue(1);
      (PasskeyRepository.insertPasskey as jest.Mock).mockResolvedValue(
        undefined
      );

      await manager.registerPasskey(uid, data);

      expect(PasskeyRepository.countPasskeysByUid).toHaveBeenCalledWith(
        mockDb,
        uid
      );
      expect(PasskeyRepository.insertPasskey).toHaveBeenCalledWith(
        mockDb,
        uid,
        data
      );
    });

    it('throws passkeyLimitReached AppError when count equals the limit', async () => {
      (PasskeyRepository.countPasskeysByUid as jest.Mock).mockResolvedValue(
        MOCK_MAX_PASSKEYS_PER_USER
      );

      const passkey = PasskeyFactory();
      await expect(
        manager.registerPasskey(
          passkey.uid.toString('hex'),
          newPasskeyData(passkey)
        )
      ).rejects.toMatchObject(
        AppError.passkeyLimitReached(MOCK_MAX_PASSKEYS_PER_USER)
      );
      expect(PasskeyRepository.insertPasskey).not.toHaveBeenCalled();
    });

    it('throws passkeyAlreadyRegistered AppError on ER_DUP_ENTRY', async () => {
      (PasskeyRepository.countPasskeysByUid as jest.Mock).mockResolvedValue(1);
      const dupError = Object.assign(new Error('Duplicate entry'), {
        code: 'ER_DUP_ENTRY',
      });
      (PasskeyRepository.insertPasskey as jest.Mock).mockRejectedValue(
        dupError
      );

      const passkey = PasskeyFactory();
      await expect(
        manager.registerPasskey(
          passkey.uid.toString('hex'),
          newPasskeyData(passkey)
        )
      ).rejects.toMatchObject(AppError.passkeyAlreadyRegistered());
    });

    it('re-throws unknown database errors', async () => {
      (PasskeyRepository.countPasskeysByUid as jest.Mock).mockResolvedValue(0);
      const unknownError = new Error('connection timeout');
      (PasskeyRepository.insertPasskey as jest.Mock).mockRejectedValue(
        unknownError
      );

      const passkey = PasskeyFactory();
      await expect(
        manager.registerPasskey(
          passkey.uid.toString('hex'),
          newPasskeyData(passkey)
        )
      ).rejects.toThrow('connection timeout');
    });
  });

  describe('updatePasskeyAfterAuth', () => {
    it('passes backupState=false through to the repository', async () => {
      (
        PasskeyRepository.updatePasskeyCounterAndLastUsed as jest.Mock
      ).mockResolvedValue(true);

      const uid = Buffer.alloc(16, 1).toString('hex');
      const credId = Buffer.alloc(32, 2).toString('base64url');
      const result = await manager.updatePasskeyAfterAuth(
        uid,
        credId,
        0,
        false
      );

      expect(
        PasskeyRepository.updatePasskeyCounterAndLastUsed
      ).toHaveBeenCalledWith(mockDb, uid, credId, 0, false);
      expect(result).toBe(true);
    });

    it('passes backupState=true through to the repository', async () => {
      (
        PasskeyRepository.updatePasskeyCounterAndLastUsed as jest.Mock
      ).mockResolvedValue(true);

      const result = await manager.updatePasskeyAfterAuth(
        Buffer.alloc(16).toString('hex'),
        Buffer.alloc(32).toString('base64url'),
        1,
        true
      );

      expect(
        PasskeyRepository.updatePasskeyCounterAndLastUsed
      ).toHaveBeenCalledWith(
        mockDb,
        expect.any(String),
        expect.any(String),
        1,
        true
      );
      expect(result).toBe(true);
    });
  });

  describe('checkPasskeyCount', () => {
    it('resolves without throwing when count is under the limit', async () => {
      (PasskeyRepository.countPasskeysByUid as jest.Mock).mockResolvedValue(
        MOCK_MAX_PASSKEYS_PER_USER - 1
      );
      await expect(
        manager.checkPasskeyCount(Buffer.alloc(16, 1).toString('hex'))
      ).resolves.toBeUndefined();
    });

    it.each([
      ['equals', MOCK_MAX_PASSKEYS_PER_USER],
      ['exceeds', MOCK_MAX_PASSKEYS_PER_USER + 1],
    ])(
      'throws passkeyLimitReached AppError when count %s the limit',
      async (_label, count) => {
        (PasskeyRepository.countPasskeysByUid as jest.Mock).mockResolvedValue(
          count
        );
        await expect(
          manager.checkPasskeyCount(Buffer.alloc(16, 1).toString('hex'))
        ).rejects.toMatchObject({
          errno: 226,
          message: 'Maximum number of passkeys reached',
          code: 400,
        });
      }
    );
  });

  describe('renamePasskey', () => {
    it(`returns false without calling repository when name exceeds ${MAX_PASSKEY_NAME_LENGTH} characters`, async () => {
      const result = await manager.renamePasskey(
        Buffer.alloc(16, 1).toString('hex'),
        Buffer.alloc(32, 2).toString('base64url'),
        'x'.repeat(MAX_PASSKEY_NAME_LENGTH + 1)
      );

      expect(result).toBe(false);
      expect(PasskeyRepository.updatePasskeyName).not.toHaveBeenCalled();
    });
  });
});
