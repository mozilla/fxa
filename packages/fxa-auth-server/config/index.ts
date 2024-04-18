/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import convict from 'convict';
import fs from 'fs';
import { makeRedisConfig } from 'fxa-shared/db/config';
import { tracingConfig } from 'fxa-shared/tracing/config';
import { CloudTasksConvictConfigFactory } from '@fxa/shared/cloud-tasks';
import path from 'path';
import url from 'url';

import { makeConvictMySQLConfig as makeMySQLConfig } from '@fxa/shared/db/mysql/core';

const DEFAULT_SUPPORTED_LANGUAGES = require('./supportedLanguages');
const ONE_DAY = 1000 * 60 * 60 * 24;
const FIVE_MINUTES = 1000 * 60 * 5;

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const convictConf = convict({
  env: {
    doc: 'The current node.js environment',
    default: 'prod',
    format: ['dev', 'test', 'stage', 'prod'],
    env: 'NODE_ENV',
  },
  apiVersion: {
    doc: 'Number part of versioned endpoints - ex: /v1/account/status',
    format: Number,
    default: 1,
    env: 'AUTH_API_VERSION',
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
  // Prefixed with service name to disambiguate from above firestore config
  authFirestore: {
    credentials: {
      client_email: {
        default: 'test@localtest.com',
        doc: 'GCP Client key credential',
        env: 'AUTH_FIRESTORE_CLIENT_EMAIL_CREDENTIAL',
        format: String,
      },
      private_key: {
        default: '',
        doc: 'GCP Private key credential',
        env: 'AUTH_FIRESTORE_PRIVATE_KEY_CREDENTIAL',
        format: String,
      },
    },
    keyFilename: {
      default: path.resolve(__dirname, 'secret-key.json'),
      doc: 'Path to GCP key file',
      env: 'AUTH_FIRESTORE_KEY_FILE',
      format: String,
    },
    prefix: {
      default: 'fxa-auth-',
      doc: 'Firestore collection prefix',
      env: 'AUTH_FIRESTORE_COLLECTION_PREFIX',
      format: String,
    },
    projectId: {
      default: '',
      doc: 'GCP Project id',
      env: 'AUTH_FIRESTORE_PROJECT_ID',
      format: String,
    },
    ebPrefix: {
      default: 'fxa-eb-',
      doc: 'Event broker Firestore collection prefix',
      env: 'AUTH_EB_FIRESTORE_COLLECTION_PREFIX',
      format: String,
    },
  },
  pubsub: {
    audience: {
      default: 'example.com',
      doc: 'PubSub JWT Audience for incoming Push Notifications',
      env: 'PUBSUB_AUDIENCE',
      format: String,
    },
    authenticate: {
      default: true,
      doc: 'Authenticate that incoming Push Notification originate from Google',
      env: 'PUBSUB_AUTHENTICATE',
      format: Boolean,
    },
    verificationToken: {
      default: '',
      doc: 'PubSub Verification Token for incoming Push Notifications',
      env: 'PUBSUB_VERIFICATION_TOKEN',
      format: String,
    },
  },
  geodb: {
    dbPath: {
      doc: 'Path to the maxmind database file',
      default: require.resolve('fxa-geodb/db/cities-db.mmdb'),
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
    locationOverride: {
      doc: 'override for forcing location',
      format: Object,
      default: {},
      env: 'GEODB_LOCATION_OVERRIDE',
    },
  },
  appleAuthConfig: {
    clientId: {
      default: 'com.mozilla.firefox.accounts.auth',
      env: 'APPLE_AUTH_CLIENT_ID',
      format: String,
      doc: 'Apple auth client id',
    },
    clientSecret: {
      default: 'SSHH',
      env: 'APPLE_AUTH_CLIENT_SECRET',
      format: String,
      doc: 'Apple auth client secret',
    },
    keyId: {
      default: '',
      env: 'APPLE_AUTH_KEY_ID',
      format: String,
      doc: 'Apple auth key id',
    },
    redirectUri: {
      default:
        'https://localhost.dev:3030/post_verify/third_party_auth/callback',
      env: 'APPLE_AUTH_REDIRECT_URI',
      format: String,
      doc: 'Apple auth redirect uri',
    },
    privateKey: {
      default: '',
      env: 'APPLE_AUTH_PRIVATE_KEY',
      format: String,
      doc: 'Apple auth private key',
    },
    teamId: {
      default: '',
      env: 'APPLE_AUTH_TEAM_ID',
      format: String,
      doc: 'Apple auth team id',
    },
    tokenEndpoint: {
      default: 'https://appleid.apple.com/auth/token',
      env: 'APPLE_AUTH_TOKEN_ENDPOINT',
      format: String,
      doc: 'Apple auth token endpoint',
    },
    securityEventsClientIds: {
      default: ['com.mozilla.firefox.accounts.auth'],
      env: 'APPLE_AUTH_SECURITY_EVENTS_CLIENT_IDS',
      format: Array,
      doc: 'Apple auth security events client ids',
    },
  },
  googleAuthConfig: {
    clientId: {
      default:
        '218517873053-th4taguk9dvf03rrgk8sigon84oigf5l.apps.googleusercontent.com',
      env: 'GOOGLE_AUTH_CLIENT_ID',
      format: String,
      doc: 'Google auth client id',
    },
    clientSecret: {
      default: 'SSHH',
      env: 'GOOGLE_AUTH_CLIENT_SECRET',
      format: String,
      doc: 'Google auth client secret',
    },
    redirectUri: {
      default: 'http://localhost:3030/post_verify/third_party_auth/callback',
      env: 'GOOGLE_AUTH_REDIRECT_URI',
      format: String,
      doc: 'Google auth redirect uri',
    },
    tokenEndpoint: {
      default: 'https://oauth2.googleapis.com/token',
      env: 'GOOGLE_AUTH_TOKEN_ENDPOINT',
      format: String,
      doc: 'Google auth token endpoint',
    },
    securityEventsClientIds: {
      default: [
        '218517873053-th4taguk9dvf03rrgk8sigon84oigf5l.apps.googleusercontent.com',
      ],
      env: 'GOOGLE_AUTH_SECURITY_EVENTS_CLIENT_IDS',
      format: Array,
      doc: 'Google auth security events client ids',
    },
  },
  googleMapsApiKey: {
    default: '',
    env: 'GOOGLE_MAPS_APIKEY',
    format: String,
    doc: 'Google Maps Services API key',
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
  database: {
    mysql: {
      auth: makeMySQLConfig('AUTH', 'fxa'),
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
  customsHttpAgent: {
    maxSockets: {
      doc: 'The maximum number of sockets to be opened per host',
      default: 10000,
      env: 'CUSTOMS_MAX_SOCKETS',
    },
    maxFreeSockets: {
      doc: 'The maximum number of free sockets to keep open for a host',
      default: 10,
      env: 'CUSTOMS_MAX_FREE_SOCKETS',
    },
    timeoutMs: {
      doc: 'The timeout in milliseconds for the sockets',
      default: 30000,
      env: 'CUSTOMS_TIMEOUT_MS',
    },
    freeSocketTimeoutMs: {
      doc: 'The time in milliseconds for which a socket should remain open while unused',
      default: 15000,
      env: 'CUSTOMS_FREE_SOCKET_TIMEOUT_MS',
    },
  },
  contentServer: {
    url: {
      doc: 'The url of the corresponding fxa-content-server instance',
      default: 'http://localhost:3030',
      env: 'CONTENT_SERVER_URL',
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
    brandMessagingMode: {
      doc: 'The type of messaging to show. Options are prelaunch, postlaunch, or none',
      format: String,
      default: 'none',
      env: 'BRAND_MESSAGING_MODE',
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
      default: 'Mozilla <no-reply@lcip.org>',
      env: 'SMTP_SENDER',
    },
    pool: {
      default: false,
      doc: 'Should pooling be enabled for sending mail?',
      env: 'SMTP_POOL',
      format: Boolean,
    },
    maxMessages: {
      default: 10,
      doc: 'Maximum number of messages to be sent via nodemailer before a new SES SMTP connection is made',
      env: 'SMTP_MAX_MESSAGES',
      format: Number,
    },
    maxConnections: {
      default: 2,
      doc: 'Maximum number of simultaneous connections to make against the SES SMTP server',
      env: 'SMTP_MAX_CONNECTIONS',
      format: Number,
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
    firefoxDesktopUrl: {
      doc: 'url to download Firefox page',
      format: String,
      default:
        'https://firefox.com?utm_content=registration-confirmation&utm_medium=email&utm_source=fxa',
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
        'https://support.mozilla.org/kb/im-having-problems-my-firefox-account',
    },
    redirectDomain: {
      doc: 'Domain that mail urls are allowed to redirect to',
      format: String,
      default: 'firefox.com',
      env: 'REDIRECT_DOMAIN',
    },
    privacyUrl: {
      doc: 'url to Mozilla Accounts privacy page',
      format: String,
      default: 'https://www.mozilla.org/privacy/mozilla-accounts/',
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
    bounces: {
      enabled: {
        doc: 'Flag to enable checking for bounces before sending email',
        format: Boolean,
        default: true,
        env: 'BOUNCES_ENABLED',
      },
      complaint: {
        doc: 'Tiers of max allowed complaints per amount of milliseconds',
        format: Object,
        default: {
          // # of bounces allowed : time since last bounce
          0: 3 * FIVE_MINUTES,
          1: ONE_DAY,
        },
        env: 'BOUNCES_COMPLAINT',
      },
      hard: {
        doc: 'Tiers of max allowed hard bounces per amount of milliseconds',
        format: Object,
        default: {
          // # of bounces allowed : time since last bounce
          0: 3 * FIVE_MINUTES,
          1: ONE_DAY,
        },
        env: 'BOUNCES_HARD',
      },
      soft: {
        doc: 'Tiers of max allowed soft bounces per amount of milliseconds',
        format: Object,
        default: {
          0: FIVE_MINUTES,
        },
        env: 'BOUNCES_SOFT',
      },
      ignoreTemplates: {
        doc: 'Always ignore bounces from these email templates',
        format: Array,
        default: [
          'verifyLoginCode',
          'verifyLogin',
          'recovery',
          'unblockCode',
          'subscriptionAccountFinishSetup',
        ],
        env: 'BOUNCES_IGNORE_TEMPLATES',
      },
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
  redis: makeRedisConfig(),
  subhubServerMessaging: {
    region: {
      doc: 'The region where the queues live',
      format: String,
      env: 'SUBHUB_REGION',
      default: '',
    },
    subhubUpdatesQueueUrl: {
      doc: 'The queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
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
      default: '24 hours',
    },
    passwordChangeToken: {
      format: 'duration',
      env: 'PASSWORD_CHANGE_TOKEN_TTL',
      default: '15 minutes',
    },
    sessionTokenWithoutDevice: {
      doc: 'Maximum age for session tokens without a device record, specify zero to disable',
      format: 'duration',
      env: 'SESSION_TOKEN_WITHOUT_DEVICE_TTL',
      default: '4 weeks',
    },
  },
  tokenPruning: {
    enabled: {
      doc: 'Turn on pruning for tokens',
      format: Boolean,
      default: true,
      env: 'TOKEN_PRUNING_ENABLED',
    },
    maxAge: {
      doc: 'Age at which to prune. (Set to 0 to disable token pruning)',
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
    doc: 'Amazon SNS topic on which to send account event notifications. Set to "disabled" to turn off the notifier',
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
      doc: 'The region where the queues live, most likely the same region we are sending email e.g. us-east-1, us-west-2',
      format: String,
      env: 'BOUNCE_REGION',
      default: '',
    },
    bounceQueueUrl: {
      doc: 'The bounce queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'BOUNCE_QUEUE_URL',
      default: '',
    },
    complaintQueueUrl: {
      doc: 'The complaint queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'COMPLAINT_QUEUE_URL',
      default: '',
    },
    deliveryQueueUrl: {
      doc: 'The email delivery queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'DELIVERY_QUEUE_URL',
      default: '',
    },
    notificationQueueUrl: {
      doc: 'Queue URL for notifications from fxa-email-service (eventually this will be the only email-related queue)',
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
      doc: 'The queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
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
      doc: 'Secret for server-to-server bearer token auth for fxa-profile-server',
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
      doc: 'Indicates whether to use stub methods for SubHub instead of talking to the server',
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
    customerCacheTtlSeconds: {
      doc: 'The number of seconds to cache a Stripe Customer response',
      format: 'int',
      default: 3600,
      env: 'SUBHUB_CUSTOMER_CACHE_TTL_SECONDS',
    },
    plansCacheTtlSeconds: {
      doc: 'The number of seconds to cache the list of plans from subhub',
      format: 'int',
      default: 64000000, // about a couple years
      env: 'SUBHUB_PLANS_CACHE_TTL_SECONDS',
    },
    stripeTaxRatesCacheTtlSeconds: {
      doc: 'The number of seconds to cache tax rates from Stripe',
      format: 'int',
      default: 64000000, // about a couple years
      env: 'SUBHUB_TAX_RATES_CACHE_TTL_SECONDS',
    },
  },
  subscriptions: {
    enabled: {
      doc: 'Indicates whether subscriptions APIs are enabled',
      format: Boolean,
      env: 'SUBSCRIPTIONS_ENABLED',
      default: false,
    },
    paymentsServer: {
      url: {
        doc: 'The url of the corresponding fxa-payments-server instance',
        env: 'PAYMENTS_SERVER_URL',
        format: 'url',
        default: 'https://subscriptions.firefox.com',
      },
    },
    paypalNvpSigCredentials: {
      enabled: {
        doc: 'Indicates whether PayPal APIs are enabled',
        format: Boolean,
        env: 'SUBSCRIPTIONS_PAYPAL_ENABLED',
        default: false,
      },
      sandbox: {
        doc: 'PayPal Sandbox mode',
        format: Boolean,
        env: 'PAYPAL_SANDBOX',
        default: true,
      },
      user: {
        doc: 'PayPal NVP API User name',
        format: String,
        default: 'user',
        env: 'PAYPAL_NVP_USER',
      },
      pwd: {
        doc: 'PayPal NVP API password',
        format: String,
        default: 'user',
        env: 'PAYPAL_NVP_PWD',
      },
      signature: {
        doc: 'PayPal NVP API signature',
        format: String,
        default: 'user',
        env: 'PAYPAL_NVP_SIGNATURE',
      },
    },
    appStore: {
      credentials: {
        doc: 'Map of AppStore Connect credentials by app bundle ID',
        format: Object,
        default: {
          // Cannot use an actual bundleId (e.g. 'org.mozilla.ios.FirefoxVPN') as the key
          // due to https://github.com/mozilla/node-convict/issues/250
          org_mozilla_ios_FirefoxVPN: {
            issuerId: 'issuer_id',
            serverApiKey: 'key',
            serverApiKeyId: 'key_id',
          },
        },
        env: 'APP_STORE_CREDENTIALS',
      },
      enabled: {
        doc: 'Indicates whether the App Store API is enabled',
        format: Boolean,
        default: false,
        env: 'SUBSCRIPTIONS_APP_STORE_API_ENABLED',
      },
      sandbox: {
        doc: 'Apple App Store Sandbox mode',
        format: Boolean,
        env: 'APP_STORE_SANDBOX',
        default: true,
      },
    },
    playApiServiceAccount: {
      credentials: {
        client_email: {
          default: 'test@localtest.com',
          doc: 'The email of the service account to use for Play API calls',
          env: 'SUBSCRIPTIONS_PLAY_CLIENT_EMAIL_CREDENTIAL',
          format: String,
        },
        private_key: {
          default: '',
          doc: 'The private key of the service account to use for Play API calls',
          env: 'SUBSCRIPTIONS_PLAY_PRIVATE_KEY_CREDENTIAL',
          format: String,
        },
      },
      keyFilename: {
        default: '',
        doc: 'Path to GCP key file',
        env: 'SUBSCRIPTIONS_PLAY_KEY_FILE',
        format: String,
      },
      projectId: {
        default: '',
        doc: 'GCP Project id for Play Store Account',
        env: 'SUBSCRIPTIONS_PLAY_API_PROJECT_ID',
        format: String,
      },
      enabled: {
        doc: 'Indicates whether the Play API is enabled',
        format: Boolean,
        default: false,
        env: 'SUBSCRIPTIONS_PLAY_API_ENABLED',
      },
    },
    productConfigsFirestore: {
      enabled: {
        default: false,
        doc: 'Whether to use Firestore for product configurations',
        env: 'SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED',
        format: Boolean,
      },
      schemaValidation: {
        cdnUrlRegex: {
          default: '^https://accounts-static.cdn.mozilla.net',
          doc: 'CDN URL Regex',
          env: 'SUBSCRIPTIONS_FIRESTORE_CONFIGS_CDN_URL_REGEX',
          format: String,
        },
      },
    },
    sharedSecret: {
      doc: 'Shared secret for authentication between backend subscription services',
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
    stripeWebhookPayloadLimit: {
      default: 1048576,
      env: 'STRIPE_WEBHOOK_PAYLOAD_LIMIT',
      format: 'int',
      doc: 'The maximum payload size in bytes that will be accepted by the Stripe webhook endpoint',
    },
    stripeWebhookSecret: {
      default: '',
      env: 'STRIPE_WEBHOOK_SECRET',
      format: String,
      doc: 'A shared secret to authenticate Stripe webhook requests',
    },
    taxIds: {
      doc: 'Mapping of currency to tax ID to show on invoices.',
      format: Object,
      default: {
        EUR: 'EU1234',
        CHF: 'CH1234',
      },
      env: 'TAXIDS',
    },
    transactionalEmails: {
      // See also: https://jira.mozilla.com/browse/FXA-1148
      enabled: {
        doc: 'Indicates whether FxA sends transactional lifecycle emails for subscriptions (i.e. versus Marketing Cloud)',
        format: Boolean,
        env: 'SUBSCRIPTIONS_TRANSACTIONAL_EMAILS_ENABLED',
        default: true,
      },
    },
  },
  currenciesToCountries: {
    doc: 'Mapping from ISO 4217 three-letter currency codes to list of ISO 3166-1 alpha-2 two-letter country codes: {"EUR": ["DE", "FR"], "USD": ["CA", "GB", "US" ]}  Requirement for only one currency per country. Tested at runtime. Must be uppercased.',
    format: Object,
    default: {
      USD: ['US', 'GB', 'NZ', 'MY', 'SG', 'CA', 'AS', 'GU', 'MP', 'PR', 'VI'],
      EUR: ['FR', 'DE'],
    },
    env: 'CURRENCIES',
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
      doc: 'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
      format: Object,
      default: {},
      env: 'OAUTH_CLIENT_IDS',
    },
    oldSyncClientIds: {
      doc: 'Client IDs of sync clients that migrated to OAuth.',
      format: Array,
      default: ['5882386c6d801776', '1b1a3e44c54fbb58'],
      env: 'OAUTH_OLD_SYNC_CLIENT_IDS',
    },
    // A safety switch for disabling new signins/signups from particular clients,
    // as a hedge against unexpected client behaviour.
    disableNewConnectionsForClients: {
      doc: 'Comma-separated list of oauth client ids for which new connections should be temporarily refused',
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
      doc: 'Comma-separated list of secret keys for verifying oauth-to-auth server JWTs',
      env: 'OAUTH_SERVER_SECRETS',
      format: Array,
      default: ['megaz0rd'],
    },
  },
  oauthServer: {
    admin: {
      whitelist: {
        doc: 'An array of regexes. Passing any one will get through.',
        default: ['@mozilla\\.com$'],
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
      doc: 'Comma-separated list of secret keys for verifying server-to-server JWTs',
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
        doc: 'Enable client management in OAuth server routes. Do NOT set this to true in production.',
        default: false,
        format: 'Boolean',
        env: 'CLIENT_MANAGEMENT_ENABLED',
      },
    },
    clientIdToServiceNames: {
      // This is used by oauth/db/index.js to identify pocket client ids so that it
      // can store them separately in mysql.
      // It's also used for amplitude stats
      doc: 'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
      default: {},
      format: 'Object',
      env: 'OAUTH_CLIENT_IDS',
    },
    disabledClients: {
      doc: 'Comma-separated list of client ids for which service should be temporarily refused',
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
        doc: 'Whether or not config.events has to be properly set in production',
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
        // Warning: here be dragons. 365 minutes is 6 hours plus 5 minutes.
        // This value is intended to be just slightly larger than the constant
        // that determines if a JWT is stored in the database or not,
        // SHORT_ACCESS_TTL_TOKEN_IN_MS (found in fxa-shared/oauth/constants), currently
        // 6 hours. We want to keep this FXA_EXPIRATION_ACCESS_TOKEN default
        // value greater than 6 hours, because tokens not backed by the
        // database are validated slightly differently (see lib/oauth/token).
        // Setting this FXA_EXPIRATION_ACCESS_TOKEN config value at or below
        // SHORT_ACCESS_TTL_TOKEN_IN_MS should be done with caution. See #5143
        // and the discussion in #6368.
        default: '365 minutes',
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
        doc: 'lastUsedAt only gets updated in MySQL after this delay',
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
      createSchema: { default: false, env: 'CREATE_MYSQL_SCHEMA' },
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
      queueLimit: {
        doc: 'The maximum number of connection requests the pool will queue before returning an error.',
        default: 0,
        env: 'MYSQL_QUEUE_LIMIT',
      },
      idleLimitMs: {
        doc: 'The number of milliseconds a connection can be idle before it is closed.',
        format: Number,
        default: 10000,
        env: 'MYSQL_IDLE_LIMIT_MS',
      },
      timezone: {
        default: 'Z',
        doc: 'The timezone configured on the MySQL server. This is used to type cast server date/time values to JavaScript `Date` object. Can be `local`, `Z`, or an offset in the form of or an offset in the form +HH:MM or -HH:MM.',
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
        doc: 'Path to private key JWK that will be used to sign JWTs in the future',
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
        doc: 'Do not error out if there is no active key; should only be used when initializing keys',
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
        doc: 'client_ids that receive automatically rotating PPIDs based on server time',
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
      doc: 'Hapi: a string with the value of the "Cache-Control" header when caching is disabled',
      format: 'String',
      default: 'private, no-cache, no-store, must-revalidate',
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
  remoteAddressChainOverride: {
    doc: 'Override address chain with this chain. Should be comma separated list of IPs',
    format: String,
    env: 'REMOTE_ADDRESS_CHAIN_OVERRIDE',
    default: '',
  },
  signinConfirmation: {
    forcedEmailAddresses: {
      doc: 'Force sign-in confirmation for email addresses matching this regex.',
      format: RegExp,
      default: /.+@mozilla\.com$/,
      env: 'SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX',
    },
    skipForEmailAddresses: {
      doc: 'Comma separated list of email addresses that will always skip any non TOTP sign-in confirmation',
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
        doc: '(Deprecated) Number of digits to make up a token code',
        default: 6,
        env: 'SIGNIN_TOKEN_CODE_LENGTH',
      },
      codeLifetime: {
        doc: '(Deprecated) How long code should be valid for',
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
      doc: 'Force password change for email addresses matching this regex.',
      format: RegExp,
      default: /^$/, // default is no one
      env: 'FORCE_PASSWORD_CHANGE_EMAIL_REGEX',
    },
  },
  securityHistory: {
    ipProfiling: {
      allowedRecency: {
        doc: 'Length of time since previously verified event to allow skipping confirmation',
        default: '72 hours',
        format: 'duration',
        env: 'IP_PROFILING_RECENCY',
      },
    },
    ipHmacKey: {
      doc: 'A secret to hash IP addresses for security history events',
      default: 'changeme',
      env: 'IP_HMAC_KEY',
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
      doc: 'sample rate for updates to the lastAccessTime session token property, in the range 0..1',
      format: Number,
      default: 0.3,
      env: 'LASTACCESSTIME_UPDATES_SAMPLE_RATE',
    },
    earliestSaneTimestamp: {
      doc: 'timestamp used as the basis of the fallback value for lastAccessTimeFormatted, currently pinned to the deployment of 1.96.4 / a0940d7dc51e2ba20fa18aa3a830810e35c9a9d9',
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
      doc: 'If feature enabled, force sign-in unblock for email addresses matching this regex.',
      format: RegExp,
      default: /^$/, // default is no one
      env: 'SIGNIN_UNBLOCK_FORCED_EMAILS',
    },
  },
  push: {
    allowedServerRegex: {
      doc: 'RegExp that validates the URI format of the Push Server',
      format: RegExp,
      // eslint-disable-next-line no-useless-escape
      default:
        /^https:\/\/[a-zA-Z0-9._-]+(\.services\.mozilla\.com|autopush\.dev\.mozaws\.net|autopush\.stage\.mozaws\.net)(?::\d+)?(\/.*)?$/,
    },
  },
  pushbox: {
    enabled: {
      doc: 'Indicates whether Pushbox integration enabled',
      format: Boolean,
      default: false,
      env: 'PUSHBOX_ENABLED',
    },
    maxTTL: {
      doc: 'Maximum TTL to set on items written to pushbox',
      format: 'duration',
      default: '28 days',
      env: 'PUSHBOX_MAX_TTL',
    },
    database: makeMySQLConfig('PUSHBOX', 'pushbox'),
  },
  secondaryEmail: {
    minUnverifiedAccountTime: {
      doc: 'The minimum amount of time an account can be unverified before another account can use it for secondary email',
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
  sentry: {
    dsn: {
      doc: 'Sentry DSN for error and log reporting',
      default: '',
      format: 'String',
      env: 'SENTRY_DSN',
    },
    env: {
      doc: 'Environment name to report to sentry',
      default: 'local',
      format: ['local', 'ci', 'dev', 'stage', 'prod'],
      env: 'SENTRY_ENV',
    },
    sampleRate: {
      doc: 'Rate at which sentry errors are captured.',
      default: 1.0,
      format: 'Number',
      env: 'SENTRY_SAMPLE_RATE',
    },
    serverName: {
      doc: 'Name used by sentry to identify the server.',
      default: 'fxa-auth-server',
      format: 'String',
      env: 'SENTRY_SERVER_NAME',
    },
    tracesSampleRate: {
      doc: 'Rate at which sentry traces are captured',
      default: 0,
      format: 'Number',
      env: 'SENTRY_TRACES_SAMPLE_RATE',
    },
  },
  totp: {
    serviceName: {
      doc: 'Default service name to appear in authenticator',
      default: 'Mozilla',
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
      length: {
        doc: 'The length of a backup authentication code',
        default: 10,
        format: 'nat',
        env: 'RECOVERY_CODE_LENGTH',
      },
      count: {
        doc: 'Number of backup authentication codes to create',
        default: 8,
        env: 'RECOVERY_CODE_COUNT',
      },
      notifyLowCount: {
        doc: 'Notify the user when there are less than these many backup authentication codes',
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
      doc: 'Time since account creation after which the second reminder is sent',
      default: '5 days',
      env: 'VERIFICATION_REMINDERS_SECOND_INTERVAL',
      format: 'duration',
    },
    finalInterval: {
      doc: 'Time since account creation after which the final reminder is sent',
      default: '15 days',
      env: 'VERIFICATION_REMINDERS_FINAL_INTERVAL',
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
        doc: 'Maximum connection count for the verification reminders Redis pool',
        env: 'VERIFICATION_REMINDERS_REDIS_MAX_CONNECTIONS',
        format: 'nat',
      },
      minConnections: {
        default: 1,
        doc: 'Minimum connection count for the verification reminders Redis pool',
        env: 'VERIFICATION_REMINDERS_REDIS_MIN_CONNECTIONS',
        format: 'nat',
      },
    },
  },
  subscriptionAccountReminders: {
    rolloutRate: {
      doc: 'Rollout rate for subscriptionAccount reminder emails, in the range 0 .. 1',
      default: 1,
      env: 'SUBSCRIPTION_ACCOUNT_REMINDERS_ROLLOUT_RATE',
      format: Number,
    },
    firstInterval: {
      doc: 'Time since account creation after which the first reminder is sent',
      default: '1 day',
      env: 'SUBSCRIPTION_ACCOUNT_REMINDERS_FIRST_INTERVAL',
      format: 'duration',
    },
    secondInterval: {
      doc: 'Time since account creation after which the second reminder is sent',
      default: '5 days',
      env: 'SUBSCRIPTION_ACCOUNT_REMINDERS_SECOND_INTERVAL',
      format: 'duration',
    },
    redis: {
      prefix: {
        default: 'subscriptionAccountReminders:',
        doc: 'Key prefix for the verification reminders Redis pool',
        env: 'SUBSCRIPTION_ACCOUNT_REMINDERS_REDIS_PREFIX',
        format: String,
      },
      maxConnections: {
        default: 10,
        doc: 'Maximum connection count for the subscriptionAccount reminders Redis pool',
        env: 'SUBSCRIPTION_ACCOUNT_REMINDERS_REDIS_MAX_CONNECTIONS',
        format: 'nat',
      },
      minConnections: {
        default: 1,
        doc: 'Minimum connection count for the subscriptionAccount reminders Redis pool',
        env: 'SUBSCRIPTION_ACCOUNT_REMINDERS_REDIS_MIN_CONNECTIONS',
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
      default: 360022027772,
      env: 'ZENDESK_PRODUCT_NAME_FIELD_ID',
      format: Number,
    },
    productFieldId: {
      doc: 'Zendesk support ticket custom field for the product drop down',
      default: 360047198211,
      env: 'ZENDESK_PRODUCT_FIELD_ID',
      format: Number,
    },
    locationCityFieldId: {
      doc: 'Zendesk support ticket custom field for the city of the location',
      default: 360026463311,
      env: 'ZENDESK_LOCATION_CITY_FIELD_ID',
      format: Number,
    },
    locationStateFieldId: {
      doc: 'Zendesk support ticket custom field for the state/region of the location',
      default: 360026463491,
      env: 'ZENDESK_LOCATION_STATE_FIELD_ID',
      format: Number,
    },
    locationCountryFieldId: {
      doc: 'Zendesk support ticket custom field for the country of the location',
      default: 360026463511,
      env: 'ZENDESK_LOCATION_COUNTRY_FIELD_ID',
      format: Number,
    },
    topicFieldId: {
      doc: 'Zendesk support ticket custom field for topic',
      default: 360028484432,
      env: 'ZENDESK_TOPIC_FIELD_ID',
      format: Number,
    },
    categoryFieldId: {
      doc: 'Zendesk support ticket category field for category drop down',
      default: 360047206172,
      env: 'ZENDESK_CATEGORY_FIELD_ID',
      format: Number,
    },
    appFieldId: {
      doc: 'Zendesk support ticket custom field for product specific app or service',
      default: 360030780972,
      env: 'ZENDESK_APP_FIELD_ID',
      format: Number,
    },
    productPlatformFieldId: {
      doc: 'Zendesk support ticket custom field for the product platform',
      default: 360047272851,
      env: 'ZENDESK_PRODUCT_PLATFORM_FIELD_ID',
      format: Number,
    },
    productVersionFieldId: {
      doc: 'Zendesk support ticket custom field for product version',
      default: 360047246812,
      env: 'ZENDESK_PRODUCT_VERSION_FIELD_ID',
      format: Number,
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
  passwordForgotOtp: {
    enabled: {
      doc: 'Feature flag for init password reset with emailed OTP',
      format: Boolean,
      default: false,
      env: 'OTP_PASSWORD_FORGOT_ENABLED',
    },
    digits: {
      doc: 'Number of digits in token',
      default: 8,
      format: 'nat',
      env: 'OTP_PASSWORD_FORGOT_DIGITS',
    },
    ttl: {
      doc: 'Duration in seconds when the OTP is valid',
      default: 10 * 60,
      format: 'nat',
      env: 'OTP_PASSWORD_FORGOT_TTL',
    },
  },
  syncTokenserverUrl: {
    default: 'http://localhost:5000/token',
    doc: 'The url of the Firefox Sync tokenserver',
    env: 'SYNC_TOKENSERVER_URL',
    format: 'url',
  },
  support: {
    secretBearerToken: {
      default: 'YOU MUST CHANGE ME',
      doc: 'Shared secret to access the support endpoint.',
      env: 'SUPPORT_AUTH_SECRET_BEARER_TOKEN',
      format: 'String',
    },
    ticketPayloadLimit: {
      default: 131072,
      doc: 'The payload limit in bytes, default is 2^17',
      env: 'SUPPORT_TICKET_PAYLOAD_LIMIT',
      format: Number,
    },
  },
  tracing: tracingConfig,
  accountEvents: {
    enabled: {
      default: true,
      doc: 'Flag to enable account event logging. Currently only email based events',
      env: 'ACCOUNT_EVENTS_ENABLED',
      format: Boolean,
    },
  },
  gleanMetrics: {
    enabled: {
      default: true,
      doc: 'Enable Glean metrics logging',
      env: 'AUTH_GLEAN_ENABLED',
      format: Boolean,
    },
    applicationId: {
      default: 'accounts_backend_dev',
      doc: 'The Glean application id',
      env: 'AUTH_GLEAN_APP_ID',
      format: String,
    },
    channel: {
      default: 'development',
      doc: 'The application channel, e.g. development, stage, production, etc.',
      env: 'AUTH_GLEAN_APP_CHANNEL',
      format: String,
    },
    loggerAppName: {
      default: 'fxa-auth-api',
      doc: 'Used to form the mozlog logger name',
      env: 'AUTH_GLEAN_LOGGER_APP_NAME',
      format: String,
    },
  },
  certificateSignDisableRolloutRate: {
    default: 0,
    doc: 'Rollout rate for disabling certificate signing, in the range 0 .. 1',
    env: 'CERTIFICATE_SIGN_DISABLE_ROLLOUT_RATE',
    format: Number,
  },
  contentful: {
    cdnUrl: {
      doc: 'Base URL for Content Delivery API (https://www.contentful.com/developers/docs/references/content-delivery-api/)',
      format: String,
      env: 'CONTENTFUL_CDN_API_URL',
      default: '',
    },
    graphqlUrl: {
      default: '',
      doc: 'Base URL for GraphQL Content API (https://www.contentful.com/developers/docs/references/graphql/)',
      env: 'CONTENTFUL_GRAPHQL_API_URL',
      format: String,
    },
    apiKey: {
      default: '',
      doc: 'GraphQL Content API key for Contentful hCMS to fetch RP-provided content (https://www.contentful.com/developers/docs/references/authentication/)',
      env: 'CONTENTFUL_GRAPHQL_API_KEY',
      format: String,
    },
    spaceId: {
      default: '',
      doc: 'Alphanumeric id used for instantiating the ContentfulClient (https://www.contentful.com/developers/docs/references/content-management-api/#/reference/spaces)',
      env: 'CONTENTFUL_GRAPHQL_SPACE_ID',
      format: String,
    },
    environment: {
      default: '',
      doc: 'Environment alias used for instantiating the ContentfulClient (https://www.contentful.com/developers/docs/concepts/multiple-environments/)',
      env: 'CONTENTFUL_GRAPHQL_ENVIRONMENT',
      format: String,
    },
    firestoreCacheCollectionName: {
      default: 'fxa-auth-server-contentful-query-cache',
      doc: 'Firestore collection name to store Contentful query cache',
      env: 'CONTENTFUL_FIRESTORE_CACHE_COLLECTION_NAME',
      format: String,
    },
    enabled: {
      default: false,
      doc: 'Whether to use Contentful',
      env: 'CONTENTFUL_ENABLED',
      format: Boolean,
    },
  },
  cloudTasks: CloudTasksConvictConfigFactory(),
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

let envConfig = path.join(__dirname, `${convictConf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
convictConf.loadFile(files);
convictConf.validate();

// set the public url as the issuer domain for assertions
convictConf.set('domain', url.parse(convictConf.get('publicUrl')).host);

// derive fxa-auth-mailer configuration from our content-server url
const baseUri = convictConf.get('contentServer.url');
convictConf.set('smtp.accountSettingsUrl', `${baseUri}/settings`);
convictConf.set(
  'smtp.accountRecoveryCodesUrl',
  `${baseUri}/settings/two_step_authentication/replace_codes`
);
convictConf.set('smtp.verificationUrl', `${baseUri}/verify_email`);
convictConf.set('smtp.pushVerificationUrl', `${baseUri}/push/confirm_login`);
convictConf.set('smtp.passwordResetUrl', `${baseUri}/complete_reset_password`);
convictConf.set('smtp.initiatePasswordResetUrl', `${baseUri}/reset_password`);
convictConf.set(
  'smtp.initiatePasswordChangeUrl',
  `${baseUri}/settings/change_password`
);
convictConf.set('smtp.verifyLoginUrl', `${baseUri}/complete_signin`);
convictConf.set(
  'smtp.accountFinishSetupUrl',
  `${baseUri}/post_verify/finish_account_setup/set_password`
);
convictConf.set('smtp.reportSignInUrl', `${baseUri}/report_signin`);
convictConf.set(
  'smtp.revokeAccountRecoveryUrl',
  `${baseUri}/settings#recovery-key`
);
convictConf.set(
  'smtp.createAccountRecoveryUrl',
  `${baseUri}/settings/account_recovery`
);
convictConf.set(
  'smtp.verifyPrimaryEmailUrl',
  `${baseUri}/verify_primary_email`
);
convictConf.set(
  'smtp.verifySecondaryEmailUrl',
  `${baseUri}/verify_secondary_email`
);
convictConf.set('smtp.subscriptionSettingsUrl', `${baseUri}/subscriptions`);
convictConf.set('smtp.subscriptionSupportUrl', `${baseUri}/support`);
convictConf.set('smtp.syncUrl', `${baseUri}/connect_another_device`);

convictConf.set('isProduction', convictConf.get('env') === 'prod');

//sns endpoint is not to be set in production
if (convictConf.has('snsTopicEndpoint') && convictConf.get('env') !== 'dev') {
  throw new Error('snsTopicEndpoint is only allowed in dev env');
}

if (convictConf.get('env') === 'dev') {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    process.env.AWS_ACCESS_KEY_ID = 'DEV_KEY_ID';
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    process.env.AWS_SECRET_ACCESS_KEY = 'DEV_ACCESS_KEY';
  }
}

if (convictConf.get('oauthServer.openid.keyFile')) {
  const keyFile = path.resolve(
    __dirname,
    '..',
    convictConf.get('oauthServer.openid.keyFile')
  );
  convictConf.set('oauthServer.openid.keyFile', keyFile);
  // If the file doesnt exist, or contains an empty object, then there's no active key.
  convictConf.set('oauthServer.openid.key', null);
  if (fs.existsSync(keyFile)) {
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf-8'));
    if (key && Object.keys(key).length > 0) {
      convictConf.set('oauthServer.openid.key', key);
    }
  }
} else if (
  Object.keys(convictConf.get('oauthServer.openid.key')).length === 0
) {
  convictConf.set('oauthServer.openid.key', null);
}

if (convictConf.get('oauthServer.openid.newKeyFile')) {
  const newKeyFile = path.resolve(
    __dirname,
    '..',
    convictConf.get('oauthServer.openid.newKeyFile')
  );
  convictConf.set('oauthServer.openid.newKeyFile', newKeyFile);
  // If the file doesnt exist, or contains an empty object, then there's no new key.
  convictConf.set('oauthServer.openid.newKey', null);
  if (fs.existsSync(newKeyFile)) {
    const newKey = JSON.parse(fs.readFileSync(newKeyFile, 'utf-8'));
    if (newKey && Object.keys(newKey).length > 0) {
      convictConf.set('oauthServer.openid.newKey', newKey);
    }
  }
} else if (
  Object.keys(convictConf.get('oauthServer.openid.newKey')).length === 0
) {
  convictConf.set('oauthServer.openid.newKey', null);
}

if (convictConf.get('oauthServer.openid.oldKeyFile')) {
  const oldKeyFile = path.resolve(
    __dirname,
    '..',
    convictConf.get('oauthServer.openid.oldKeyFile')
  );
  convictConf.set('oauthServer.openid.oldKeyFile', oldKeyFile);
  // If the file doesnt exist, or contains an empty object, then there's no old key.
  convictConf.set('oauthServer.openid.oldKey', null);
  if (fs.existsSync(oldKeyFile)) {
    const oldKey = JSON.parse(fs.readFileSync(oldKeyFile, 'utf-8'));
    if (oldKey && Object.keys(oldKey).length > 0) {
      convictConf.set('oauthServer.openid.oldKey', oldKey);
    }
  }
} else if (
  Object.keys(convictConf.get('oauthServer.openid.oldKey')).length === 0
) {
  convictConf.set('oauthServer.openid.oldKey', null);
}

// Ensure secrets are not set to their default values in production.
if (convictConf.get('isProduction')) {
  const SECRET_SETTINGS = [
    'metrics.flow_id_key',
    'oauth.jwtSecretKeys',
    'oauth.secretKey',
    'profileServer.secretBearerToken',
  ];
  for (const key of SECRET_SETTINGS) {
    if (convictConf.get(key) === convictConf.default(key)) {
      throw new Error(`Config '${key}' must be set in production`);
    }
  }
}

export type conf = typeof convictConf;
export type ConfigType = ReturnType<conf['getProperties']>;

export { convictConf as config };
export default convictConf;
