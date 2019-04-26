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
  staticResources: {
    directory: {
      doc: 'Directory where static resources are located',
      default: 'static',
      format: String,
      env: 'STATIC_DIRECTORY'
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
  env: {
    doc: 'The current node.js environment',
    default: 'production',
    format: [ 'development', 'production' ],
    env: 'NODE_ENV'
  },
  listen: {
    host: {
      doc: 'The ip address the server should bind',
      default: '127.0.0.1',
      format: 'ipaddress',
      env: 'IP_ADDRESS'
    },
    port: {
      doc: 'The port the server should bind',
      default: 3031,
      format: 'port',
      env: 'PORT'
    },
    useHttps: {
      doc: 'set to true to serve directly over https',
      env: 'USE_TLS',
      default: false
    },
    publicUrl: {
      format: 'url',
      default: 'http://127.0.0.1:3031',
      env: 'PUBLIC_URL'
    },
  },
  logging: {
    app: { default: 'fxa-payments-server' },
    fmt: {
      default: 'heka',
      format: [
        'heka',
        'pretty'
      ],
      env: 'LOGGING_FORMAT'
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
  servers: {
    content: {
      url: {
        doc: 'The url of the corresponding fxa-content-server instance',
        default: 'http://127.0.0.1:3030',
        env: 'CONTENT_SERVER_URL'
      }
    },
    oauth: {
      url: {
        doc: 'The url of the corresponding fxa-oauth-server instance',
        default: 'http://127.0.0.1:9010',
        env: 'OAUTH_SERVER_URL'
      }
    },
    profile: {
      url: {
        doc: 'The url of the corresponding fxa-profile-server instance',
        default: 'http://127.0.0.1:1111',
        env: 'PROFILE_SERVER_URL'
      }
    },
  },
  hstsMaxAge: {
    default: 15552000, // 180 days
    doc: 'Max age of the STS directive in seconds',
    // Note: This format is a number because the value needs to be in seconds
    format: Number
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
