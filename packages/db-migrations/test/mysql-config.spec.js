/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import { makeMySQLConfig } from '../lib/mysql-config.js';

describe('makeMySQLConfig', () => {
  const config = makeMySQLConfig('AUTH', 'fxa');

  it.each([
    ['database', 'AUTH_MYSQL_DATABASE', 'fxa', String],
    ['host', 'AUTH_MYSQL_HOST', 'localhost', String],
    ['password', 'AUTH_MYSQL_PASSWORD', '', String],
    ['port', 'AUTH_MYSQL_PORT', 3306, Number],
    ['user', 'AUTH_MYSQL_USERNAME', 'root', String],
    ['connectionLimitMin', 'AUTH_MYSQL_CONNECTION_LIMIT_MIN', 2, undefined],
    ['connectionLimitMax', 'AUTH_MYSQL_CONNECTION_LIMIT_MAX', 10, undefined],
    ['acquireTimeoutMillis', 'AUTH_MYSQL_ACQUIRE_TIMEOUT', 30000, undefined],
    ['idleLimitMs', 'AUTH_MYSQL_IDLE_LIMIT_MS', 60000, undefined],
  ])('sets %s from %s with default %p', (key, env, defaultValue, format) => {
    expect(config[key].env).toBe(env);
    expect(config[key].default).toBe(defaultValue);
    expect(config[key].format).toBe(format);
  });

  it('returns only the 9 MySQL keys', () => {
    expect(Object.keys(config)).toHaveLength(9);
  });

  it('passes convict validation', () => {
    expect(() => convict({ fxa: config }).validate()).not.toThrow();
  });
});
