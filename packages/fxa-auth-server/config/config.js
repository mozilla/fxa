/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (fs, path, url, convict) {
  const AVAILABLE_BACKENDS = ["memory", "mysql", "memcached"]
  const STATS_BACKENDS = ['none', 'heka', 'statsd']


  var conf = convict({
    env: {
      doc: "The current node.js environment",
      default: "production",
      format: [ "production", "local", "test" ],
      env: 'NODE_ENV'
    },
    log: {
      level: {
        default: 'info'
      },
      path: {
        default: path.join(__dirname, '../server.log')
      },
      period: {
        default: '1d'
      },
      count: {
        default: 7
      }
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
    },
    stats: {
      backend: {
        format: STATS_BACKENDS,
        default: 'none',
        env: 'STATS_BACKEND'
      }
    },
    heka: {
      host: {
        default: '127.0.0.1'
      },
      port: {
        default: 4880
      }
    },
    statsd: {
      host: {
        default: '127.0.0.1',
      },
      port: {
        default: 8125
      }
    },
    srp: {
      alg_name: {
        doc: "Name of secure hash algorithm to use",
        default: 'sha256',
        env: 'SRP_HASH_ALGORITHM'
      },
      N_bits: {
        doc: "Size of N",
        default: 2048,
        format: 'nat',
        env: 'SRP_N_BITS'
      },
      s_bytes: {
        doc: "Bytes in salt",
        default: 32,
        format: 'nat',
        env: 'SRP_S_BYTES'
      }
    },
    smtp: {
      listen: {
        host: {
          doc: 'host for bin/mailer.js',
          default: '127.0.0.1',
          env: 'MAILER_HOST'
        },
        port: {
          doc: 'port for bin/mailer.js',
          default: 9999,
          env: 'MAILER_PORT'
        }
      },
      host: {
        doc: 'SMTP host for sending email',
        default: 'smtp.gmail.com',
        env: 'SMTP_HOST'
      },
      port: {
        doc: 'SMTP port',
        default: 465,
        env: 'SMTP_PORT'
      },
      secure: {
        doc: 'Connect to SMTP host securely',
        default: true,
        env: 'SMTP_SECURE'
      },
      user: {
        doc: 'SMTP username',
        default: '',
        env: 'SMTP_USER'
      },
      password: {
        doc: 'SMTP password',
        default: '',
        env: 'SMTP_PASS'
      },
      sender: {
        doc: 'email address of the sender',
        default: '',
        env: 'SMTP_SENDER'
      }
    },
    dev: {
      verified: {
        doc: 'new Accounts should start already verified',
        default: false,
        env: 'DEV_VERIFIED'
      }
    }
  })

  // handle configuration files.  you can specify a CSV list of configuration
  // files to process, which will be overlayed in order, in the CONFIG_FILES
  // environment variable
  if (process.env.CONFIG_FILES) {
    var files = process.env.CONFIG_FILES.split(',').filter(fs.existsSync)

    conf.loadFile(files)
  }

  // set the public url as the issuer domain for assertions
  conf.set('domain', url.parse(conf.get('public_url')).host)

  conf.validate()

  return conf
}
