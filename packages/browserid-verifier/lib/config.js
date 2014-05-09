/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var convict = require('convict');

function loadConf() {
  var conf = convict({
    ip: {
      doc: "The IP address to bind.",
      format: "ipaddress",
      default: "127.0.0.1",
      env: "IP_ADDRESS",
    },
    port: {
      doc: "The port to bind.",
      format: "port",
      default: 0,
      env: "PORT"
    },
    fallback: {
      doc: "The domain of the fallback server, authoritative when lookup fails.",
      format: String,
      default: "",
      env: "FALLBACK_DOMAIN"
    },
    httpTimeout: {
      doc: "(s) how long to spend attempting to fetch support documents",
      format: Number,
      default: 8.0,
      env: "HTTP_TIMEOUT"
    },
    insecureSSL: {
      doc: "(testing only) Ignore invalid SSL certificates",
      format: Boolean,
      default: false,
      env: "INSECURE_SSL"
    },
    allowURLOmission: {
      doc: "(temporary hack) Allow missing URLs in support documents",
      format: Boolean,
      default: false,
      env: "ALLOW_URL_OMISSION"
    },
    toobusy: {
      maxLag: {
        doc: "Max event-loop lag before toobusy reports failure",
        format: Number,
        default: 70,
        env: 'TOOBUSY_MAX_LAG'
      }
    },
    computecluster: {
      maxProcesses: {
        doc: "Max worker processes to spawn for the compute cluster",
        format: Number,
        default: undefined,
        env: 'COMPUTECLUSTER_MAX_PROCESSES'
      },
      maxBacklog: {
        doc: "Max length of work queue for the compute cluster",
        format: Number,
        default: undefined,
        env: 'COMPUTECLUSTER_MAX_BACKLOG'
      }
    },
    logging: {
      formatters: {
        doc: "Formatters for intel loggers.",
        env: 'LOG_FORMATTERS',
        format: Object,
        default: {
          pretty: {
            format: "[%(date)s] %(name)s.%(levelname)s: %(message)s",
            colorize: true
          },
          json: {
            class: '../log/json',
            format: '%O'
          }
        }
      },
      handlers: {
        doc: 'Handlers deliver log messages to different destinations',
        format: Object,
        default: {
          console: {
            "class": "intel/handlers/console",
            "formatter": "pretty"
          }
        }
      },
      loggers: {
        doc: 'intel Loggers',
        format: Object,
        default: {
          bid: {
            level: "DEBUG",
            handlers: ["console"],
            propagate: false,
            handleExceptions: true,
            exitOnError: false
          },
          'bid.summary': {
            // Don't log detailed summary information by default.
            // This gets explicitly enabled in production.
            level: 'INFO',
            propagate: false,
            handlers: []
          }
        }
      },
      root: {
        doc: 'Path used for finding relative classes',
        default: __filename
      }
    },
    testServiceFailure: {
      doc: "(testing only) trigger a service failure in the verifier",
      format: Boolean,
      default: false,
      env: "TEST_SERVICE_FAILURE"
    },
  });

  // load environment dependent configuration
  if (process.env.CONFIG_FILES) {
    var files = process.env.CONFIG_FILES.split(',');
    files.forEach(function(file) {
      conf.loadFile(file);
    });
  }

  // validation configuration
  conf.validate();

  module.exports = conf;

  process.nextTick(function() {
    require('./log').getLogger('bid.config')
      .debug("current configuration:", JSON.stringify(conf.get(), null, 2));
  });
}

loadConf();

// command line options

var args = require('optimist')
.alias('h', 'help')
.describe('h', 'display this usage message')
.alias('c', 'config')
.describe('c', 'Display current configuration.');

var argv = args.argv;

if (argv.h) {
  args.showHelp();
  process.exit(1);
}

if (argv.c) {
  console.log(module.exports.get());
  process.exit(0);
}
