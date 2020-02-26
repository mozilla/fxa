/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import fs from 'fs';
import path from 'path';

const conf = convict({
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'production', 'test'],
  },
  proxyStaticResourcesFrom: {
    default: '',
    doc:
      'Instead of loading static resources from disk, get them by proxy from this URL (typically a special reloading dev server)',
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
  listen: {
    host: {
      default: '127.0.0.1',
      doc: 'The ip address the server should bind',
      env: 'IP_ADDRESS',
      format: 'ipaddress',
    },
    port: {
      default: 8091,
      doc: 'The port the server should bind',
      env: 'PORT',
      format: 'port',
    },
    publicUrl: {
      default: 'http://127.0.0.1:8091',
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
        default: 'http://127.0.0.1:8090',
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
      default: 'http://127.0.0.1:8091',
      doc: 'The origin of the static resources',
      env: 'STATIC_RESOURCE_URL',
      format: 'url',
    },
  },
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

export default Config;
