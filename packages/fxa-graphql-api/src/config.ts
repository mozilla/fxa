/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import convict from 'convict';
import fs from 'fs';
import path from 'path';
import { makeMySQLConfig } from 'fxa-shared/db/config';
import { tracingConfig } from 'fxa-shared/tracing/config';

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

export interface RedisConfig {
  host: string;
  keyPrefix: string;
  port: number;
}

const conf = convict({
  authServer: {
    url: {
      doc: 'URL of fxa-auth-server',
      env: 'AUTH_SERVER_URL',
      default: 'http://localhost:9000/v1',
    },
  },
  corsOrigin: {
    doc: 'Value for the Access-Control-Allow-Origin response header',
    format: Array,
    env: 'CORS_ORIGIN',
    default: ['http://accounts.firefox.com/'],
  },
  customsUrl: {
    doc: "fraud / abuse server url; set to the string 'none' to disable",
    default: 'http://localhost:7000',
    env: 'CUSTOMS_SERVER_URL',
  },
  settingsUrl: {
    doc: 'Settings server url',
    default: 'http://localhost:3030',
    env: 'SETTINGS_SERVER_URL',
  },
  database: {
    mysql: {
      auth: makeMySQLConfig('AUTH', 'fxa'),
      profile: makeMySQLConfig('PROFILE', 'fxa_profile'),
      oauth: makeMySQLConfig('OAUTH', 'fxa_oauth'),
    },
    redis: {},
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  log: {
    app: { default: 'fxa-graphql-api-server' },
    fmt: {
      default: 'heka',
      env: 'LOGGING_FORMAT',
      format: ['heka', 'pretty'],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
    routes: {
      enabled: {
        default: true,
        doc: 'Enable route logging. Set to false to trimming CI logs.',
        env: 'ENABLE_ROUTE_LOGGING',
      },
      format: {
        default: 'default_fxa',
        format: ['default_fxa', 'dev_fxa', 'default', 'dev', 'short', 'tiny'],
      },
    },
  },
  image: {
    maxSize: {
      doc: 'Maximum bytes allow for uploads',
      default: 1024 * 1024 * 2, // 2MB
      env: 'IMG_UPLOADS_DEST_MAX_SIZE',
    },
    types: {
      doc: 'A mapping of allowed mime types and their file signatures',
      format: Object,
      default: {
        // see https://en.wikipedia.org/wiki/List_of_file_signatures
        'image/jpeg': [
          [0xff, 0xd8, 0xff, 0xdb],
          [0xff, 0xd8, 0xff, 0xe0],
          [0xff, 0xd8, 0xff, 0xe1],
        ],
        'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
      },
    },
  },
  metrics: {
    host: {
      default: '',
      doc: 'Metrics host to report to',
      env: 'METRIC_HOST',
      format: String,
    },
    port: {
      default: 8125,
      doc: 'Metric port to report to',
      env: 'METRIC_PORT',
      format: Number,
    },
    prefix: {
      default: 'fxa-graphql-api.',
      doc: 'Metric prefix for statsD',
      env: 'METRIC_PREFIX',
      format: String,
    },
    telegraf: {
      default: true,
      doc: 'Whether to use telegraf formatted metrics',
      env: 'METRIC_USE_TELEGRAF',
      format: Boolean,
    },
    sampleRate: {
      doc: 'Sampling rate for StatsD',
      format: Number,
      default: 1,
      env: 'METRIC_SAMPLE_RATE',
    },
  },
  oauth: {
    clientId: {
      default: '98e6508e88680e1a',
      doc: 'OAuth client id to identify with to the profile-server',
      env: 'OAUTH_CLIENT_ID',
      format: String,
    },
  },
  profileServer: {
    url: {
      doc: 'URL of fxa-profile-server',
      env: 'PROFILE_SERVER_URL',
      default: 'http://localhost:1111/v1',
    },
  },
  redis: {
    accessTokens: {
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
    },
  },
  port: {
    default: 8290,
    doc: 'Default port to listen on',
    env: 'PORT',
    format: Number,
  },
  sentry: {
    dsn: {
      default: '',
      doc: 'Sentry DSN for error and log reporting',
      env: 'SENTRY_DSN',
      format: String,
    },
    env: {
      doc: 'Environment name to report to sentry',
      default: 'local',
      format: ['local', 'ci', 'dev', 'stage', 'prod'],
      env: 'SENTRY_ENV',
    },
    sampleRate: {
      default: 1.0,
      doc: 'Rate at which errors are sampled.',
      env: 'SENTRY_SAMPLE_RATE',
      format: 'Number',
    },
    serverName: {
      doc: 'Name used by sentry to identify the server.',
      default: 'fxa-graphql-api',
      format: 'String',
      env: 'SENTRY_SERVER_NAME',
    },
  },
  tracing: tracingConfig,
  hstsEnabled: {
    default: true,
    doc: 'Send a Strict-Transport-Security header',
    env: 'HSTS_ENABLED',
    format: Boolean,
  },
  hstsMaxAge: {
    default: 31536000, // a year
    doc: 'Max age of the STS directive in seconds',
    // Note: This format is a number because the value needs to be in seconds
    format: Number,
  },
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

// Need to move two dirs up as we're in the compiled directory now
const configDir = path.dirname(path.dirname(__dirname));
let envConfig = path.join(configDir, 'config', `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });
const Config = conf;

export type AppConfig = ReturnType<typeof Config['getProperties']>;
export default Config;
