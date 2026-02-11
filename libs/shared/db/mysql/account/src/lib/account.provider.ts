/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';

import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import {
  AccountDatabase,
  AccountDbProvider,
  setupAccountDatabase,
} from './setup';

export const AccountDatabaseNestFactory: Provider<AccountDatabase> = {
  provide: AccountDbProvider,
  useFactory: (mysqlConfig: MySQLConfig) => {
    return setupAccountDatabase(mysqlConfig);
  },
  inject: [MySQLConfig],
};

/**
 * Can be used to satisfy DI when unit testing things that should not need
 * account DB access.
 * Note: this will cause errors to be thrown if the account DB is used
 */
export const MockAccountDatabaseNestFactory: Provider<AccountDatabase> = {
  provide: AccountDbProvider,
  useFactory: () => {
    return undefined as unknown as AccountDatabase;
  },
};
