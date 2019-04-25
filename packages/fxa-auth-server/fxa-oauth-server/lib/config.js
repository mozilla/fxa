/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const convict = require('convict');
var DEFAULT_SUPPORTED_LANGUAGES = require('fxa-shared').l10n.supportedLanguages;

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
  allowHttpRedirects: {
    arg: 'allowHttpRedirects',
    doc: 'If true, then it allows http OAuth redirect uris',
    env: 'ALLOW_HTTP_REDIRECTS',
    format: Boolean,
    default: false
  },
  authServerSecrets: {
    doc: 'Comma-separated list of secret keys for verifying server-to-server JWTs',
    env: 'AUTH_SERVER_SECRETS',
    format: Array,
    default: []
  },
  browserid: {
    issuer: {
      doc: 'We only accept assertions from this issuer',
      env: 'ISSUER',
      default: 'api.accounts.firefox.com'
    },
    maxSockets: {
      doc: 'The maximum number of connections that the pool can use at once.',
      env: 'BROWSERID_MAX_SOCKETS',
      default: 10
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
    env: 'OAUTH_CLIENTS',
    default: []
  },
  clientManagement: {
    enabled: {
      doc: 'Enable client management in OAuth server routes. Do NOT set this to true in production.',
      default: false,
      format: Boolean,
      env: 'CLIENT_MANAGEMENT_ENABLED'
    }
  },
  clientIdToServiceNames: {
    doc: 'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
    format: Object,
    default: {},
    env: 'OAUTH_CLIENT_IDS'
  },
  disabledClients: {
    doc: 'Comma-separated list of client ids for which service should be temporarily refused',
    env: 'OAUTH_CLIENTS_DISABLED',
    format: Array,
    default: []
  },
  scopes: {
    doc: 'Some pre-defined list of scopes that will be inserted into the DB',
    env: 'OAUTH_SCOPES',
    default: []
  },
  clientAddressDepth: {
    doc: 'location of the client ip address in the remote address chain',
    format: Number,
    env: 'CLIENT_ADDRESS_DEPTH',
    default: 3
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
  env: {
    arg: 'node-env',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['dev', 'test', 'stage', 'prod'],
    default: 'prod'
  },
  events: {
    enabled: {
      doc: 'Whether or not config.events has to be properly set in production',
      format: Boolean,
      default: true,
      env: 'EVENTS_ENABLED'
    },
    region: {
      doc: 'AWS Region of fxa account events',
      format: String,
      default: '',
      env: 'FXA_EVENTS_REGION'
    },
    queueUrl: {
      doc: 'SQS queue url for fxa account events',
      format: String,
      default: '',
      env: 'FXA_EVENTS_QUEUE_URL'
    }
  },
  expiration: {
    accessToken: {
      doc: 'Access Tokens maximum expiration (can live shorter)',
      format: 'duration',
      default: '2 weeks',
      env: 'FXA_EXPIRATION_ACCESS_TOKEN'
    },
    accessTokenExpiryEpoch: {
      doc: 'Timestamp after which access token expiry is actively enforced',
      format: 'timestamp',
      default: '2017-01-01',
      env: 'FXA_EXPIRATION_ACCESS_TOKEN_EXPIRY_EPOCH'
    },
    code: {
      doc: 'Clients must trade codes for tokens before they expire',
      format: 'duration',
      default: '15 minutes',
      env: 'FXA_EXPIRATION_CODE'
    }
  },
  refreshToken: {
    updateAfter: {
      doc: 'lastUsedAt only gets updated after this delay',
      format: 'duration',
      default: '24 hours',
      env: 'FXA_REFRESH_TOKEN_UPDATE_AFTER'
    }
  },
  git: {
    commit: {
      doc: 'Commit SHA when in stage/production',
      format: String,
      default: ''
    }
  },
  jwtAccessTokens: {
    enabled: {
      doc: 'Whether or not JWT access tokens are enabled',
      format: Boolean,
      default: true,
      env: 'JWT_ACCESS_TOKENS_ENABLED'
    },
    enabledClientIds: {
      doc: 'JWT access tokens are only returned for client_ids in this list',
      format: Array,
      default: [],
      env: 'JWT_ACCESS_TOKENS_ENABLED_CLIENT_IDS'
    }
  },
  localRedirects: {
    doc: 'When true, `localhost` and `127.0.0.1` always are legal redirects.',
    default: false,
    env: 'FXA_OAUTH_LOCAL_REDIRECTS'
  },
  logging: {
    app: {
      default: 'fxa-oauth-server',
      env: 'LOG_APP'
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL'
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka',
      env: 'LOG_FORMAT'
    }
  },
  mysql: {
    createSchema: {
      default: true,
      env: 'CREATE_MYSQL_SCHEMA'
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
      default: 10,
      env: 'MYSQL_CONNECTION_LIMIT'
    }
  },
  openid: {
    keyFile: {
      doc: 'Path to Private key JWK to sign id_tokens',
      format: String,
      default: '',
      env: 'FXA_OPENID_KEYFILE'
    },
    oldKeyFile: {
      doc: 'Path to previous key that was used to sign id_tokens',
      format: String,
      default: '',
      env: 'FXA_OPENID_OLDKEYFILE'
    },
    key: {
      doc: 'Private JWK to sign id_tokens',
      default: {},
      env: 'FXA_OPENID_KEY'
    },
    oldKey: {
      doc: 'The previous public key that was used to sign id_tokens',
      default: {},
      env: 'FXA_OPENID_OLDKEY'
    },
    issuer: {
      // this should match `issuer` in the 'OpenID Provider Metadata' document
      // from the fxa-content-server
      doc: 'The value of the `iss` property of the id_token',
      default: 'https://accounts.firefox.com',
      env: 'FXA_OPENID_ISSUER'
    },
    ttl: {
      doc: 'Number of milliseconds until id_token should expire',
      default: '5 minutes',
      format: 'duration',
      env: 'FXA_OPENID_TTL'
    }
  },
  publicUrl: {
    format: 'url',
    default: 'http://127.0.0.1:9010',
    env: 'PUBLIC_URL'
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
  i18n: {
    defaultLanguage: {
      format: String,
      default: 'en',
      env: 'DEFAULT_LANG'
    },
    supportedLanguages: {
      format: Array,
      default: DEFAULT_SUPPORTED_LANGUAGES,
      env: 'SUPPORTED_LANGS'
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
    },
    developerId: {
      doc: 'Bytes of generated developer ids',
      default: 16
    }
  },
  cacheControl: {
    doc: 'Hapi: a string with the value of the "Cache-Control" header when caching is disabled',
    format: String,
    default: 'private, no-cache, no-store, must-revalidate'
  },
  sentryDsn: {
    doc: 'Sentry DSN for error and log reporting',
    default: '',
    format: 'String',
    env: 'SENTRY_DSN'
  }
});

var envConfig = path.join(__dirname, '..', 'config', conf.get('env') + '.json');
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync);
conf.loadFile(files);

var options = {
  allowed: 'strict'
};

conf.validate(options);

// Replace openid key if file specified
if (conf.get('openid.keyFile')){
  conf.set('openid.key', require(conf.get('openid.keyFile')));
}

if (conf.get('openid.oldKeyFile')){
  conf.set('openid.oldKey', require(conf.get('openid.oldKeyFile')));
}

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
  assert(! oldKey.d, 'openid.oldKey.d is forbidden');
}

module.exports = conf;
