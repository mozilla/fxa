/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import fs from 'fs';
import path from 'path';
import { GuardConfig } from 'fxa-shared/guards';
import { tracingConfig } from 'fxa-shared/tracing/config';

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'production', 'test'],
  },
  proxyStaticResourcesFrom: {
    default: '',
    doc: 'Instead of loading static resources from disk, get them by proxy from this URL (typically a special reloading dev server)',
    env: 'PROXY_STATIC_RESOURCES_FROM',
    format: String,
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
    enabled: {
      default: true,
      doc: 'Send "Content-Security-Policy" header',
      env: 'CSP_ENABLED',
    },
    reportUri: {
      default: '/_/csp-violation',
      doc: 'Location of "report-uri" for full, blocking CSP rules',
      env: 'CSP_REPORT_URI',
    },
    reportOnlyEnabled: {
      default: false,
      doc: 'Send "Content-Security-Policy-Report-Only" header',
      env: 'CSP_REPORT_ONLY_ENABLED',
    },
    reportOnlyUri: {
      default: '/_/csp-violation-report-only',
      doc: 'Location of "report-uri" for report-only CSP rules',
      env: 'CSP_REPORT_ONLY_URI',
    },
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
      doc: 'Rate at which sentry errors are captured.',
      default: 1.0,
      format: 'Number',
      env: 'SENTRY_SAMPLE_RATE',
    },
    serverName: {
      doc: 'Name used by sentry to identify the server.',
      default: 'fxa-admin-panel-server',
      format: 'String',
      env: 'SENTRY_SERVER_NAME',
    },
    clientName: {
      doc: 'Name used by sentry to identify the client.',
      default: 'fxa-admin-panel-client',
      format: 'String',
      env: 'SENTRY_CLIENT_NAME',
    },
    tracesSampleRate: {
      doc: 'Rate at which sentry traces are captured',
      default: 0,
      format: 'Number',
      env: 'SENTRY_TRACES_SAMPLE_RATE',
    },
  },
  tracing: tracingConfig,
  listen: {
    host: {
      default: 'localhost',
      doc: 'The ip address the server should bind',
      env: 'IP_ADDRESS',
      format: String,
    },
    port: {
      default: 8091,
      doc: 'The port the server should bind',
      env: 'PORT',
      format: 'port',
    },
    publicUrl: {
      default: 'http://localhost:8091',
      env: 'PUBLIC_URL',
      format: 'url',
    },
    hotReloadWebsocket: {
      default: 'ws://localhost:8092/ws',
      env: 'HOT_RELOAD_WEBSOCKET',
      format: String,
    },
    useHttps: {
      default: false,
      doc: 'set to true to serve directly over https',
      env: 'USE_TLS',
    },
  },
  logging: {
    app: { default: 'fxa-admin-panel' },
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
  servers: {
    admin: {
      url: {
        default: 'http://localhost:8095',
        doc: 'The url of the fxa-admin-server instance',
        env: 'ADMIN_SERVER_URL',
        format: 'url',
      },
    },
  },
  staticResources: {
    directory: {
      default: 'build',
      doc: 'Directory where static resources are located',
      env: 'STATIC_DIRECTORY',
      format: String,
    },
    maxAge: {
      default: '10 minutes',
      doc: 'Cache max age for static assets, in ms',
      env: 'STATIC_MAX_AGE',
      format: 'duration',
    },
    url: {
      default: 'http://localhost:8091',
      doc: 'The origin of the static resources',
      env: 'STATIC_RESOURCE_URL',
      format: 'url',
    },
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
  ...GuardConfig,
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

let envConfig = path.join(__dirname, `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });

const Config = conf;

export type AppConfig = typeof Config;

export default Config;
