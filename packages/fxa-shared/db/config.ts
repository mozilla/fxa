/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface MySQLConfig {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
  connectionLimitMin?: number;
  connectionLimitMax?: number;
  acquireTimeoutMillis?: number;
}

export function makeMySQLConfig(envPrefix: string, database: string) {
  return {
    database: {
      default: database,
      doc: 'MySQL database',
      env: envPrefix + '_MYSQL_DATABASE',
      format: String,
    },
    host: {
      default: 'localhost',
      doc: 'MySQL host',
      env: envPrefix + '_MYSQL_HOST',
      format: String,
    },
    password: {
      default: '',
      doc: 'MySQL password',
      env: envPrefix + '_MYSQL_PASSWORD',
      format: String,
    },
    port: {
      default: 3306,
      doc: 'MySQL port',
      env: envPrefix + '_MYSQL_PORT',
      format: Number,
    },
    user: {
      default: 'root',
      doc: 'MySQL username',
      env: envPrefix + '_MYSQL_USERNAME',
      format: String,
    },
    connectionLimitMin: {
      doc: 'The min number of connections that the pool can use at once.',
      default: 2,
      env: envPrefix + '_MYSQL_CONNECTION_LIMIT_MIN',
    },
    connectionLimitMax: {
      doc: 'The maximum number of connections that the pool can use at once.',
      default: 10,
      env: envPrefix + '_MYSQL_CONNECTION_LIMIT_MAX',
    },
    acquireTimeoutMillis: {
      doc: 'The milliseconds before a timeout occurs if a resource cannot be acquired',
      default: 30000,
      env: envPrefix + '_MYSQL_ACQUIRE_TIMEOUT',
    },
  };
}
