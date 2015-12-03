/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
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
    maxSockets: {
      doc: 'The maximum number of connections that the pool can use at once.',
      default: 10,
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
    },
    autoUpdateClients: {
      doc: 'If true, update clients from config file settings',
      env: 'DB_AUTO_UPDATE_CLIENTS',
      format: Boolean,
      default: true
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
    // in JavaScript, we live in milliseconds
    accessToken: {
      doc: 'Access Tokens maximum expiration (can live shorter)',
      format: 'duration',
      default: '2 weeks'
    },
    code: {
      doc: 'Clients must trade codes for tokens before they expire',
      format: 'duration',
      default: '15 minutes'
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
    },
    connectionLimit: {
      doc: 'The maximum number of connections that the pool can use at once.',
      default: 10
    }
  },
  openid: {
    key: {
      doc: 'Private JWK to sign id_tokens',
      default: {}
    },
    oldKey: {
      doc: 'The previous public key that was used to sign id_tokens',
      default: {}
    },
    issuer: {
      // this should match `issuer` in the 'OpenID Provider Metadata' document
      // from the fxa-content-server
      doc: 'The value of the `iss` property of the id_token',
      default: 'https://accounts.firefox.com'
    },
    ttl: {
      doc: 'Number of milliseconds until id_token should expire',
      default: '5 minutes',
      format: 'duration'
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
  serverInternal: {
    host: {
      env: 'HOST_INTERNAL',
      default: '127.0.0.1'
    },
    port: {
      env: 'PORT_INTERNAL',
      format: 'port',
      default: 9011
    }
  },
  serviceClients: {
    doc: 'Clients that can make oauth requests for any user',
    default: []
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
    },
    developerId: {
      doc: 'Bytes of generated developer ids',
      default: 16
    }
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);

var options = {
  strict: true
};

conf.validate(options);

// custom validation, since we cant yet specify rules for inside arrays
conf.get('serviceClients').forEach(function(client) {
  assert(client.id, 'client id required');
  assert.equal(client.id.length, 16, 'client id must be 16 hex digits');
  assert.equal(Buffer(client.id, 'hex').toString('hex'), client.id,
    'client id must be 16 hex digits');
  assert.equal(typeof client.name, 'string', 'client name required');
  assert.equal(typeof client.scope, 'string', 'client scope required');
  assert.equal(typeof client.jku, 'string', 'client jku required');
});

var key = conf.get('openid.key');
assert.equal(key.kty, 'RSA', 'openid.key.kty must be RSA');
assert(key.kid, 'openid.key.kid is required');
assert(key.n, 'openid.key.n is required');
assert(key.e, 'openid.key.e is required');
assert(key.d, 'openid.key.d is required');

var oldKey = conf.get('openid.oldKey');
if (Object.keys(oldKey).length) {
  assert.equal(oldKey.kty, 'RSA', 'openid.oldKey.kty must be RSA');
  assert(oldKey.kid, 'openid.oldKey.kid is required');
  assert.notEqual(key.kid, oldKey.kid,
    'openid.key.kid must differ from oldKey');
  assert(oldKey.n, 'openid.oldKey.n is required');
  assert(oldKey.e, 'openid.oldKey.e is required');
  assert(!oldKey.d, 'openid.oldKey.d is forbidden');
}

module.exports = conf;
