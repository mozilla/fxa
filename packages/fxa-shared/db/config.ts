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
    idleLimitMs: {
      doc: 'The number of milliseconds a connection can be idle before it is closed',
      default: 60000,
      env: envPrefix + '_MYSQL_IDLE_LIMIT_MS',
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
    password: {
      default: '',
      env: 'REDIS_PASSWORD',
      format: String,
      sensitive: true,
      doc: `Password for connecting to redis`,
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
      password: {
        default: '',
        env: 'ACCESS_TOKEN_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to redis`,
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
        doc: 'Access Tokens maximum expiration (can live shorter)',
        format: 'duration',
        // Warning: See notes about token expiration time in auth config on FXA_EXPIRATION_ACCESS_TOKEN.
        //          This is a sensetive setting with some history.
        default: '365 minutes',
        env: 'FXA_EXPIRATION_ACCESS_TOKEN',
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
      password: {
        default: '',
        env: 'REFRESH_TOKEN_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to redis`,
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

    customs: {
      enabled: {
        default: false,
        doc: 'Enable Redis for customs server rate limiting',
        format: Boolean,
        env: 'CUSTOMS_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'CUSTOMS_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'CUSTOMS_REDIS_PORT',
        format: 'port',
      },
      password: {
        default: '',
        env: 'CUSTOMS_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to redis`,
      },
      prefix: {
        default: 'customs:',
        env: 'CUSTOMS_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for custom server records in Redis',
      },
    },

    ratelimit: {
      enabled: {
        default: true,
        doc: 'Enable Redis for customs server rate limiting',
        format: Boolean,
        env: 'RATELIMIT_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'RATELIMIT_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'RATELIMIT_REDIS_PORT',
        format: 'port',
      },
      password: {
        default: '',
        env: 'RATELIMIT_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to redis`,
      },
      prefix: {
        default: 'ratelimit:',
        env: 'RATELIMIT_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for custom server records in Redis',
      },
    },

    metrics: {
      enabled: {
        default: true,
        doc: 'Enable Redis for storing metrics data (metricsContext)',
        format: Boolean,
        env: 'METRICS_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'METRICS_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'METRICS_REDIS_PORT',
        format: 'port',
      },
      password: {
        default: '',
        env: 'METRICS_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to redis`,
      },
      prefix: {
        default: 'metrics:',
        env: 'METRICS_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for metrics records in Redis',
      },
      lifetime: {
        default: 7200,
        env: 'METRICS_REDIS_RECORD_LIFETIME',
        format: Number,
        doc: 'Default time that a metric record will be stored in Redis',
      },
    },

    authServerCache: {
      enabled: {
        default: true,
        doc: 'Enable Redis for storing metrics data (metricsContext)',
        format: Boolean,
        env: 'AUTH_CACHE_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'AUTH_CACHE_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'AUTH_CACHE_REDIS_PORT',
        format: 'port',
      },
      password: {
        default: '',
        env: 'AUTH_CACHE_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to Redis`,
      },
      prefix: {
        default: 'auth:cache:',
        env: 'AUTH_CACHE_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for Redis',
      },
    },
    recoveryPhone: {
      enabled: {
        default: true,
        doc: 'Enable Redis for recovery phone library',
        format: Boolean,
        env: 'RECOVERY_PHONE_REDIS_ENABLED',
      },
      host: {
        default: 'localhost',
        env: 'RECOVERY_PHONE_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'RECOVERY_PHONE_REDIS_PORT',
        format: 'port',
      },
      password: {
        default: '',
        env: 'RECOVERY_PHONE_REDIS_PASSWORD',
        format: String,
        sensitive: true,
        doc: `Password for connecting to Redis`,
      },
      prefix: {
        // Do not set a prefix! This is just here as an override.
        // The recovery phone library prefixes its entries already!
        default: '',
        format: String,
        doc: 'Key prefix for Redis',
      },
    },
  };
}
