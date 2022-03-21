/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import convict from 'convict';
import fs from 'fs';
import path from 'path';
import { makeMySQLConfig } from 'fxa-shared/db/config';

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  authHeader: {
    default: 'oidc-claim-id-token-email',
    doc: 'Authentication header that should be logged for the user',
    env: 'AUTH_HEADER',
    format: String,
  },
  authServer: {
    secretBearerToken: {
      default: 'YOU MUST CHANGE ME',
      doc: 'Shared secret for accessing certain auth server endpoints',
      env: 'AUTH_SECRET_BEARER_TOKEN',
      format: 'String',
    },
    signinLocationsSearchPath: {
      default: '/v1/account/sessions/locations',
      doc: 'Auth server path session token metadata locations',
      env: 'AUTH_SERVER_LOCATIONS_SEARCH_PATH',
      format: String,
    },
    subscriptionsSearchPath: {
      default: '/v1/oauth/support-panel/subscriptions',
      doc: 'Auth server path for subscriptions',
      env: 'AUTH_SERVER_SUBS_SEARCH_PATH',
      format: String,
    },
    url: {
      default: 'http://localhost:9000',
      doc: 'URL for auth server',
      env: 'AUTH_SERVER_URL',
      format: String,
    },
  },
  database: {
    mysql: {
      auth: makeMySQLConfig('AUTH', 'fxa'),
    },
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  log: {
    app: { default: 'fxa-support-panel' },
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
  listen: {
    host: {
      default: '0.0.0.0',
      doc: 'The ip address the server should bind',
      env: 'IP_ADDRESS',
      format: String,
    },
    port: {
      default: 7100,
      doc: 'The port the server should bind',
      env: 'PORT',
      format: 'port',
    },
    publicUrl: {
      default: 'http://localhost:3031',
      env: 'PUBLIC_URL',
      format: 'url',
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
      default: 'fxa-support-panel.',
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
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN for error and log reporting',
    env: 'SENTRY_DSN',
    format: 'String',
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
  csp: {
    frameAncestors: {
      default: 'none',
      doc: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors',
      env: 'CSP_FRAME_ANCESTORS',
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
