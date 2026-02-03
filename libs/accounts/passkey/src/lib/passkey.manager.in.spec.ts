/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PasskeyManager } from './passkey.manager';
import {
  AccountDatabase,
  AccountDbProvider,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { Test } from '@nestjs/testing';

describe('PasskeyManager (Integration)', () => {
  let manager: PasskeyManager;
  let db: AccountDatabase;

  beforeAll(async () => {
    // Set up real database connection for integration tests
    // TODO: Add 'passkeys' table to the setup array once the table schema is created
    try {
      db = await testAccountDatabaseSetup(['accounts']);

      const moduleRef = await Test.createTestingModule({
        providers: [
          PasskeyManager,
          {
            provide: AccountDbProvider,
            useValue: db,
          },
        ],
      }).compile();

      manager = moduleRef.get(PasskeyManager);
    } catch (error) {
      // Log helpful message before failing fast
      console.warn('\n⚠️  Integration tests require database infrastructure.');
      console.warn(
        '   Run "yarn start infrastructure" to enable these tests.\n'
      );
      // Re-throw to fail fast instead of running tests that will skip
      throw error;
    }
  });

  afterAll(async () => {
    if (db) {
      await db.destroy();
    }
  });

  // TODO: Add actual integration tests once:
  // 1. Passkey database schema is defined
  // 2. PasskeyManager methods are implemented
  // 3. Test data factories are created
  it('should be defined', () => {
    expect(manager).toBeDefined();
  });
});
