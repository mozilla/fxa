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
  // TODO: Remove this after we have synchronized login records to Firestore
  firestore: {
    credentials: {
      client_email: {
        default: 'test@localtest.com',
        doc: 'GCP Client key credential',
        env: 'FIRESTORE_CLIENT_EMAIL_CREDENTIAL',
        format: String,
      },
      private_key: {
        default: '',
        doc: 'GCP Private key credential',
        env: 'FIRESTORE_PRIVATE_KEY_CREDENTIAL',
        format: String,
      },
    },
    enabled: {
      default: true,
      doc: 'Whether to use firestore',
      env: 'FIRESTORE_ENABLED',
      format: Boolean,
    },
    keyFilename: {
      default: path.resolve(__dirname, 'secret-key.json'),
      doc: 'Path to GCP key file',
      env: 'FIRESTORE_KEY_FILE',
      format: String,
    },
    prefix: {
      default: 'fxa-eb-',
      doc: 'Firestore collection prefix',
      env: 'FIRESTORE_COLLECTION_PREFIX',
      format: String,
    },
    projectId: {
      default: '',
      doc: 'GCP Project id',
      env: 'FIRESTORE_PROJECT_ID',
      format: String,
    },
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
    logAccuracy: {
      doc: 'emit log lines for accuracy and confidence',
      default: false,
      env: 'GEODB_LOG_ACCURACY',
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
  amplitude: {
    schemaValidation: {
      default: true,
      doc: 'Validate events against a JSON schema',
      env: 'AMPLITUDE_SCHEMA_VALIDATION',
      format: Boolean,
    },
    rawEvents: {
      default: false,
      doc: 'Log raw Amplitude events',
      env: 'AMPLITUDE_RAW_EVENTS',
      format: Boolean,
    },
  },
  memcached: {
    address: {
      doc:
        'Address:port of the memcached server (or `none` to disable memcached)',
      default: 'localhost:11211',
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
    default: 'http://localhost:9000',
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
      default: 'http://localhost:8000',
      env: 'HTTPDB_URL',
    },
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
      default: 9000,
      format: 'port',
      env: 'PORT',
    },
  },
  customsUrl: {
    doc: "fraud / abuse server url; set to the string 'none' to disable",
    default: 'http://localhost:7000',
    env: 'CUSTOMS_SERVER_URL',
  },
  contentServer: {
    url: {
      doc: 'The url of the corresponding fxa-content-server instance',
      default: 'http://localhost:3030',
      env: 'CONTENT_SERVER_URL',
    },
  },
  emailService: {
    host: {
      doc: 'host for fxa-email-service',
      format: String,
      default: 'localhost',
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
        default: 'localhost',
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
    subscriptionTermsUrl: {
      default:
        'https://www.mozilla.org/about/legal/terms/firefox-private-network/',
      doc: 'Subscription terms and cancellation policy URL',
      env: 'SUBSCRIPTION_TERMS_URL',
      format: String,
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
      default: 'localhost',
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
    accessTokens: {
      host: {
        default: 'localhost',
        env: 'ACCESS_TOKEN_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'ACCESS_TOKEN_REDIS_PORT',
        format: 'port',
      },
      prefix: {
        default: 'at:',
        env: 'ACCESS_TOKEN_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for access tokens in Redis',
      },
      accessTokenLimit: {
        default: 100,
        env: 'ACCESS_TOKEN_REDIS_LIMIT',
        format: Number,
        doc: 'Maximum number of access tokens per account at any one time',
      },
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
  profileServer: {
    url: {
      doc: 'The url of the corresponding fxa-profile-server instance',
      env: 'PROFILE_SERVER_URL',
      format: 'url',
      default: 'https://profile.accounts.firefox.com',
    },
    secretBearerToken: {
      default: 'YOU MUST CHANGE ME',
      doc:
        'Secret for server-to-server bearer token auth for fxa-profile-server',
      env: 'PROFILE_SERVER_AUTH_SECRET_BEARER_TOKEN',
      format: 'String',
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
    stripeApiKey: {
      default: '',
      env: 'SUBHUB_STRIPE_APIKEY',
      format: String,
      doc: 'Stripe API key for direct Stripe integration',
    },
    stripeWebhookSecret: {
      default: '',
      env: 'STRIPE_WEBHOOK_SECRET',
      format: String,
      doc: 'A shared secret to authenticate Stripe webhook requests',
    },
    transactionalEmails: {
      // See also: https://jira.mozilla.com/browse/FXA-1148
      enabled: {
        doc:
          'Indicates whether FxA sends transactional lifecycle emails for subscriptions (i.e. versus Marketing Cloud)',
        format: Boolean,
        env: 'SUBSCRIPTIONS_TRANSACTIONAL_EMAILS_ENABLED',
        default: false,
      },
    },
  },
  oauth: {
    url: {
      format: 'url',
      doc: 'URL at which to verify OAuth tokens',
      default: 'http://localhost:9000',
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
      doc: 'Shared secret for signing auth-to-oauth server JWT assertions',
      env: 'OAUTH_SERVER_SECRET_KEY',
      format: String,
      default: 'megaz0rd',
    },
    jwtSecretKeys: {
      doc:
        'Comma-separated list of secret keys for verifying oauth-to-auth server JWTs',
      env: 'OAUTH_SERVER_SECRETS',
      format: Array,
      default: ['megaz0rd'],
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
  oauthServer: {
    admin: {
      whitelist: {
        doc: 'An array of regexes. Passing any one will get through.',
        default: ['@mozilla\\.com$'],
      },
    },
    api: {
      version: {
        doc: 'Number part of versioned endpoints - ex: /v1/token',
        default: 1,
      },
    },
    allowHttpRedirects: {
      arg: 'allowHttpRedirects',
      doc: 'If true, then it allows http OAuth redirect uris',
      env: 'ALLOW_HTTP_REDIRECTS',
      format: 'Boolean',
      default: false,
    },
    audience: {
      doc: 'audience for oauth JWTs',
      format: 'url',
      default: 'http://localhost:9000',
      env: 'OAUTH_URL',
    },
    auth: {
      poolee: {
        timeout: {
          default: '30 seconds',
          doc: 'Time in milliseconds to wait for auth server query completion',
          env: 'AUTH_POOLEE_TIMEOUT',
          format: 'duration',
        },
        maxPending: {
          default: 1000,
          doc: 'Number of pending requests to fxa-auth-server to allow',
          env: 'AUTH_POOLEE_MAX_PENDING',
          format: 'int',
        },
      },
      jwtSecretKey: {
        default: 'megaz0rd',
        doc: 'Shared secret for signing oauth-to-auth server JWT assertions',
        format: 'String',
        env: 'AUTH_SERVER_SHARED_SECRET',
      },
      url: {
        default: 'http://localhost:9000',
        doc: 'The auth-server public URL',
        env: 'AUTH_SERVER_URL',
        format: 'url',
      },
    },
    authServerSecrets: {
      doc:
        'Comma-separated list of secret keys for verifying server-to-server JWTs',
      env: 'AUTH_SERVER_SECRETS',
      format: 'Array',
      default: [],
    },
    browserid: {
      issuer: {
        doc: 'We only accept assertions from this issuer',
        env: 'ISSUER',
        default: 'api.accounts.firefox.com',
      },
      maxSockets: {
        doc: 'The maximum number of connections that the pool can use at once.',
        env: 'BROWSERID_MAX_SOCKETS',
        default: 10,
      },
      verificationUrl: {
        doc: 'URL to the remote verifier we will use for fxa-assertions',
        format: 'url',
        env: 'VERIFICATION_URL',
        default: 'https://verifier.accounts.firefox.com/v2',
      },
    },
    clients: {
      doc: 'Some pre-defined clients that will be inserted into the DB',
      env: 'OAUTH_CLIENTS',
      format: 'Array',
      default: [],
    },
    clientManagement: {
      enabled: {
        doc:
          'Enable client management in OAuth server routes. Do NOT set this to true in production.',
        default: false,
        format: 'Boolean',
        env: 'CLIENT_MANAGEMENT_ENABLED',
      },
    },
    clientIdToServiceNames: {
      // This is used by oauth/db/index.js to identify pocket client ids so that it
      // can store them separately in mysql.
      // It's also used for amplitude stats
      doc:
        'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
      default: {},
      format: 'Object',
      env: 'OAUTH_CLIENT_IDS',
    },
    disabledClients: {
      doc:
        'Comma-separated list of client ids for which service should be temporarily refused',
      env: 'OAUTH_CLIENTS_DISABLED',
      format: 'Array',
      default: [],
    },
    scopes: {
      doc: 'Some pre-defined list of scopes that will be inserted into the DB',
      env: 'OAUTH_SCOPES',
      format: 'Array',
      default: [],
    },
    clientAddressDepth: {
      doc: 'location of the client ip address in the remote address chain',
      env: 'CLIENT_ADDRESS_DEPTH',
      default: 3,
    },
    contentUrl: {
      doc: 'URL to UI page in fxa-content-server that starts OAuth flow',
      format: 'url',
      env: 'CONTENT_URL',
      default: 'https://accounts.firefox.com/oauth/',
    },
    db: {
      driver: {
        env: 'DB',
        format: ['mysql'],
        default: 'mysql',
      },
      autoUpdateClients: {
        doc: 'If true, update clients from config file settings',
        env: 'DB_AUTO_UPDATE_CLIENTS',
        format: 'Boolean',
        default: true,
      },
    },
    env: {
      arg: 'node-env',
      doc: 'The current node.js environment',
      env: 'NODE_ENV',
      format: ['dev', 'test', 'stage', 'prod'],
      default: 'prod',
    },
    events: {
      enabled: {
        doc:
          'Whether or not config.events has to be properly set in production',
        default: true,
        format: 'Boolean',
        env: 'EVENTS_ENABLED',
      },
      region: {
        doc: 'AWS Region of fxa account events',
        default: '',
        format: 'String',
        env: 'FXA_EVENTS_REGION',
      },
      queueUrl: {
        doc: 'SQS queue url for fxa account events',
        default: '',
        format: 'String',
        env: 'FXA_EVENTS_QUEUE_URL',
      },
    },
    expiration: {
      accessToken: {
        doc: 'Access Tokens maximum expiration (can live shorter)',
        format: 'duration',
        default: '2 weeks',
        env: 'FXA_EXPIRATION_ACCESS_TOKEN',
      },
      accessTokenExpiryEpoch: {
        doc: 'Timestamp after which access token expiry is actively enforced',
        format: 'timestamp',
        default: '2017-01-01',
        env: 'FXA_EXPIRATION_ACCESS_TOKEN_EXPIRY_EPOCH',
      },
      code: {
        doc: 'Clients must trade codes for tokens before they expire',
        format: 'duration',
        default: '15 minutes',
        env: 'FXA_EXPIRATION_CODE',
      },
    },
    refreshToken: {
      updateAfter: {
        doc: 'lastUsedAt only gets updated after this delay',
        format: 'duration',
        default: '24 hours',
        env: 'FXA_REFRESH_TOKEN_UPDATE_AFTER',
      },
    },
    git: {
      commit: {
        doc: 'Commit SHA when in stage/production',
        format: 'String',
        default: '',
      },
    },
    jwtAccessTokens: {
      enabled: {
        doc: 'Whether or not JWT access tokens are enabled',
        default: true,
        format: 'Boolean',
        env: 'JWT_ACCESS_TOKENS_ENABLED',
      },
      enabledClientIds: {
        doc: 'JWT access tokens are only returned for client_ids in this list',
        default: [],
        format: 'Array',
        env: 'JWT_ACCESS_TOKENS_ENABLED_CLIENT_IDS',
      },
    },
    localRedirects: {
      doc: 'When true, `localhost` and `localhost` always are legal redirects.',
      default: false,
      env: 'FXA_OAUTH_LOCAL_REDIRECTS',
    },
    mysql: {
      createSchema: { default: true, env: 'CREATE_MYSQL_SCHEMA' },
      user: { default: 'root', env: 'MYSQL_USERNAME' },
      password: { default: '', env: 'MYSQL_PASSWORD' },
      database: { default: 'fxa_oauth', env: 'MYSQL_DATABASE' },
      host: { default: 'localhost', env: 'MYSQL_HOST' },
      port: { default: '3306', env: 'MYSQL_PORT' },
      connectionLimit: {
        doc: 'The maximum number of connections that the pool can use at once.',
        default: 10,
        env: 'MYSQL_CONNECTION_LIMIT',
      },
      timezone: {
        default: 'Z',
        doc:
          'The timezone configured on the MySQL server. This is used to type cast server date/time values to JavaScript `Date` object. Can be `local`, `Z`, or an offset in the form of or an offset in the form +HH:MM or -HH:MM.',
        env: 'MYSQL_TIMEZONE',
        format: 'String',
      },
    },
    openid: {
      keyFile: {
        doc: 'Path to private key JWK to sign various kinds of JWT tokens',
        default: '',
        format: 'String',
        env: 'FXA_OPENID_KEYFILE',
      },
      newKeyFile: {
        doc:
          'Path to private key JWK that will be used to sign JWTs in the future',
        default: '',
        format: 'String',
        env: 'FXA_OPENID_NEWKEYFILE',
      },
      oldKeyFile: {
        doc: 'Path to public key JWK that was used to sign JWTs in the past',
        default: '',
        format: 'String',
        env: 'FXA_OPENID_OLDKEYFILE',
      },
      key: {
        doc: 'Private key JWK to sign various kinds of JWT tokens',
        default: {},
        env: 'FXA_OPENID_KEY',
      },
      newKey: {
        doc: 'Private key JWK that will be used to sign JWTs in the future',
        default: {},
        env: 'FXA_OPENID_NEWKEY',
      },
      oldKey: {
        doc: 'Public key JWK that was used to sign JWTs in the past',
        default: {},
        env: 'FXA_OPENID_OLDKEY',
      },
      unsafelyAllowMissingActiveKey: {
        doc:
          'Do not error out if there is no active key; should only be used when initializing keys',
        default: false,
        format: 'Boolean',
        env: 'FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY',
      },
      issuer: {
        doc: 'The value of the `iss` property of the id_token',
        default: 'https://accounts.firefox.com',
        env: 'FXA_OPENID_ISSUER',
      },
      ttl: {
        doc: 'Number of milliseconds until id_token should expire',
        default: '5 minutes',
        format: 'duration',
        env: 'FXA_OPENID_TTL',
      },
    },
    ppid: {
      enabled: {
        doc: 'Whether pairwise pseudonymous identifiers (PPIDs) are enabled',
        default: false,
        format: 'Boolean',
        env: 'PPID_ENABLED',
      },
      enabledClientIds: {
        doc: 'client_ids that receive PPIDs',
        default: [],
        format: 'Array',
        env: 'PPID_CLIENT_IDS',
      },
      rotatingClientIds: {
        doc:
          'client_ids that receive automatically rotating PPIDs based on server time',
        default: [],
        format: 'Array',
        env: 'PPID_ROTATING_CLIENT_IDS',
      },
      rotationPeriodMS: {
        doc: 'salt used in HKDF for PPIDs, converted to milliseconds',
        format: 'duration',
        default: '6 hours',
        env: 'PPID_ROTATION_PERIOD',
      },
      salt: {
        doc: 'salt used in HKDF for PPIDs',
        default: 'YOU MUST CHANGE ME',
        format: 'String',
        env: 'PPID_SALT',
      },
    },
    publicUrl: {
      format: 'url',
      default: 'http://localhost:9000',
      env: 'PUBLIC_URL',
    },
    server: {
      host: { env: 'HOST', default: 'localhost' },
      port: { env: 'PORT', format: 'port', default: 9000 },
    },
    serverInternal: {
      host: { env: 'HOST_INTERNAL', default: 'localhost' },
      port: { env: 'PORT_INTERNAL', format: 'port', default: 9011 },
    },
    i18n: {
      defaultLanguage: {
        default: 'en',
        format: 'String',
        env: 'DEFAULT_LANG',
      },
      supportedLanguages: {
        default: [],
        format: 'Array',
        env: 'SUPPORTED_LANGS',
      },
    },
    unique: {
      clientSecret: {
        doc: 'Bytes of generated client_secrets',
        default: 32,
      },
      code: { doc: 'Bytes of generated codes', default: 32 },
      id: { doc: 'Bytes of generated DB ids', default: 8 },
      token: { doc: 'Bytes of generated tokens', default: 32 },
      developerId: { doc: 'Bytes of generated developer ids', default: 16 },
    },
    cacheControl: {
      doc:
        'Hapi: a string with the value of the "Cache-Control" header when caching is disabled',
      format: 'String',
      default: 'private, no-cache, no-store, must-revalidate',
    },
    sentryDsn: {
      doc: 'Sentry DSN for error and log reporting',
      default: '',
      format: 'String',
      env: 'SENTRY_DSN',
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
      default: 1,
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
    forceGlobally: {
      doc: 'Force sign-in confirmation for all accounts',
      format: Boolean,
      default: false,
      env: 'SIGNIN_CONFIRMATION_FORCE_GLOBALLY',
    },
  },
  forcePasswordChange: {
    forcedEmailAddresses: {
      doc:
        'Force sign-in confirmation for email addresses matching this regex.',
      format: RegExp,
      default: '^$', // default is no one

      env: 'FORCE_PASSWORD_CHANGE_EMAIL_REGEX',
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
      // eslint-disable-next-line no-useless-escape
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
    pollCurrentSpendInterval: {
      doc: 'Interval to poll SNS and Cloudwatch for SMS spending data',
      default: '1 hour',
      format: 'duration',
      env: 'SMS_POLL_CURRENT_SPEND_INTERVAL',
    },
    smsType: {
      doc:
        'AWS.SNS.SMS.SMSType argument value.  "Promotional" or "Transactional".',
      default: 'Promotional',
      format: 'String',
      env: 'SMS_AWS_SNS_SMSTYPE',
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
  cadReminders: {
    rolloutRate: {
      doc: 'Rollout rate in the range 0 .. 1',
      default: 1,
      env: 'CAD_REMINDERS_ROLLOUT_RATE',
      format: Number,
    },
    firstInterval: {
      doc: 'Time which the first reminder is sent',
      default: '8 hours',
      env: 'CAD_REMINDERS_FIRST_INTERVAL',
      format: 'duration',
    },
    secondInterval: {
      doc: 'Time which the second reminder is sent',
      default: '3 days',
      env: 'CAD_REMINDERS_SECOND_INTERVAL',
      format: 'duration',
    },
    redis: {
      prefix: {
        default: 'cadReminders:',
        doc: 'Key prefix for the cad reminders Redis pool',
        env: 'CAD_REMINDERS_REDIS_PREFIX',
        format: String,
      },
      maxConnections: {
        default: 10,
        doc: 'Maximum connection count for the cad reminders Redis pool',
        env: 'CAD_REMINDERS_REDIS_MAX_CONNECTIONS',
        format: 'nat',
      },
      minConnections: {
        default: 1,
        doc: 'Minimum connection count for the cad reminders Redis pool',
        env: 'CAD_REMINDERS_REDIS_MIN_CONNECTIONS',
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
    locationCityFieldId: {
      doc: 'Zendesk support ticket custom field for the city of the location',
      default: '360026463311',
      env: 'ZENDESK_LOCATION_CITY_FIELD_ID',
      format: String,
    },
    locationStateFieldId: {
      doc:
        'Zendesk support ticket custom field for the state/region of the location',
      default: '360026463491',
      env: 'ZENDESK_LOCATION_STATE_FIELD_ID',
      format: String,
    },
    locationCountryFieldId: {
      doc:
        'Zendesk support ticket custom field for the country of the location',
      default: '360026463511',
      env: 'ZENDESK_LOCATION_COUNTRY_FIELD_ID',
      format: String,
    },
    topicFieldId: {
      doc: 'Zendesk support ticket custom field for topic',
      default: '360028484432',
      env: 'ZENDESK_TOPIC_FIELD_ID',
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
  supportPanel: {
    secretBearerToken: {
      default: 'YOU MUST CHANGE ME',
      doc:
        'Shared secret to access certain endpoints.  Please only use for GET.  No state mutation allowed!',
      env: 'SUPPORT_PANEL_AUTH_SECRET_BEARER_TOKEN',
      format: 'String',
    },
  },
  syncTokenserverUrl: {
    default: 'http://localhost:5000/token',
    doc: 'The url of the Firefox Sync tokenserver',
    env: 'SYNC_TOKENSERVER_URL',
    format: 'url',
  },
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

let envConfig = path.join(__dirname, `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate();

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
conf.set('smtp.subscriptionSettingsUrl', `${baseUri}/subscriptions`);
conf.set('smtp.subscriptionSupportUrl', `${baseUri}/support`);

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

if (conf.get('oauthServer.openid.keyFile')) {
  const keyFile = path.resolve(
    __dirname,
    '..',
    conf.get('oauthServer.openid.keyFile')
  );
  conf.set('oauthServer.openid.keyFile', keyFile);
  // If the file doesnt exist, or contains an empty object, then there's no active key.
  conf.set('oauthServer.openid.key', null);
  if (fs.existsSync(keyFile)) {
    const key = JSON.parse(fs.readFileSync(keyFile));
    if (key && Object.keys(key).length > 0) {
      conf.set('oauthServer.openid.key', key);
    }
  }
} else if (Object.keys(conf.get('oauthServer.openid.key')).length === 0) {
  conf.set('oauthServer.openid.key', null);
}

if (conf.get('oauthServer.openid.newKeyFile')) {
  const newKeyFile = path.resolve(
    __dirname,
    '..',
    conf.get('oauthServer.openid.newKeyFile')
  );
  conf.set('oauthServer.openid.newKeyFile', newKeyFile);
  // If the file doesnt exist, or contains an empty object, then there's no new key.
  conf.set('oauthServer.openid.newKey', null);
  if (fs.existsSync(newKeyFile)) {
    const newKey = JSON.parse(fs.readFileSync(newKeyFile));
    if (newKey && Object.keys(newKey).length > 0) {
      conf.set('oauthServer.openid.newKey', newKey);
    }
  }
} else if (Object.keys(conf.get('oauthServer.openid.newKey')).length === 0) {
  conf.set('oauthServer.openid.newKey', null);
}

if (conf.get('oauthServer.openid.oldKeyFile')) {
  const oldKeyFile = path.resolve(
    __dirname,
    '..',
    conf.get('oauthServer.openid.oldKeyFile')
  );
  conf.set('oauthServer.openid.oldKeyFile', oldKeyFile);
  // If the file doesnt exist, or contains an empty object, then there's no old key.
  conf.set('oauthServer.openid.oldKey', null);
  if (fs.existsSync(oldKeyFile)) {
    const oldKey = JSON.parse(fs.readFileSync(oldKeyFile));
    if (oldKey && Object.keys(oldKey).length > 0) {
      conf.set('oauthServer.openid.oldKey', oldKey);
    }
  }
} else if (Object.keys(conf.get('oauthServer.openid.oldKey')).length === 0) {
  conf.set('oauthServer.openid.oldKey', null);
}

// Ensure secrets are not set to their default values in production.
if (conf.get('isProduction')) {
  const SECRET_SETTINGS = [
    'pushbox.key',
    'metrics.flow_id_key',
    'oauth.jwtSecretKeys',
    'oauth.secretKey',
    'profileServer.secretBearerToken',
    'supportPanel.secretBearerToken',
  ];
  for (const key of SECRET_SETTINGS) {
    if (conf.get(key) === conf.default(key)) {
      throw new Error(`Config '${key}' must be set in production`);
    }
  }
}

export type conf = typeof conf;

module.exports = conf;
