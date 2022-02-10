/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import mysql from 'mysql';

import { AccessToken as AccessToken } from '../db/models/auth/access-token';
import * as ScopeSet from '../oauth/scopes';

// TODO: Improve types. Ported form javascript...
const buf = require('buf').hex;

/**
 * List of mysql error codes
 */
export enum MysqlErrors {
  // http://dev.mysql.com/doc/refman/5.5/en/error-messages-server.html
  ER_DUP_ENTRY = 1062,
  ER_TOO_MANY_CONNECTIONS = 1040,
  ER_LOCK_WAIT_TIMEOUT = 1205,
  ER_LOCK_TABLE_FULL = 1206,
  ER_LOCK_DEADLOCK = 1213,
  ER_LOCK_ABORTED = 1689,
  // custom mysql errors
  ER_DELETE_PRIMARY_EMAIL = 2100,
  ER_EXPIRED_TOKEN_VERIFICATION_CODE = 2101,
  ER_SIGNAL_NOT_FOUND = 1643,
}

/**
 * Target characteracter set
 */
export const REQUIRED_CHARSET = 'UTF8MB4_UNICODE_CI';

/**
 * Target sql modes
 */
export const REQUIRED_SQL_MODES = [
  'STRICT_ALL_TABLES',
  'NO_ENGINE_SUBSTITUTION',
];

const QUERY_LIST_REFRESH_TOKENS_BY_UID =
  'SELECT refreshTokens.token AS tokenId, refreshTokens.clientId, refreshTokens.createdAt, refreshTokens.lastUsedAt, ' +
  '  refreshTokens.scope, clients.name as clientName, clients.canGrant AS clientCanGrant ' +
  'FROM refreshTokens LEFT OUTER JOIN clients ON clients.id = refreshTokens.clientId ' +
  'WHERE refreshTokens.userId=?';

const QUERY_LIST_ACCESS_TOKENS_BY_UID =
  'SELECT tokens.token AS tokenId, tokens.clientId, tokens.createdAt, ' +
  '  tokens.userId, tokens.scope, ' +
  '  tokens.createdAt, tokens.expiresAt, tokens.profileChangedAt, ' +
  '  clients.name as clientName, clients.canGrant AS clientCanGrant, ' +
  '  clients.publicClient ' +
  'FROM tokens LEFT OUTER JOIN clients ON clients.id = tokens.clientId ' +
  'WHERE tokens.userId=?';

/**
 * Helper function for setting proper status code and error number on an error.
 * @param error
 * @returns error decorated with errno and statusCode
 */
export function convertError(
  error: Error & { errno: number; statusCode?: number }
) {
  const e: any = new Error();
  // Return an error that looks like the old db-mysql version (for now)
  switch (error.errno) {
    case MysqlErrors.ER_DUP_ENTRY:
      e.errno = 101;
      e.statusCode = 409;
      break;
    case MysqlErrors.ER_SIGNAL_NOT_FOUND:
      e.errno = 116;
      e.statusCode = 404;
      break;
    case MysqlErrors.ER_DELETE_PRIMARY_EMAIL:
      (e.errno = 136), (e.statusCode = 400);
      break;
    case MysqlErrors.ER_EXPIRED_TOKEN_VERIFICATION_CODE:
      e.errno = 137;
      e.statusCode = 400;
      break;
    default:
      e.errno = error.errno;
      e.statusCode = error.statusCode || 500;
  }
  return e as Error & { errno: number; statusCode: number };
}

/**
 * Creates a 'not found' error with proper errno and status code.
 * @returns error
 */
export function notFound() {
  const error: any = new Error();
  error.errno = 116;
  error.statusCode = 404;
  return error as Error & { errno: number; statusCode: number };
}

/**
 * Base MysqlStore class. This is the foundation for calls going to sql.
 */
export class MysqlStoreShared {
  protected readonly _pool: mysql.Pool;

  constructor(options: mysql.PoolConfig) {
    if (options.charset && options.charset !== REQUIRED_CHARSET) {
      throw new Error('You cannot use any charset besides ' + REQUIRED_CHARSET);
    } else {
      options.charset = REQUIRED_CHARSET;
    }
    options.typeCast = function (field: any, next: any) {
      if (field.type === 'TINY' && field.length === 1) {
        return field.string() === '1';
      }
      return next();
    };
    this._pool = mysql.createPool(options);
  }

  protected async _query(sql: any, params: any): Promise<any> {
    const conn: any = await this._getConnection();
    try {
      return await new Promise(function (resolve, reject) {
        conn.query(sql, params || [], function (err: any, results: any) {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });
    } finally {
      conn.release();
    }
  }

  protected _write(sql: string, params: any) {
    return this._query(sql, params);
  }

  protected _read(sql: string, params: any): Promise<any> {
    return this._query(sql, params);
  }

  protected _readOne(sql: string, params: any) {
    return this._read(sql, params).then(this.firstRow);
  }

  protected _getConnection() {
    var pool = this._pool;
    return new Promise(function (resolve, reject) {
      pool.getConnection(function (err: any, conn: any) {
        if (err) {
          return reject(err);
        }

        if (conn._fxa_initialized) {
          return resolve(conn);
        }

        // Enforce sane defaults on every new connection.
        // These *should* be set by the database by default, but it's nice
        // to have an additional layer of protection here.
        const query = (sql: any) =>
          new Promise<any>((resolve, reject) => {
            conn.query(sql, (err: any, result: any) => {
              if (err) {
                return reject(err);
              }
              resolve(result);
            });
          });

        return resolve(
          (async () => {
            // Always communicate timestamps in UTC.
            await query("SET time_zone = '+00:00'");
            // Always use full 4-byte UTF-8 for communicating unicode.
            await query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;');
            // Always have certain modes active. The complexity here is to
            // preserve any extra modes active by default on the server.
            // We also try to preserve the order of the existing mode flags,
            // just in case the order has some obscure effect we don't know about.
            const rows = await query('SELECT @@sql_mode AS mode');
            const modes = rows[0]['mode'].split(',');
            let needToSetMode = false;
            for (const requiredMode of REQUIRED_SQL_MODES) {
              if (modes.indexOf(requiredMode) === -1) {
                modes.push(requiredMode);
                needToSetMode = true;
              }
            }
            if (needToSetMode) {
              const mode = modes.join(',');
              await query("SET SESSION sql_mode = '" + mode + "'");
            }
            // Avoid repeating all that work for existing connections.
            conn._fxa_initialized = true;
            return conn;
          })()
        );
      });
    });
  }

  protected firstRow(rows: any[]) {
    return rows[0];
  }

  async getRefreshTokensByUid(uid: string) {
    const refreshTokens = await this._read(QUERY_LIST_REFRESH_TOKENS_BY_UID, [
      buf(uid),
    ]);
    refreshTokens.forEach((t: any) => {
      t.scope = ScopeSet.fromString(t.scope);
    });
    return refreshTokens;
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      if (!this._pool) {
        resolve();
      }

      this._pool.end(function (err: mysql.MysqlError) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Get all access tokens for a given user.
   * @param {String} uid User ID as hex
   * @returns {Promise}
   */
  async getAccessTokensByUid(uid: string) {
    const accessTokens = await this._read(QUERY_LIST_ACCESS_TOKENS_BY_UID, [
      buf(uid),
    ]);

    return accessTokens.map((t: any) => {
      return AccessToken.fromMySQL(t);
    });
  }
}
