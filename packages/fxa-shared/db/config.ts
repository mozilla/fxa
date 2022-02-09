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

export function makeRedisConfig() {
  return {
    host: {
      default: 'localhost',
      env: 'REDIS_HOST',
      format: String,
      doc: 'IP address or host name for Redis server',
    },
    port: {
      default: 6379,
      env: 'REDIS_PORT',
      format: 'port',
      doc: 'Port for Redis server',
    },
    maxPending: {
      default: 1000,
      env: 'REDIS_POOL_MAX_PENDING',
      format: 'int',
      doc: 'Pending request limit for Redis',
    },
    retryCount: {
      default: 5,
      env: 'REDIS_POOL_RETRY_COUNT',
      format: 'int',
      doc: 'Retry limit for Redis connection attempts',
    },
    initialBackoff: {
      default: '100 milliseconds',
      env: 'REDIS_POOL_TIMEOUT',
      format: 'duration',
      doc: 'Initial backoff for Redis connection retries, increases exponentially with each attempt',
    },

    // Specific
    accessTokens: {
      enabled: {
        default: true,
        doc: 'Enable Redis for refresh token metadata',
        format: Boolean,
        env: 'ACCESS_TOKEN_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'ACCESS_TOKEN_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'ACCESS_TOKEN_REDIS_PORT',
        format: 'port',
      },
      prefix: {
        default: 'at:',
        env: 'ACCESS_TOKEN_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for access tokens in Redis',
      },
      recordLimit: {
        default: 100,
        env: 'ACCESS_TOKEN_REDIS_LIMIT',
        format: Number,
        doc: 'Maximum number of access tokens per account at any one time',
      },
      maxttl: {
        default: 86400000,
        env: 'ACCESS_TOKEN_REDIS_MAX_TTL',
        format: Number,
        doc: 'ttl for redis data',
      },
    },
    refreshTokens: {
      enabled: {
        default: true,
        doc: 'Enable Redis for refresh token metadata',
        format: Boolean,
        env: 'REFRESH_TOKEN_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'REFRESH_TOKEN_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'REFRESH_TOKEN_REDIS_PORT',
        format: 'port',
      },
      prefix: {
        default: 'rt:',
        env: 'REFRESH_TOKEN_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for refresh tokens in Redis',
      },
      maxttl: {
        default: 86400000,
        env: 'REFRESH_TOKEN_REDIS_MAX_TTL',
        format: Number,
        doc: 'ttl for redis data',
      },
      recordLimit: {
        default: 20,
        env: 'REFRESH_TOKEN_REDIS_LIMIT',
        format: Number,
        doc: 'Maximum number of refresh tokens per account stored in redis',
      },
    },
    sessionTokens: {
      enabled: {
        default: true,
        doc: 'Enable Redis for session tokens',
        format: Boolean,
        env: 'USE_REDIS',
      },
      prefix: {
        default: 'fxa-auth-session',
        env: 'SESSIONS_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for session tokens in Redis',
      },
      maxConnections: {
        default: 200,
        env: 'REDIS_POOL_MAX_CONNECTIONS',
        format: 'int',
        doc: 'Maximum connection count for the session token Redis pool',
      },
      minConnections: {
        default: 2,
        env: 'REDIS_POOL_MIN_CONNECTIONS',
        format: 'int',
        doc: 'Minimum connection count for the session token Redis pool',
      },
    },
    email: {
      enabled: {
        default: true,
        doc: 'Enable Redis for email config',
        format: Boolean,
        env: 'EMAIL_CONFIG_USE_REDIS',
      },
      prefix: {
        default: 'email:',
        env: 'EMAIL_CONFIG_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for the email config Redis pool',
      },
      maxConnections: {
        default: 10,
        env: 'EMAIL_CONFIG_REDIS_POOL_MAX_CONNECTIONS',
        format: 'int',
        doc: 'Maximum connection count for the email config Redis pool',
      },
      minConnections: {
        default: 1,
        env: 'EMAIL_CONFIG_REDIS_POOL_MIN_CONNECTIONS',
        format: 'int',
        doc: 'Minimum connection count for the email config Redis pool',
      },
    },
    subhub: {
      enabled: {
        default: true,
        doc: 'Enable Redis for subhub responses',
        format: Boolean,
        env: 'SUBHUB_USE_REDIS',
      },
      prefix: {
        default: 'subhub:',
        env: 'SUBHUB_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for subhub responses in Redis',
      },
      maxConnections: {
        default: 10,
        env: 'SUBHUB_REDIS_POOL_MAX_CONNECTIONS',
        format: 'int',
        doc: 'Maximum connection count for the subhub responses Redis pool',
      },
      minConnections: {
        default: 1,
        env: 'SUBHUB_REDIS_POOL_MIN_CONNECTIONS',
        format: 'int',
        doc: 'Minimum connection count for the subhub responses Redis pool',
      },
    },
  };
}
