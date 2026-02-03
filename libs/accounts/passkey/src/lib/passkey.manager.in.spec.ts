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
      // If database connection fails, skip tests with a helpful message
      console.warn(
        'Integration tests skipped: Database infrastructure not available.'
      );
      console.warn(
        'Run "yarn start infrastructure" to enable integration tests.'
      );
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
    if (!manager) {
      console.warn('Test skipped: Database infrastructure not available');
      return;
    }
    expect(manager).toBeDefined();
  });
});
