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
    log: {
      level: {
        default: 'trace',
        env: 'LOG_LEVEL',
      },
    },
    publicUrl: {
      format: 'url',
      default: 'http://localhost:7000',
      env: 'PUBLIC_URL',
    },
    listen: {
      host: {
        doc: 'The ip address the server should bind',
        default: 'localhost',
        format: String,
        env: 'IP_ADDRESS',
      },
      port: {
        doc: 'The port the server should bind',
        default: 7000,
        format: 'port',
        env: 'PORT',
      },
    },
    updatePollIntervalSeconds: {
      doc: 'interval to check cache for new limits / allowedIPs. 0 is off',
      default: 0,
      format: 'nat',
      env: 'UPDATE_POLL_INTERVAL_SECONDS',
    },
    limits: {
      blockIntervalSeconds: {
        doc: 'Duration of a manual `block` ban',
        default: 60 * 60 * 24,
        format: 'nat',
        env: 'BLOCK_INTERVAL_SECONDS',
      },
      suspectInterval: {
        doc:
          'Duration of a `suspect` flag, instigated by the Dataflow pipeline',
        default: '1 day',
        env: 'SUSPECT_INTERVAL',
        format: 'duration',
      },
      disableInterval: {
        doc:
          'Duration of a long-term `disable` flag, instigated by the Dataflow pipeline',
        default: '1 year',
        env: 'DISABLE_INTERVAL',
        format: 'duration',
      },
      rateLimitIntervalSeconds: {
        doc: 'Duration of automatic throttling',
        default: 60 * 15,
        format: 'nat',
        env: 'RATE_LIMIT_INTERVAL_SECONDS',
      },
      maxEmails: {
        doc:
          'Number of emails sent within rateLimitIntervalSeconds before throttling',
        default: 3,
        format: 'nat',
        env: 'MAX_EMAILS',
      },
      maxBadLogins: {
        doc:
          'Number failed login attempts within rateLimitIntervalSeconds before throttling',
        default: 2,
        format: 'nat',
        env: 'MAX_BAD_LOGINS',
      },
      maxBadLoginsPerIp: {
        doc:
          'Number failed login attempts within rateLimitIntervalSeconds on a single IP before throttling',
        default: 3,
        format: 'nat',
        env: 'MAX_BAD_LOGINS_PER_IP',
      },
      maxUnblockAttempts: {
        doc: 'Number of login attempts that can be unblocked',
        default: 5,
        env: 'MAX_UNBLOCK_ATTEMPTS',
        format: 'nat',
      },
      maxVerifyCodes: {
        doc:
          'Number code verifictions within rateLimitIntervalSeconds before throttling',
        default: 10,
        format: 'nat',
        env: 'MAX_VERIFY_CODES',
      },
      badLoginErrnoWeights: {
        doc:
          'Maps bad-login errnos to a weight multipler, because some bad logins are badder than others',
        format: Object,
        env: 'BAD_LOGIN_ERRNO_WEIGHTS',
        default: {
          '102': 2,
          '125': 4,
          '126': 2,
        },
      },
      ipRateLimitIntervalSeconds: {
        doc: 'Duration of automatic throttling for IPs',
        default: 60 * 15,
        format: 'nat',
        env: 'IP_RATE_LIMIT_INTERVAL_SECONDS',
      },
      ipRateLimitBanDurationSeconds: {
        doc: 'Duration of automatic ban for throttled IPs',
        default: 60 * 15,
        format: 'nat',
        env: 'IP_RATE_LIMIT_BAN_DURATION_SECONDS',
      },
      smsRateLimit: {
        limitIntervalSeconds: {
          doc: 'Duration of automatic throttling for sms',
          default: 30 * 60,
          format: 'nat',
          env: 'SMS_RATE_LIMIT_INTERVAL_SECONDS',
        },
        maxSms: {
          doc:
            'Number of sms sent within rateLimitIntervalSeconds before throttling',
          default: 3,
          format: 'nat',
          env: 'MAX_SMS',
        },
      },
      uidRateLimit: {
        limitIntervalSeconds: {
          doc: 'Duration of automatic throttling for uids',
          default: 60 * 15,
          format: 'nat',
          env: 'UID_RATE_LIMIT_INTERVAL_SECONDS',
        },
        banDurationSeconds: {
          doc: 'Duration of automatic ban',
          default: 60 * 15,
          format: 'nat',
          env: 'UID_RATE_LIMIT_BAN_DURATION_SECONDS',
        },
        maxChecks: {
          doc:
            'Number of checks within uidRateLimitBanDurationSeconds before blocking',
          default: 100,
          format: 'nat',
          env: 'UID_RATE_LIMIT',
        },
      },
      maxAccountStatusCheck: {
        doc:
          'Number of account status checks within rateLimitIntervalSeconds before throttling',
        default: 5,
        format: 'nat',
        env: 'MAX_ACCOUNT_STATUS_CHECK',
      },
      maxAccountAccess: {
        doc:
          'Number of account access actions within ipRateLimitIntervalSeconds before throttling',
        default: 5,
        format: 'nat',
        env: 'MAX_ACCOUNT_ACCESS',
      },
    },
    memcache: {
      address: {
        doc: 'Hostname/IP:Port of the memcache server',
        default: 'localhost:11211',
        env: 'MEMCACHE_ADDRESS',
      },
      recordLifetimeSeconds: {
        doc: 'Memcache record expiry',
        default: 900,
        format: 'nat',
        env: 'RECORD_LIFETIME_SECONDS',
      },
    },
    allowedIPs: {
      doc: 'An array of IPs that will not be blocked or rate-limited.',
      format: Array,
      env: 'ALLOWED_IPS',
      default: [],
    },
    allowedEmailDomains: {
      doc:
        'An array of email domains that will not be blocked or rate-limited.',
      format: Array,
      env: 'ALLOWED_EMAIL_DOMAINS',
      // These are emails frequently used for testing purposes
      default: ['restmail.net', 'restmail.dev.lcip.org'],
    },
    allowedPhoneNumbers: {
      doc:
        'An array of phone numbers that will not be blocked or rate-limited.',
      format: Array,
      env: 'ALLOWED_PHONE_NUMBERS',
      default: [],
    },
    requestChecks: {
      treatEveryoneWithSuspicion: {
        doc: 'Whether to flag all requests as suspicious by default',
        format: Boolean,
        default: false,
        env: 'TREAT_EVERYONE_WITH_SUSPICION',
      },
      flowIdRequiredOnLogin: {
        doc: 'Whether to require a flowId in payload on account login.',
        format: Boolean,
        default: false,
        env: 'FLOW_ID_REQUIRED_ON_LOGIN',
      },
      flowIdExemptUserAgentREs: {
        doc: 'An array of STRING regexes for UAs that dont require a flowId.',
        format: Array,
        default: [],
        env: 'FLOW_ID_EXEMPT_UA_REGEXES',
      },
    },
    ipBlocklist: {
      enable: {
        doc: 'Flag to enable ip blocklist',
        format: Boolean,
        default: false,
        env: 'IP_BLOCKLIST_ENABLE',
      },
      lists: {
        doc: 'An array of ip blocklist file paths that should be blocked',
        format: Array,
        default: [],
        env: 'IP_BLOCKLIST_FILES',
      },
      logOnlyLists: {
        doc: 'An array of ip blocklist file paths that should be logged only',
        format: Array,
        default: [],
        env: 'IP_BLOCKLIST_LOG_ONLY_FILES',
      },
      updatePollInterval: {
        doc: 'Poll interval for checking for updated lists (seconds)',
        default: 300,
        format: 'nat',
        env: 'IP_BLOCKLIST_POLL_INTERVAL_SECONDS',
      },
    },
    reputationService: {
      enable: {
        doc: 'Flag to enable using the IP Reputation Service',
        format: Boolean,
        default: false,
        env: 'REPUTATION_SERVICE_ENABLE',
      },
      enableCheck: {
        doc: 'Flag to enable fetching reputation for IPs on /check route',
        format: Boolean,
        default: false,
        env: 'REPUTATION_SERVICE_ENABLE_CHECK',
      },
      suspectBelow: {
        doc: 'Suspect /check requests from IPs with reputation less than this',
        format: 'int',
        default: 0,
        env: 'REPUTATION_SERVICE_SUSPECT_BELOW',
      },
      blockBelow: {
        doc: 'Block /check requests from IPs with reputation less than this',
        format: 'int',
        default: 0,
        env: 'REPUTATION_SERVICE_BLOCK_BELOW',
      },
      baseUrl: {
        doc: 'The reputation service base url.',
        default: 'http://localhost:8080/',
        format: 'url',
        env: 'REPUTATION_SERVICE_BASE_URL',
      },
      hawkId: {
        doc: 'HAWK ID for sending blocked IPs to the IP Reputation Service',
        default: 'root',
        format: String,
        env: 'REPUTATION_SERVICE_HAWK_ID',
      },
      hawkKey: {
        doc: 'HAWK key for sending blocked IPs to the IP Reputation Service',
        default: 'toor',
        format: String,
        env: 'REPUTATION_SERVICE_HAWK_KEY',
      },
      timeout: {
        doc:
          'timeout in ms to wait for requests sent to the IP Reputation Service',
        default: 50,
        format: 'int',
        env: 'REPUTATION_SERVICE_TIMEOUT',
      },
    },
    sentryDsn: {
      doc: 'Sentry DSN for error and log reporting',
      default: '',
      format: 'String',
      env: 'SENTRY_DSN',
    },
    userDefinedRateLimitRules: {
      totpCodeRules: {
        actions: {
          doc: 'Array of actions that this rule should be applied to',
          default: ['verifyTotpCode'],
          format: Array,
        },
        limits: {
          max: {
            doc:
              'max actions during `period` that can occur before rate limit is applied',
            format: 'nat',
            default: 2,
            env: 'TOTP_CODE_RULE_MAX',
          },
          periodMs: {
            doc: 'period needed before rate limit is reset',
            format: 'duration',
            default: '30 seconds',
            env: 'TOTP_CODE_RULE_PERIOD_MS',
          },
          rateLimitIntervalMs: {
            doc: 'how long rate limit is applied',
            format: 'duration',
            default: '30 seconds',
            env: 'TOTP_CODE_RULE_LIMIT_INTERVAL_MS',
          },
        },
      },
      tokenCodeRules: {
        actions: {
          doc: 'Array of actions that this rule should be applied to',
          default: ['verifyTokenCode'],
          format: Array,
        },
        limits: {
          max: {
            doc:
              'max actions during `period` that can occur before rate limit is applied',
            format: 'nat',
            default: 5,
            env: 'TOKEN_CODE_RULE_MAX',
          },
          periodMs: {
            doc: 'period needed before rate limit is reset',
            format: 'duration',
            default: '15 minutes',
            env: 'TOKEN_CODE_RULE_PERIOD_MS',
          },
          rateLimitIntervalMs: {
            doc: 'how long rate limit is applied',
            format: 'duration',
            default: '15 minutes',
            env: 'TOKEN_CODE_RULE_LIMIT_INTERVAL_MS',
          },
        },
      },
    },
    dataflow: {
      enabled: {
        doc: 'Enable integration with the Dataflow fraud detection pipeline?',
        format: Boolean,
        default: false,
        env: 'DATAFLOW_ENABLED',
      },
      reportOnly: {
        doc:
          'Treat all suggested actions from the Dataflow pipeline as `report`',
        default: true,
        env: 'DATAFLOW_REPORT_ONLY',
        format: Boolean,
      },
      ignoreOlderThan: {
        doc:
          'Ignore messages older than this value. Or set to `0` to never ignore old messages',
        default: '1 day',
        env: 'DATAFLOW_IGNORE_OLDER_THAN',
        format: 'duration',
      },
      gcpPubSub: {
        projectId: {
          doc: 'GCP PubSub project ID',
          default: '',
          format: String,
          env: 'DATAFLOW_GCP_PUBSUB_PROJECT_ID',
        },
        subscriptionName: {
          doc: 'GCP PubSub subscription name',
          default: '',
          format: String,
          env: 'DATAFLOW_GCP_PUBSUB_SUBSCRIPTION_NAME',
        },
      },
    },
  });

  // handle configuration files.  you can specify a CSV list of configuration
  // files to process, which will be overlayed in order, in the CONFIG_FILES
  // environment variable. By default, the ./config/<env>.json file is loaded.

  var envConfig = path.join(
    path.dirname(path.dirname(__dirname)),
    'config',
    conf.get('env') + '.json'
  );
  var files = (envConfig + ',' + process.env.CONFIG_FILES)
    .split(',')
    .filter(fs.existsSync);
  conf.loadFile(files);
  conf.validate({ allowed: 'strict' });

  return conf;
};
