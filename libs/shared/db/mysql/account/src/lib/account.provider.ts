/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';

import { MySQLConfig } from '../../../core/src';
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
