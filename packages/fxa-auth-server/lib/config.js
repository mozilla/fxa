/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const url = require('url');
const path = require('path');
const convict = require('convict');

const AVAILABLE_BACKENDS = ["memory", "mysql", "memcached"];


var conf = module.exports = convict({
  env: {
    doc: "The current node.js environment",
    default: "production",
    format: [ "production", "local", "test" ],
    env: 'NODE_ENV'
  },
  public_url: {
    format: "url",
    // the real url is set by awsbox
    default: "http://127.0.0.1:9000"
  },
  domain: {
    format: "url",
    default: "127.0.0.1:9000"
  },
  secretKeyFile: {
    default: path.resolve(__dirname, '../config/secret-key.json')
  },
  publicKeyFile: {
    default: path.resolve(__dirname, '../config/public-key.json')
  },
  kvstore: {
    cache: {
      format: AVAILABLE_BACKENDS,
      default: 'memory',
      env: 'KVSTORE_CACHE'
    },
    backend: {
      format: AVAILABLE_BACKENDS,
      default: "memory",
      env: 'KVSTORE_BACKEND'
    },
    available_backends: {
      doc: "List of available key-value stores",
      default: AVAILABLE_BACKENDS
    }
  },
  memcached: {
    hosts: {
      default: '127.0.0.1:11211'
    },
    lifetime: {
      default: 1000 * 60 * 2
    }
  },
  mysql: {
    user: {
      default: 'root',
      env: 'MYSQL_USERNAME'
    },
    password: {
      default: '',
      env: 'MYSQL_PASSWORD'
    },
    database: {
      default: 'picl',
      env: 'MYSQL_DATABASE'
    },
    host: {
      default: '127.0.0.1',
      env: 'MYSQL_HOST'
    },
    port: {
      default: '3306',
      env: 'MYSQL_PORT'
    },
    create_schema: {
      default: true,
      env: 'CREATE_MYSQL_SCHEMA'
    },
    max_query_time_ms: {
      doc: "The maximum amount of time we'll allow a query to run before considering the database to be sick",
      default: 5000,
      format: 'duration',
      env: 'MAX_QUERY_TIME_MS'
    },
    max_reconnect_attempts: {
      doc: "The maximum number of times we'll attempt to reconnect to the database before failing all outstanding queries",
      default: 3,
      format: 'nat'
    }
  },
  bind_to: {
    host: {
      doc: "The ip address the server should bind",
      default: '127.0.0.1',
      format: 'ipaddress',
      env: 'IP_ADDRESS'
    },
    port: {
      doc: "The port the server should bind",
      default: 9000,
      format: 'port',
      env: 'PORT'
    }
  }
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES) {
  var files = process.env.CONFIG_FILES.split(',');
  conf.loadFile(files);
}

// set the public url as the issuer domain for assertions
conf.set('domain', url.parse(conf.get('public_url')).host);


// generate keys if they don't exist
if (!fs.existsSync(conf.get('publicKeyFile'))) {
  require('../scripts/gen_keys');
}

conf.validate();

console.log('configuration: ', conf.toString());
