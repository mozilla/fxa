/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { PasskeyManager, AccountDatabaseToken } from './passkey.manager';
import {
  AccountDatabase,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';

describe('PasskeyManager (Integration)', () => {
  let manager: PasskeyManager;
  let db: AccountDatabase;

  beforeAll(async () => {
    // Set up real database connection for integration tests
    try {
      db = await testAccountDatabaseSetup(['accounts', 'passkeys']);
      Container.set(AccountDatabaseToken, db);
      manager = Container.get(PasskeyManager);
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
    Container.reset();
  });

  // TODO: Add actual integration tests once PasskeyManager methods are implemented
  it('should be defined', () => {
    expect(manager).toBeDefined();
  });
});
