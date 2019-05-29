/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const fs = require('fs');
const path = require('path');
const convict = require('convict');

const conf = convict({
  clientAddressDepth: {
    default: 3,
    doc: 'location of the client ip address in the remote address chain',
    env: 'CLIENT_ADDRESS_DEPTH',
    format: Number
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: [ 'development', 'production' ],
  },
  hstsMaxAge: {
    default: 15552000, // 180 days
    doc: 'Max age of the STS directive in seconds',
    // Note: This format is a number because the value needs to be in seconds
    format: Number
  },
  listen: {
    host: {
      default: '127.0.0.1',
      doc: 'The ip address the server should bind',
      env: 'IP_ADDRESS',
      format: 'ipaddress',
    },
    port: {
      default: 3031,
      doc: 'The port the server should bind',
      env: 'PORT',
      format: 'port',
    },
    publicUrl: {
      default: 'http://127.0.0.1:3031',
      env: 'PUBLIC_URL',
      format: 'url',
    },
    useHttps: {
      default: false,
      doc: 'set to true to serve directly over https',
      env: 'USE_TLS',
    },
  },
  logging: {
    app: { default: 'fxa-payments-server' },
    fmt: {
      default: 'heka',
      env: 'LOGGING_FORMAT',
      format: [
        'heka',
        'pretty'
      ],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL'
    },
    routes: {
      enabled: {
        default: true,
        doc: 'Enable route logging. Set to false to trimming CI logs.',
        env: 'ENABLE_ROUTE_LOGGING'
      },
      format: {
        default: 'default_fxa',
        format: [
          'default_fxa',
          'dev_fxa',
          'default',
          'dev',
          'short',
          'tiny'
        ]
      },
    },
  },
  proxyStaticResourcesFrom: {
    default: '',
    doc: 'Instead of loading static resources from disk, get them by proxy from this URL (typically a special reloading dev server)',
    env: 'PROXY_STATIC_RESOURCES_FROM',
    format: String,
  },
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN',
    env: 'SENTRY_DSN',
    format: 'String',
  },
  servers: {
    content: {
      url: {
        default: 'http://127.0.0.1:3030',
        doc: 'The url of the corresponding fxa-content-server instance',
        env: 'CONTENT_SERVER_URL',
        format: 'url',
      }
    },
    oauth: {
      url: {
        default: 'http://127.0.0.1:9010',
        doc: 'The url of the corresponding fxa-oauth-server instance',
        env: 'OAUTH_SERVER_URL',
        format: 'url',
      }
    },
    profile: {
      url: {
        default: 'http://127.0.0.1:1111',
        doc: 'The url of the corresponding fxa-profile-server instance',
        env: 'PROFILE_SERVER_URL',
        format: 'url',
      }
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
      format: 'duration'
    },
    url: {
      default: 'http://127.0.0.1:3031',
      doc: 'The origin of the static resources',
      env: 'STATIC_RESOURCE_URL',
      format: 'url'
    }
  },
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

let envConfig = path.join(__dirname, `${conf.get('env')  }.json`);
envConfig = `${envConfig  },${  process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });

module.exports = conf;
