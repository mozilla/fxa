/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { MySQLConfig } from './config';

export const MySQLConfigProvider = {
  provide: MySQLConfig,
  useFactory: (config: ConfigService) => {
    return config.get('database.mysql.auth');
  },
  inject: [ConfigService],
};
