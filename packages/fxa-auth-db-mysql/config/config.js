/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (fs, path, url, convict) {
  var conf = convict({
    env: {
      doc: 'The current node.js environment',
      default: 'prod',
      format: ['dev', 'test', 'stage', 'prod'],
      env: 'NODE_ENV',
    },
    hostname: {
      doc: 'The IP address the server should bind to',
      default: 'localhost',
      env: 'HOST',
    },
    port: {
      doc: 'The port the server should bind to',
      default: 8000,
      format: 'port',
      env: 'PORT',
    },
    logging: {
      app: {
        default: 'fxa-auth-db-server',
      },
      fmt: {
        format: ['heka', 'pretty'],
        default: 'heka',
      },
      level: {
        env: 'LOG_LEVEL',
        default: 'info',
      },
      uncaught: {
        format: ['exit', 'log', 'ignore'],
        default: 'exit',
      },
    },
    patchKey: {
      doc:
        'The name of the row in the dbMetadata table which stores the patch level',
      default: 'schema-patch-level',
      env: 'SCHEMA_PATCH_KEY',
    },
    enablePruning: {
      doc: 'Enables (true) or disables (false) pruning',
      default: false,
      format: Boolean,
      env: 'ENABLE_PRUNING',
    },
    pruneEvery: {
      doc: 'Approximate time between prunes (in ms)',
      default: '1 hour',
      format: 'duration',
      env: 'PRUNE_EVERY',
    },
    pruneTokensMaxAge: {
      // This setting must always be older than token lifetimes in the fxa-auth-server
      doc:
        'Time after which to prune account, password and unblock tokens (in ms)',
      default: '3 months',
      format: 'duration',
      env: 'PRUNE_TOKENS_MAX_AGE',
    },
    signinCodesMaxAge: {
      doc: 'Maximum age for signinCodes, after which they will expire',
      default: '2 days',
      format: 'duration',
      env: 'SIGNIN_CODES_MAX_AGE',
    },
    requiredSQLModes: {
      doc:
        'Comma-separated list of SQL mode flags to enforce on each connection',
      default: '',
      format: 'String',
      env: 'REQUIRED_SQL_MODES',
    },
    master: {
      user: {
        doc: 'The user to connect to for MySql',
        default: 'root',
        env: 'MYSQL_USER',
      },
      password: {
        doc: 'The password to connect to for MySql',
        default: '',
        env: 'MYSQL_PASSWORD',
      },
      host: {
        doc: 'The host to connect to for MySql',
        default: 'localhost',
        env: 'MYSQL_HOST',
      },
      port: {
        doc: 'The port to connect to for MySql',
        default: 3306,
        format: 'port',
        env: 'MYSQL_PORT',
      },
      connectionLimit: {
        doc: 'The maximum number of connections to create at once.',
        default: 10,
        format: 'nat',
        env: 'MYSQL_CONNECTION_LIMIT',
      },
      waitForConnections: {
        doc:
          "Determines the pool's action when no connections are available and the limit has been reached.",
        default: true,
        format: Boolean,
        env: 'MYSQL_WAIT_FOR_CONNECTIONS',
      },
      queueLimit: {
        doc:
          "Determines the maximum size of the pool's waiting-for-connections queue.",
        default: 100,
        format: 'nat',
        env: 'MYSQL_QUEUE_LIMIT',
      },
    },
    slave: {
      user: {
        doc: 'The user to connect to for MySql',
        default: 'root',
        env: 'MYSQL_SLAVE_USER',
      },
      password: {
        doc: 'The password to connect to for MySql',
        default: '',
        env: 'MYSQL_SLAVE_PASSWORD',
      },
      host: {
        doc: 'The host to connect to for MySql',
        default: 'localhost',
        env: 'MYSQL_SLAVE_HOST',
      },
      port: {
        doc: 'The port to connect to for MySql',
        default: 3306,
        format: 'port',
        env: 'MYSQL_SLAVE_PORT',
      },
      connectionLimit: {
        doc: 'The maximum number of connections to create at once.',
        default: 10,
        format: 'nat',
        env: 'MYSQL_SLAVE_CONNECTION_LIMIT',
      },
      waitForConnections: {
        doc:
          "Determines the pool's action when no connections are available and the limit has been reached.",
        default: true,
        format: Boolean,
        env: 'MYSQL_SLAVE_WAIT_FOR_CONNECTIONS',
      },
      queueLimit: {
        doc:
          "Determines the maximum size of the pool's waiting-for-connections queue.",
        default: 100,
        format: 'nat',
        env: 'MYSQL_SLAVE_QUEUE_LIMIT',
      },
    },
    ipHmacKey: {
      doc: 'A secret to hash IP addresses for security history events',
      default: 'changeme',
      env: 'IP_HMAC_KEY',
    },
    sentryDsn: {
      doc: 'Sentry DSN for error and log reporting',
      default: '',
      format: 'String',
      env: 'SENTRY_DSN',
    },
    recoveryCodes: {
      length: {
        doc: 'The length of a recovery code',
        default: 10,
        format: 'nat',
        env: 'RECOVERY_CODE_LENGTH',
      },
    },
  });

  // handle configuration files. you can specify a CSV list of configuration
  // files to process, which will be overlayed in order, in the CONFIG_FILES
  // environment variable. By default, the ./config/<env>.json file is loaded.

  var envConfig = path.join(__dirname, conf.get('env') + '.json');
  envConfig = envConfig + ',' + process.env.CONFIG_FILES;

  var files = envConfig.split(',').filter(fs.existsSync);
  conf.loadFile(files);
  conf.validate({ allowed: 'strict' });

  return conf.getProperties();
};
