/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, validate } from 'class-validator';

export class MySQLConfig {
  @IsString()
  database!: string;

  @IsString()
  host!: string;

  @IsInt()
  @Type(() => Number)
  port!: number;

  @IsString()
  user!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  connectionLimitMin?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  connectionLimitMax?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  acquireTimeoutMillis?: number;
}

/**
 * Creates and validated a MySQLConfig from raw data.
 *
 * Throws a class-validator errors object if validation fails.
 *
 * @param data Object of non-validated config data.
 */
export async function makeValidatedMySQLConfig(
  data: Record<string, any>
): Promise<MySQLConfig> {
  const config = new MySQLConfig();
  Object.assign(config, data);
  await validate(config);
  return config;
}

/**
 * Create a configuration object valid for use with the convict configuration package.
 */
export function makeConvictMySQLConfig(envPrefix: string, database: string) {
  return {
    database: {
      default: database,
      doc: 'MySQL database',
      env: envPrefix + '_MYSQL_DATABASE',
      format: String,
    },
    host: {
      default: '::1',
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
    idleLimitMs: {
      doc: 'The number of milliseconds a connection can be idle before it is closed',
      default: 60000,
      env: envPrefix + '_MYSQL_IDLE_LIMIT_MS',
    },
  };
}
