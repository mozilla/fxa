/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import convict from 'convict';
import fs from 'fs';
import { makeMySQLConfig, makeRedisConfig } from 'fxa-shared/db/config';
import path from 'path';

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  authHeader: {
    default: 'oidc-claim-id-token-email',
    doc: 'Authentication header that should be logged for the user',
    env: 'AUTH_HEADER',
    format: String,
  },
  user: {
    group: {
      default: '',
      doc: 'Group to operate under for dev / test.',
      env: 'TEST_USER_GROUP',
      format: String,
    },
    email: {
      default: '',
      doc: 'Email to operate under for dev / test.',
      env: 'TEST_USER_EMAIL',
      format: String,
    },
  },
  database: {
    fxa: makeMySQLConfig('AUTH', 'fxa'),
    fxa_oauth: makeMySQLConfig('OAUTH', 'fxa_oauth'),
  },
  redis: makeRedisConfig(),
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  log: {
    app: { default: 'fxa-user-admin-server' },
    fmt: {
      default: 'heka',
      env: 'LOGGING_FORMAT',
      format: ['heka', 'pretty'],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
  },
  port: {
    default: 8095,
    doc: 'Default port to listen on',
    env: 'PORT',
    format: Number,
  },
  sentry: {
    dsn: {
      doc: 'Sentry DSN for error and log reporting',
      default: '',
      format: 'String',
      env: 'SENTRY_DSN',
    },
    env: {
      doc: 'Environment name to report to sentry',
      default: 'local',
      format: ['local', 'ci', 'dev', 'stage', 'prod'],
      env: 'SENTRY_ENV',
    },
    sampleRate: {
      doc: 'Rate at which sentry traces are captured.',
      default: 1.0,
      format: 'Number',
      env: 'SENTRY_SAMPLE_RATE',
    },
    tracesSampleRate: {
      doc: 'Rate at which sentry traces are captured.',
      default: 0.0,
      format: 'Number',
      env: 'SENTRY_TRACES_SAMPLE_RATE',
    },
    serverName: {
      doc: 'Name used by sentry to identify the server.',
      default: 'fxa-admin-server',
      format: 'String',
      env: 'SENTRY_SERVER_NAME',
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
      default: 'fxa-admin-server.',
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
  },
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
  clientFormatter: {
    i18n: {
      defaultLanguage: {
        default: 'en',
        doc: 'default target language',
        format: String,
        env: 'L10N_DEFAULT_LANGUAGE',
      },
      supportedLanguages: {
        doc: 'list of supported languages',
        format: Array,
        default: ['en'],
        env: 'L10N_SUPPORTED_LANGUAGE',
      },
    },
    lastAccessTimeUpdates: {
      earliestSaneTimestamp: {
        doc: 'timestamp used as the basis of the fallback value for lastAccessTimeFormatted, currently pinned to the deployment of 1.96.4 / a0940d7dc51e2ba20fa18aa3a830810e35c9a9d9',
        format: 'timestamp',
        default: 1507081020000,
        env: 'LASTACCESSTIME_EARLIEST_SANE_TIMESTAMP',
      },
    },
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
