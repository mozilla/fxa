/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const convict = require('convict');

const conf = convict({
  admin: {
    whitelist: {
      doc: 'An array of regexes. Passing any one will get through.',
      default: ['@mozilla\\.com$']
    }
  },
  api: {
    version: {
      doc: 'Number part of versioned endpoints - ex: /v1/token',
      default: 1
    }
  },
  browserid: {
    issuer: {
      doc: 'We only accept assertions from this issuer',
      env: 'ISSUER',
      default: 'api.accounts.firefox.com'
    },
    verificationUrl: {
      doc: 'URL to the remote verifier we will use for fxa-assertions',
      format: 'url',
      env: 'VERIFICATION_URL',
      default: 'https://verifier.accounts.firefox.com/v2'
    }
  },
  clients: {
    doc: 'Some pre-defined clients that will be inserted into the DB',
    default: []
  },
  contentUrl: {
    doc: 'URL to UI page in fxa-content-server that starts OAuth flow',
    format: 'url',
    env: 'CONTENT_URL',
    default: 'https://accounts.firefox.com/oauth/'
  },
  db: {
    driver: {
      env: 'DB',
      format: ['mysql', 'memory'],
      default: 'memory'
    }
  },
  encrypt: {
    hashAlg: {
      doc: 'Hash algorithm for storing secrets/codes/tokens.',
      default: 'sha256'
    }
  },
  env: {
    arg: 'node-env',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['dev', 'test', 'stage', 'prod'],
    default: 'prod'
  },
  events: {
    region: {
      doc: 'AWS Region of fxa account events',
      format: String,
      default: ''
    },
    queueUrl: {
      doc: 'SQS queue url for fxa account events',
      format: String,
      default: ''
    }
  },
  expiration: {
    code: {
      doc: 'Clients must trade codes for tokens before they expire',
      format: 'duration',
      default: 1000 * 60 * 15
    }
  },
  git: {
    commit: {
      doc: 'Commit SHA when in stage/production',
      format: String,
      default: ''
    }
  },
  localRedirects: {
    doc: 'When true, `localhost` and `127.0.0.1` always are legal redirects.',
    default: false
  },
  logging: {
    app: {
      default: 'fxa-oauth-server'
    },
    level: {
      env: 'LOG_LEVEL',
      default: 'info'
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka'
    }
  },
  mysql: {
    createSchema: {
      env: 'CREATE_MYSQL_SCHEMA',
      default: true
    },
    user: {
      default: 'root',
      env: 'MYSQL_USERNAME'
    },
    password: {
      default: '',
      env: 'MYSQL_PASSWORD'
    },
    database: {
      default: 'fxa_oauth',
      env: 'MYSQL_DATABASE'
    },
    host: {
      default: '127.0.0.1',
      env: 'MYSQL_HOST'
    },
    port: {
      default: '3306',
      env: 'MYSQL_PORT'
    }
  },
  publicUrl: {
    format: 'url',
    env: 'PUBLIC_URL',
    default: 'http://127.0.0.1:9010'
  },
  server: {
    host: {
      env: 'HOST',
      default: '127.0.0.1'
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 9010
    }
  },
  unique: {
    clientSecret: {
      doc: 'Bytes of generated client_secrets',
      default: 32
    },
    code: {
      doc: 'Bytes of generated codes',
      default: 32
    },
    id: {
      doc: 'Bytes of generated DB ids',
      default: 8
    },
    token: {
      doc: 'Bytes of generated tokens',
      default: 32
    }
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);

conf.validate();


module.exports = conf;
