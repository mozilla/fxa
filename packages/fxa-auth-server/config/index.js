/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const convict = require('convict');
const DEFAULT_SUPPORTED_LANGUAGES = require('./supportedLanguages');

const conf = convict({
  env: {
    doc: 'The current node.js environment',
    default: 'prod',
    format: ['dev', 'test', 'stage', 'prod'],
    env: 'NODE_ENV',
  },
  geodb: {
    dbPath: {
      doc: 'Path to the maxmind database file',
      default: path.resolve(__dirname, '../../fxa-geodb/db/cities-db.mmdb'),
      env: 'GEODB_DBPATH',
      format: String,
    },
    enabled: {
      doc: 'kill-switch for geodb',
      default: true,
      env: 'GEODB_ENABLED',
      format: Boolean,
    },
  },
  log: {
    app: {
      default: 'fxa-auth-server',
      env: 'LOG_APP_NAME',
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka',
      env: 'LOG_FORMAT',
    },
  },
  memcached: {
    address: {
      doc:
        'Address:port of the memcached server (or `none` to disable memcached)',
      default: '127.0.0.1:11211',
      env: 'MEMCACHE_METRICS_CONTEXT_ADDRESS',
    },
    idle: {
      doc: 'Idle timeout for memcached connections (milliseconds)',
      format: Number,
      default: 30000,
      env: 'MEMCACHE_METRICS_CONTEXT_IDLE',
    },
    lifetime: {
      doc: 'Lifetime for memcached values (seconds)',
      format: 'nat',
      default: 7200,
      env: 'MEMCACHE_METRICS_CONTEXT_LIFETIME',
    },
  },
  publicUrl: {
    format: 'url',
    default: 'http://127.0.0.1:9000',
    env: 'PUBLIC_URL',
  },
  domain: {
    format: 'url',
    doc: 'Derived automatically from publicUrl',
    default: undefined,
  },
  secretKeyFile: {
    format: String,
    default: path.resolve(__dirname, '../config/secret-key.json'),
    env: 'SECRET_KEY_FILE',
  },
  publicKeyFile: {
    format: String,
    default: path.resolve(__dirname, '../config/public-key.json'),
    env: 'PUBLIC_KEY_FILE',
  },
  oldPublicKeyFile: {
    format: String,
    doc: 'Previous publicKeyFile, used for key rotation',
    default: undefined,
    env: 'OLD_PUBLIC_KEY_FILE',
  },
  vapidKeysFile: {
    doc: 'Keys to use for VAPID in push notifications',
    format: String,
    default: path.resolve(__dirname, '../config/vapid-keys.json'),
    env: 'VAPID_KEYS_FILE',
  },
  db: {
    backend: {
      default: 'httpdb',
      env: 'DB_BACKEND',
    },
    connectionRetry: {
      default: '10 seconds',
      env: 'DB_CONNECTION_RETRY',
      doc: 'Time in milliseconds to retry a database connection attempt',
      format: 'duration',
    },
    connectionTimeout: {
      default: '5 minutes',
      env: 'DB_CONNECTION_TIMEOUT',
      doc:
        'Timeout in milliseconds after which the mailer will stop trying to connect to the database',
      format: 'duration',
    },
    poolee: {
      timeout: {
        default: '5 seconds',
        format: 'duration',
        env: 'DB_POOLEE_TIMEOUT',
        doc: 'Time in milliseconds to wait for db query completion',
      },
      maxPending: {
        default: 1000,
        format: 'int',
        env: 'DB_POOLEE_MAX_PENDING',
        doc: 'Number of pending requests to auth-db-mysql to allow',
      },
    },
  },
  httpdb: {
    url: {
      doc: 'database api url',
      default: 'http://127.0.0.1:8000',
      env: 'HTTPDB_URL',
    },
  },
  listen: {
    host: {
      doc: 'The ip address the server should bind',
      default: '127.0.0.1',
      format: 'ipaddress',
      env: 'IP_ADDRESS',
    },
    port: {
      doc: 'The port the server should bind',
      default: 9000,
      format: 'port',
      env: 'PORT',
    },
  },
  customsUrl: {
    doc: "fraud / abuse server url; set to the string 'none' to disable",
    default: 'http://127.0.0.1:7000',
    env: 'CUSTOMS_SERVER_URL',
  },
  contentServer: {
    url: {
      doc: 'The url of the corresponding fxa-content-server instance',
      default: 'http://127.0.0.1:3030',
      env: 'CONTENT_SERVER_URL',
    },
  },
  emailService: {
    host: {
      doc: 'host for fxa-email-service',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'EMAIL_SERVICE_HOST',
    },
    port: {
      doc: 'port for fxa-email-service',
      format: 'port',
      default: 8001,
      env: 'EMAIL_SERVICE_PORT',
    },
    forcedEmailAddresses: {
      doc:
        'force usage of fxa-email-service when sending emails to addresses that match this pattern',
      format: RegExp,
      default: /emailservice\.[A-Za-z0-9._%+-]+@restmail\.net$/,
      env: 'EMAIL_SERVICE_FORCE_EMAIL_REGEX',
    },
  },
  smtp: {
    api: {
      host: {
        doc: 'host for test/mail_helper.js',
        default: '127.0.0.1',
        env: 'MAILER_HOST',
      },
      port: {
        doc: 'port for test/mail_helper.js',
        default: 9001,
        env: 'MAILER_PORT',
      },
    },
    host: {
      doc: 'SMTP host for sending email',
      default: 'localhost',
      env: 'SMTP_HOST',
    },
    port: {
      doc: 'SMTP port',
      default: 25,
      env: 'SMTP_PORT',
    },
    secure: {
      doc: 'Connect to SMTP host securely',
      default: false,
      env: 'SMTP_SECURE',
    },
    user: {
      doc: 'SMTP username',
      format: String,
      default: undefined,
      env: 'SMTP_USER',
    },
    password: {
      doc: 'SMTP password',
      format: String,
      default: undefined,
      env: 'SMTP_PASS',
    },
    sender: {
      doc: 'email address of the sender',
      default: 'Firefox Accounts <no-reply@lcip.org>',
      env: 'SMTP_SENDER',
    },
    prependVerificationSubdomain: {
      enabled: {
        doc: 'Flag to prepend a verification subdomain to verification emails',
        default: false,
        env: 'PREPEND_VERIFICATION_SUBDOMAIN_ENABLED',
      },
      subdomain: {
        doc: 'Prepend this subdomain',
        format: String,
        default: 'confirm',
        env: 'PREPEND_VERIFICATION_SUBDOMAIN_SUBDOMAIN',
      },
    },
    syncUrl: {
      doc: 'url to Sync product page',
      format: String,
      default: 'https://accounts.firefox.com/connect_another_device/',
    },
    androidUrl: {
      doc: 'url to Android product page',
      format: String,
      default:
        'https://app.adjust.com/2uo1qc?campaign=fxa-conf-email&adgroup=android&creative=button&utm_source=email',
    },
    iosUrl: {
      doc: 'url to IOS product page',
      format: String,
      default:
        'https://app.adjust.com/2uo1qc?campaign=fxa-conf-email&adgroup=ios&creative=button&fallback=https%3A%2F%2Fitunes.apple.com%2Fapp%2Fapple-store%2Fid989804926%3Fpt%3D373246%26ct%3Dadjust_tracker%26mt%3D8&utm_source=email',
    },
    supportUrl: {
      doc: 'url to Mozilla Support product page',
      format: String,
      default:
        'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account',
    },
    redirectDomain: {
      doc: 'Domain that mail urls are allowed to redirect to',
      format: String,
      default: 'firefox.com',
      env: 'REDIRECT_DOMAIN',
    },
    privacyUrl: {
      doc: 'url to Mozilla privacy page',
      format: String,
      default: 'https://www.mozilla.org/privacy',
    },
    passwordManagerInfoUrl: {
      doc: 'url to Firefox password manager information',
      format: String,
      default:
        'https://support.mozilla.org/kb/password-manager-remember-delete-change-and-import#w_viewing-and-deleting-passwords',
    },
    sesConfigurationSet: {
      doc:
        'AWS SES Configuration Set for SES Event Publishing. If defined, ' +
        'X-SES-MESSAGE-TAGS headers will be added to emails. Only ' +
        'intended for Production/Stage use.',
      format: String,
      default: '',
      env: 'SES_CONFIGURATION_SET',
    },
  },
  maxEventLoopDelay: {
    doc: 'Max event-loop delay before which incoming requests are rejected',
    default: 0,
    env: 'MAX_EVENT_LOOP_DELAY',
  },
  scrypt: {
    maxPending: {
      doc: 'Max number of scrypt hash operations that can be pending',
      default: 0,
      env: 'SCRYPT_MAX_PENDING',
    },
  },
  i18n: {
    defaultLanguage: {
      format: String,
      default: 'en',
      env: 'DEFAULT_LANG',
    },
    supportedLanguages: {
      format: Array,
      default: DEFAULT_SUPPORTED_LANGUAGES,
      env: 'SUPPORTED_LANGS',
    },
  },
  redis: {
    host: {
      default: '127.0.0.1',
      env: 'REDIS_HOST',
      format: String,
      doc: 'IP address or host name for Redis server',
    },
    port: {
      default: 6379,
      env: 'REDIS_PORT',
      format: 'port',
      doc: 'Port for Redis server',
    },
    sessionTokens: {
      enabled: {
        default: true,
        doc: 'Enable Redis for session tokens',
        format: Boolean,
        env: 'USE_REDIS',
      },
      prefix: {
        default: 'fxa-auth-session',
        env: 'SESSIONS_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for session tokens in Redis',
      },
      maxConnections: {
        default: 200,
        env: 'REDIS_POOL_MAX_CONNECTIONS',
        format: 'int',
        doc: 'Maximum connection count for the session token Redis pool',
      },
      minConnections: {
        default: 2,
        env: 'REDIS_POOL_MIN_CONNECTIONS',
        format: 'int',
        doc: 'Minimum connection count for the session token Redis pool',
      },
    },
    email: {
      enabled: {
        default: true,
        doc: 'Enable Redis for email config',
        format: Boolean,
        env: 'EMAIL_CONFIG_USE_REDIS',
      },
      prefix: {
        default: 'email:',
        env: 'EMAIL_CONFIG_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for the email config Redis pool',
      },
      maxConnections: {
        default: 10,
        env: 'EMAIL_CONFIG_REDIS_POOL_MAX_CONNECTIONS',
        format: 'int',
        doc: 'Maximum connection count for the email config Redis pool',
      },
      minConnections: {
        default: 1,
        env: 'EMAIL_CONFIG_REDIS_POOL_MIN_CONNECTIONS',
        format: 'int',
        doc: 'Minimum connection count for the email config Redis pool',
      },
    },
    subhub: {
      enabled: {
        default: true,
        doc: 'Enable Redis for subhub responses',
        format: Boolean,
        env: 'SUBHUB_USE_REDIS',
      },
      prefix: {
        default: 'subhub:',
        env: 'SUBHUB_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for subhub responses in Redis',
      },
      maxConnections: {
        default: 10,
        env: 'SUBHUB_REDIS_POOL_MAX_CONNECTIONS',
        format: 'int',
        doc: 'Maximum connection count for the subhub responses Redis pool',
      },
      minConnections: {
        default: 1,
        env: 'SUBHUB_REDIS_POOL_MIN_CONNECTIONS',
        format: 'int',
        doc: 'Minimum connection count for the subhub responses Redis pool',
      },
    },
    maxPending: {
      default: 1000,
      env: 'REDIS_POOL_MAX_PENDING',
      format: 'int',
      doc: 'Pending request limit for Redis',
    },
    retryCount: {
      default: 5,
      env: 'REDIS_POOL_RETRY_COUNT',
      format: 'int',
      doc: 'Retry limit for Redis connection attempts',
    },
    initialBackoff: {
      default: '100 milliseconds',
      env: 'REDIS_POOL_TIMEOUT',
      format: 'duration',
      doc:
        'Initial backoff for Redis connection retries, increases exponentially with each attempt',
    },
  },
  subhubServerMessaging: {
    region: {
      doc: 'The region where the queues live',
      format: String,
      env: 'SUBHUB_REGION',
      default: '',
    },
    subhubUpdatesQueueUrl: {
      doc:
        'The queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'SUBHUB_QUEUE_URL',
      default: '',
    },
  },
  tokenLifetimes: {
    accountResetToken: {
      format: 'duration',
      env: 'ACCOUNT_RESET_TOKEN_TTL',
      default: '15 minutes',
    },
    passwordForgotToken: {
      format: 'duration',
      env: 'PASSWORD_FORGOT_TOKEN_TTL',
      default: '60 minutes',
    },
    passwordChangeToken: {
      format: 'duration',
      env: 'PASSWORD_CHANGE_TOKEN_TTL',
      default: '15 minutes',
    },
    sessionTokenWithoutDevice: {
      doc:
        'Maximum age for session tokens without a device record, specify zero to disable',
      format: 'duration',
      env: 'SESSION_TOKEN_WITHOUT_DEVICE_TTL',
      default: '4 weeks',
    },
  },
  tokenPruning: {
    enabled: {
      doc: 'Turn on Redis token pruning',
      format: Boolean,
      default: true,
      env: 'TOKEN_PRUNING_ENABLED',
    },
    maxAge: {
      doc: 'Age at which to prune expired tokens from Redis',
      format: 'duration',
      default: '1 month',
      env: 'TOKEN_PRUNING_MAX_AGE',
    },
  },
  verifierVersion: {
    doc: 'verifer version for new and changed passwords',
    format: 'int',
    env: 'VERIFIER_VERSION',
    default: 1,
  },
  snsTopicArn: {
    doc:
      'Amazon SNS topic on which to send account event notifications. Set to "disabled" to turn off the notifier',
    format: String,
    env: 'SNS_TOPIC_ARN',
    default: '',
  },
  snsTopicEndpoint: {
    doc: 'Amazon SNS topic endpoint',
    format: String,
    env: 'SNS_TOPIC_ENDPOINT',
    default: undefined,
  },
  emailNotifications: {
    region: {
      doc:
        'The region where the queues live, most likely the same region we are sending email e.g. us-east-1, us-west-2',
      format: String,
      env: 'BOUNCE_REGION',
      default: '',
    },
    bounceQueueUrl: {
      doc:
        'The bounce queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'BOUNCE_QUEUE_URL',
      default: '',
    },
    complaintQueueUrl: {
      doc:
        'The complaint queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'COMPLAINT_QUEUE_URL',
      default: '',
    },
    deliveryQueueUrl: {
      doc:
        'The email delivery queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'DELIVERY_QUEUE_URL',
      default: '',
    },
    notificationQueueUrl: {
      doc:
        'Queue URL for notifications from fxa-email-service (eventually this will be the only email-related queue)',
      format: String,
      env: 'NOTIFICATION_QUEUE_URL',
      default: '',
    },
  },
  profileServerMessaging: {
    region: {
      doc: 'The region where the queues live',
      format: String,
      env: 'PROFILE_MESSAGING_REGION',
      default: '',
    },
    profileUpdatesQueueUrl: {
      doc:
        'The queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'PROFILE_UPDATES_QUEUE_URL',
      default: '',
    },
  },
  useHttps: {
    doc: 'set to true to serve directly over https',
    env: 'USE_TLS',
    default: false,
  },
  keyPath: {
    doc: 'path to SSL key in PEM format if serving over https',
    env: 'TLS_KEY_PATH',
    default: path.resolve(__dirname, '../key.pem'),
  },
  certPath: {
    doc: 'path to SSL certificate in PEM format if serving over https',
    env: 'TLS_CERT_PATH',
    default: path.resolve(__dirname, '../cert.pem'),
  },
  lockoutEnabled: {
    doc: 'Is account lockout enabled',
    format: Boolean,
    env: 'LOCKOUT_ENABLED',
    default: false,
  },
  // A safety switch to disable device metadata updates,
  // in case problems with the client logic cause server overload.
  deviceUpdatesEnabled: {
    doc: 'Are updates to device metadata enabled?',
    format: Boolean,
    env: 'DEVICE_UPDATES_ENABLED',
    default: true,
  },
  // A safety switch to disable device-driven notifications,
  // in case problems with the client logic cause server overload.
  deviceNotificationsEnabled: {
    doc: 'Are device-driven notifications enabled?',
    format: Boolean,
    env: 'DEVICE_NOTIFICATIONS_ENABLED',
    default: true,
  },
  subhub: {
    enabled: {
      doc: 'Indicates whether talking to the SubHub server is enabled',
      format: Boolean,
      default: false,
      env: 'SUBHUB_ENABLED',
    },
    useStubs: {
      doc:
        'Indicates whether to use stub methods for SubHub instead of talking to the server',
      format: Boolean,
      default: false,
      env: 'SUBHUB_USE_STUBS',
    },
    stubs: {
      plans: {
        doc: 'Stub data used for plans',
        format: Array,
        env: 'SUBHUB_STUB_PLANS',
        default: [],
      },
    },
    url: {
      doc: 'SubHub Server URL',
      format: 'url',
      default: 'https://subhub.services.mozilla.com/',
      env: 'SUBHUB_URL',
    },
    key: {
      doc: 'Authentication key to use when accessing SubHub server',
      format: String,
      default: 'YOU MUST CHANGE ME',
      env: 'SUBHUB_KEY',
    },
    plansCacheTtlSeconds: {
      doc: 'The number of seconds to cache the list of plans from subhub',
      format: 'int',
      default: 600,
      env: 'SUBHUB_PLANS_CACHE_TTL_SECONDS',
    },
  },
  subscriptions: {
    enabled: {
      doc: 'Indicates whether subscriptions APIs are enabled',
      format: Boolean,
      env: 'SUBSCRIPTIONS_ENABLED',
      default: false,
    },
    sharedSecret: {
      doc:
        'Shared secret for authentication between backend subscription services',
      format: String,
      default: 'YOU MUST CHANGE ME',
      env: 'SUBSCRIPTIONS_SHARED_SECRET',
    },
    productCapabilities: {
      doc: 'Mappings from product names to subscription capability names',
      format: Object,
      env: 'SUBSCRIPTIONS_PRODUCT_CAPABILITIES',
      default: {},
    },
    clientCapabilities: {
      doc:
        'Mappings from OAuth client IDs to relevant subscription capabilities',
      format: Object,
      env: 'SUBSCRIPTIONS_CLIENT_CAPABILITIES',
      default: {},
    },
  },
  oauth: {
    url: {
      format: 'url',
      doc: 'URL at which to verify OAuth tokens',
      default: 'http://127.0.0.1:9010',
      env: 'OAUTH_URL',
    },
    keepAlive: {
      format: Boolean,
      doc: 'Use HTTP keep-alive connections when talking to oauth server',
      env: 'OAUTH_KEEPALIVE',
      default: false,
    },
    clientIds: {
      doc:
        'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
      format: Object,
      default: {},
      env: 'OAUTH_CLIENT_IDS',
    },
    // A safety switch for disabling new signins/signups from particular clients,
    // as a hedge against unexpected client behaviour.
    disableNewConnectionsForClients: {
      doc:
        'Comma-separated list of oauth client ids for which new connections should be temporarily refused',
      env: 'OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS',
      format: Array,
      default: [],
    },
    // Some safety switches to disable oauth-based device API operations,
    // in case problems with the client logic cause server overload.
    deviceAccessEnabled: {
      doc: 'Is oauth-based access to the devices API allowed at all?',
      format: Boolean,
      env: 'OAUTH_DEVICE_ACCESS_ENABLED',
      default: true,
    },
    deviceCommandsEnabled: {
      doc: 'Are oauth-based devices allowed to use  device commands?',
      format: Boolean,
      env: 'OAUTH_DEVICE_COMMANDS_ENABLED',
      default: true,
    },
    clientInfoCacheTTL: {
      doc: 'TTL for OAuth client details (in milliseconds)',
      format: 'duration',
      default: '3 days',
      env: 'OAUTH_CLIENT_INFO_CACHE_TTL',
    },
    secretKey: {
      doc: 'Shared secret for signing server-to-server JWT assertions',
      env: 'OAUTH_SERVER_SECRET_KEY',
      format: String,
      default: 'megaz0rd',
    },
    poolee: {
      timeout: {
        default: '30 seconds',
        format: 'duration',
        env: 'OAUTH_POOLEE_TIMEOUT',
        doc: 'Time in milliseconds to wait for oauth query completion',
      },
      maxPending: {
        default: 1000,
        format: 'int',
        env: 'OAUTH_POOLEE_MAX_PENDING',
        doc: 'Number of pending requests to fxa-oauth-server to allow',
      },
    },
  },
  metrics: {
    flow_id_key: {
      default: 'YOU MUST CHANGE ME',
      doc: 'FlowId validation key, as used by content-server',
      format: String,
      env: 'FLOW_ID_KEY',
    },
    flow_id_expiry: {
      doc: 'Time after which flowIds are considered stale.',
      format: 'duration',
      default: '2 hours',
      env: 'FLOW_ID_EXPIRY',
    },
  },
  statsd: {
    enabled: {
      doc: 'Enable StatsD',
      format: Boolean,
      default: false,
      env: 'STATSD_ENABLE',
    },
    sampleRate: {
      doc: 'Sampling rate for StatsD',
      format: Number,
      default: 0.1,
      env: 'STATSD_SAMPLE_RATE',
    },
    maxBufferSize: {
      doc: 'StatsD message buffer size in number of characters',
      format: Number,
      default: 500,
      env: 'STATSD_BUFFER_SIZE',
    },
    host: {
      doc: 'StatsD host to report to',
      format: String,
      default: 'localhost',
      env: 'DD_AGENT_HOST',
    },
    port: {
      doc: 'Port number of StatsD server',
      format: Number,
      default: 8125,
      env: 'DD_DOGSTATSD_PORT',
    },
    prefix: {
      doc: 'StatsD metrics name prefix',
      format: String,
      default: 'fxa-auth-server.',
      env: 'STATSD_PREFIX',
    },
  },
  corsOrigin: {
    doc: 'Value for the Access-Control-Allow-Origin response header',
    format: Array,
    env: 'CORS_ORIGIN',
    default: ['*'],
  },
  clientAddressDepth: {
    doc: 'location of the client ip address in the remote address chain',
    format: Number,
    env: 'CLIENT_ADDRESS_DEPTH',
    default: 3,
  },
  signinConfirmation: {
    forcedEmailAddresses: {
      doc:
        'Force sign-in confirmation for email addresses matching this regex.',
      format: RegExp,
      default: /.+@mozilla\.com$/,
      env: 'SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX',
    },
    skipForEmailAddresses: {
      doc:
        'Comma separated list of email addresses that will always skip any non TOTP sign-in confirmation',
      format: Array,
      default: [],
      env: 'SIGNIN_CONFIRMATION_SKIP_FOR_EMAIL_ADDRESS',
    },
    skipForNewAccounts: {
      enabled: {
        doc: 'Skip sign-in confirmation for newly-created accounts.',
        default: true,
        env: 'SIGNIN_CONFIRMATION_SKIP_FOR_NEW_ACCOUNTS',
      },
      maxAge: {
        doc: 'Maximum age at which an account is considered "new".',
        format: 'duration',
        default: '4 hours',
        env: 'SIGNIN_CONFIRMATION_MAX_AGE_OF_NEW_ACCOUNTS',
      },
    },
    tokenVerificationCode: {
      codeLength: {
        doc: 'Number of digits to make up a token code',
        default: 6,
        env: 'SIGNIN_TOKEN_CODE_LENGTH',
      },
      codeLifetime: {
        doc: 'How long code should be valid for',
        format: 'duration',
        default: '20 minutes',
        env: 'SIGNIN_TOKEN_CODE_LIFETIME',
      },
    },
  },
  securityHistory: {
    ipProfiling: {
      allowedRecency: {
        doc:
          'Length of time since previously verified event to allow skipping confirmation',
        default: '72 hours',
        format: 'duration',
        env: 'IP_PROFILING_RECENCY',
      },
    },
  },
  lastAccessTimeUpdates: {
    enabled: {
      doc: 'enable updates to the lastAccessTime session token property',
      format: Boolean,
      default: true,
      env: 'LASTACCESSTIME_UPDATES_ENABLED',
    },
    sampleRate: {
      doc:
        'sample rate for updates to the lastAccessTime session token property, in the range 0..1',
      format: Number,
      default: 0.3,
      env: 'LASTACCESSTIME_UPDATES_SAMPLE_RATE',
    },
    earliestSaneTimestamp: {
      doc:
        'timestamp used as the basis of the fallback value for lastAccessTimeFormatted, currently pinned to the deployment of 1.96.4 / a0940d7dc51e2ba20fa18aa3a830810e35c9a9d9',
      format: 'timestamp',
      default: 1507081020000,
      env: 'LASTACCESSTIME_EARLIEST_SANE_TIMESTAMP',
    },
  },
  signinUnblock: {
    codeLength: {
      doc: 'Number of alphanumeric digits to make up an unblockCode',
      default: 8,
      env: 'SIGNIN_UNBLOCK_CODE_LENGTH',
    },
    codeLifetime: {
      doc: 'How long an unblockCode should be valid for',
      format: 'duration',
      default: '1 hour',
      env: 'SIGNIN_UNBLOCK_CODE_LIFETIME',
    },
    forcedEmailAddresses: {
      doc:
        'If feature enabled, force sign-in unblock for email addresses matching this regex.',
      format: RegExp,
      default: '^$', // default is no one
      env: 'SIGNIN_UNBLOCK_FORCED_EMAILS',
    },
  },
  push: {
    allowedServerRegex: {
      doc: 'RegExp that validates the URI format of the Push Server',
      format: RegExp,
      default: /^https:\/\/[a-zA-Z0-9._-]+(\.services\.mozilla\.com|autopush\.dev\.mozaws\.net|autopush\.stage\.mozaws\.net)(?:\:\d+)?(\/.*)?$/,
    },
  },
  pushbox: {
    enabled: {
      doc: 'Indicates whether talking to the Pushbox server is enabled',
      format: Boolean,
      default: false,
      env: 'PUSHBOX_ENABLED',
    },
    url: {
      doc: 'Pushbox Server URL',
      format: 'url',
      default: 'https://pushbox.services.mozilla.com/',
      env: 'PUSHBOX_URL',
    },
    key: {
      doc: 'Authentication key to use when accessing pushbox server',
      format: String,
      default: 'Correct_Horse_Battery_Staple_1',
      env: 'PUSHBOX_KEY',
    },
    maxTTL: {
      doc: 'Maximum TTL to set on items written to pushbox',
      format: 'duration',
      default: '28 days',
      env: 'PUSHBOX_MAX_TTL',
    },
  },
  sms: {
    enabled: {
      doc: 'Indicates whether POST /sms is enabled',
      default: true,
      format: Boolean,
      env: 'SMS_ENABLED',
    },
    useMock: {
      doc: 'Use a mock SMS provider implementation, for functional testing',
      default: false,
      format: Boolean,
      env: 'SMS_USE_MOCK',
    },
    isStatusGeoEnabled: {
      doc: 'Indicates whether the status endpoint should do geo-ip lookup',
      default: true,
      format: Boolean,
      env: 'SMS_STATUS_GEO_ENABLED',
    },
    apiRegion: {
      doc: 'AWS region',
      default: 'us-east-1',
      format: String,
      env: 'SMS_API_REGION',
    },
    countryCodes: {
      doc: 'Allow sending SMS to these ISO 3166-1 alpha-2 country codes',
      default: [
        'AT',
        'AU',
        'BE',
        'CA',
        'DE',
        'DK',
        'ES',
        'FR',
        'GB',
        'IT',
        'LU',
        'NL',
        'PT',
        'US',
      ],
      format: Array,
      env: 'SMS_COUNTRY_CODES',
    },
    installFirefoxLink: {
      doc: 'Link for the installFirefox SMS template',
      default: 'https://mzl.la/firefoxapp',
      format: 'url',
      env: 'SMS_INSTALL_FIREFOX_LINK',
    },
    installFirefoxWithSigninCodeBaseUri: {
      doc:
        'Base URI for the SMS template when the signinCodes feature is active',
      default: 'https://accounts.firefox.com/m',
      format: 'url',
      env: 'SMS_SIGNIN_CODES_BASE_URI',
    },
    enableBudgetChecks: {
      doc:
        'enable checks of the monthly SMS spend against the available budget',
      default: true,
      format: Boolean,
      env: 'SMS_ENABLE_BUDGET_CHECKS',
    },
    minimumCreditThresholdUSD: {
      doc:
        'The minimum amount of available credit that is necessary to enable SMS, in US dollars',
      default: 200,
      format: 'nat',
      env: 'SMS_MINIMUM_CREDIT_THRESHOLD',
    },
  },
  secondaryEmail: {
    minUnverifiedAccountTime: {
      doc:
        'The minimum amount of time an account can be unverified before another account can use it for secondary email',
      default: '1 day',
      format: 'duration',
      env: 'SECONDARY_EMAIL_MIN_UNVERIFIED_ACCOUNT_TIME',
    },
  },
  signinCodeSize: {
    doc: 'signinCode size in bytes',
    default: 6,
    format: 'nat',
    env: 'SIGNIN_CODE_SIZE',
  },
  emailStatusPollingTimeout: {
    doc: 'how long before emails status polling is considered stale',
    default: '1 month',
    format: 'duration',
    env: 'EMAIL_STATUS_POLLING_TIMEOUT',
  },
  sentryDsn: {
    doc: 'Sentry DSN for error and log reporting',
    default: '',
    format: 'String',
    env: 'SENTRY_DSN',
  },
  totp: {
    serviceName: {
      doc: 'Default service name to appear in authenticator',
      default: 'Firefox',
      format: 'String',
      env: 'TOTP_SERVICE_NAME',
    },
    step: {
      doc: 'Default time step size (seconds)',
      default: 30,
      format: 'nat',
      env: 'TOTP_STEP_SIZE',
    },
    window: {
      doc: 'Tokens in the previous x-windows that should be considered valid',
      default: 1,
      format: 'nat',
      env: 'TOTP_WINDOW',
    },
    recoveryCodes: {
      count: {
        doc: 'Number of recovery codes to create',
        default: 8,
        env: 'RECOVERY_CODE_COUNT',
      },
      notifyLowCount: {
        doc:
          'Notify the user when there are less than these many recovery codes',
        default: 2,
        env: 'RECOVERY_CODE_NOTIFY_LOW_COUNT',
      },
    },
  },
  verificationReminders: {
    rolloutRate: {
      doc: 'Rollout rate for verification reminder emails, in the range 0 .. 1',
      default: 1,
      env: 'VERIFICATION_REMINDERS_ROLLOUT_RATE',
      format: Number,
    },
    firstInterval: {
      doc: 'Time since account creation after which the first reminder is sent',
      default: '1 day',
      env: 'VERIFICATION_REMINDERS_FIRST_INTERVAL',
      format: 'duration',
    },
    secondInterval: {
      doc:
        'Time since account creation after which the second reminder is sent',
      default: '5 days',
      env: 'VERIFICATION_REMINDERS_SECOND_INTERVAL',
      format: 'duration',
    },
    redis: {
      prefix: {
        default: 'verificationReminders:',
        doc: 'Key prefix for the verification reminders Redis pool',
        env: 'VERIFICATION_REMINDERS_REDIS_PREFIX',
        format: String,
      },
      maxConnections: {
        default: 10,
        doc:
          'Maximum connection count for the verification reminders Redis pool',
        env: 'VERIFICATION_REMINDERS_REDIS_MAX_CONNECTIONS',
        format: 'nat',
      },
      minConnections: {
        default: 1,
        doc:
          'Minimum connection count for the verification reminders Redis pool',
        env: 'VERIFICATION_REMINDERS_REDIS_MIN_CONNECTIONS',
        format: 'nat',
      },
    },
  },
  zendesk: {
    username: {
      doc: 'Zendesk Username for support interaction',
      default: '',
      env: 'ZENDESK_USERNAME',
      format: String,
    },
    token: {
      doc: 'Zendesk Token for support interaction',
      default: '',
      env: 'ZENDESK_TOKEN',
      format: String,
    },
    subdomain: {
      doc: 'Zendesk subdomain for support interaction',
      default: 'mozilladev',
      env: 'ZENDESK_SUBDOMAIN',
      format: String,
    },
    productNameFieldId: {
      doc: 'Zendesk support ticket custom field for the product name',
      default: '360022027772',
      env: 'ZENDESK_PRODUCT_NAME_FIELD_ID',
      format: String,
    },
  },
  otp: {
    step: {
      doc: 'Default time step size (seconds)',
      default: 10 * 60,
      format: 'nat',
      env: 'OTP_SIGNUP_STEP_SIZE',
    },
    window: {
      doc: 'Tokens in the previous x-windows that should be considered valid',
      default: 1,
      format: 'nat',
      env: 'OTP_SIGNUP_WINDOW',
    },
    digits: {
      doc: 'Number of digits in token',
      default: 6,
      format: 'nat',
      env: 'OTP_SIGNUP_DIGIT',
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

// set the public url as the issuer domain for assertions
conf.set('domain', url.parse(conf.get('publicUrl')).host);

// derive fxa-auth-mailer configuration from our content-server url
const baseUri = conf.get('contentServer.url');
conf.set('smtp.accountSettingsUrl', `${baseUri}/settings`);
conf.set(
  'smtp.accountRecoveryCodesUrl',
  `${baseUri}/settings/two_step_authentication/recovery_codes`
);
conf.set('smtp.verificationUrl', `${baseUri}/verify_email`);
conf.set('smtp.passwordResetUrl', `${baseUri}/complete_reset_password`);
conf.set('smtp.initiatePasswordResetUrl', `${baseUri}/reset_password`);
conf.set(
  'smtp.initiatePasswordChangeUrl',
  `${baseUri}/settings/change_password`
);
conf.set('smtp.verifyLoginUrl', `${baseUri}/complete_signin`);
conf.set('smtp.reportSignInUrl', `${baseUri}/report_signin`);
conf.set(
  'smtp.revokeAccountRecoveryUrl',
  `${baseUri}/settings/account_recovery/confirm_revoke`
);
conf.set(
  'smtp.createAccountRecoveryUrl',
  `${baseUri}/settings/account_recovery/confirm_password`
);
conf.set('smtp.verifyPrimaryEmailUrl', `${baseUri}/verify_primary_email`);
conf.set('smtp.verifySecondaryEmailUrl', `${baseUri}/verify_secondary_email`);
conf.set('smtp.subscriptionDownloadUrl', `${baseUri}/subscriptions/download`);
conf.set('smtp.subscriptionSettingsUrl', `${baseUri}/subscriptions`);
conf.set('smtp.subscriptionSupportUrl', `${baseUri}/support`);
conf.set('smtp.subscriptionTermsUrl', `${baseUri}/legal/subscription_terms`);

conf.set('isProduction', conf.get('env') === 'prod');

//sns endpoint is not to be set in production
if (conf.has('snsTopicEndpoint') && conf.get('env') !== 'dev') {
  throw new Error('snsTopicEndpoint is only allowed in dev env');
}

if (conf.get('env') === 'dev') {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    process.env.AWS_ACCESS_KEY_ID = 'DEV_KEY_ID';
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    process.env.AWS_SECRET_ACCESS_KEY = 'DEV_ACCESS_KEY';
  }
}

// Ensure secrets are not set to their default values in production.
if (conf.get('isProduction')) {
  const SECRET_SETTINGS = [
    'pushbox.key',
    'metrics.flow_id_key',
    'oauth.secretKey',
  ];
  for (const key of SECRET_SETTINGS) {
    if (conf.get(key) === conf.default(key)) {
      throw new Error(`Config '${key}' must be set in production`);
    }
  }
}

module.exports = conf;
