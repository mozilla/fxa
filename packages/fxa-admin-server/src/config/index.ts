/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import fs from 'fs';
import { makeMySQLConfig, makeRedisConfig } from 'fxa-shared/db/config';
import { GuardConfig, USER_EMAIL_HEADER } from '@fxa/shared/guards';
import { tracingConfig } from '@fxa/shared/otel';
import path from 'path';
import { CloudTasksConvictConfigFactory } from '@fxa/shared/cloud-tasks';

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  gql: {
    allowlist: {
      doc: 'A list of json files holding allowed gql queries',
      env: 'GQL_ALLOWLIST',
      default: [
        'src/config/gql/allowlist/fxa-admin-panel.json',
        'src/config/gql/allowlist/gql-playground.json',
      ],
      format: Array,
    },
    enabled: {
      doc: 'Toggles whether or not gql queries are checked against the allowlist.',
      env: 'GQL_ALLOWLIST_ENABLED',
      default: true,
      format: Boolean,
    },
  },
  authHeader: {
    default: USER_EMAIL_HEADER,
    doc: 'Authentication header that should be logged for the user',
    env: 'AUTH_HEADER',
    format: String,
  },
  authServer: {
    url: {
      doc: 'URL of fxa-auth-server',
      env: 'AUTH_SERVER_URL',
      default: 'http://localhost:9000/v1',
    },
  },
  authClient: {
    keyStretchVersion: {
      doc: 'Version of key stretching to use',
      env: 'AUTH_CLIENT_KEY_STRETCH_VERSION',
      default: 1,
      format: 'Number',
    },
  },
  user: {
    group: {
      default: '',
      doc: 'Group to operate under for dev / test.',
      env: 'TEST_USER_GROUP',
      format: String,
    },
    email: {
      default: '',
      doc: 'Email to operate under for dev / test.',
      env: 'TEST_USER_EMAIL',
      format: String,
    },
  },
  database: {
    fxa: makeMySQLConfig('AUTH', 'fxa'),
    profile: makeMySQLConfig('PROFILE', 'fxa_profile'),
    fxa_oauth: makeMySQLConfig('OAUTH', 'fxa_oauth'),
  },
  redis: makeRedisConfig(),
  rateLimit: {
    ignoreIPs: {
      default: undefined,
      doc: 'Set of IPs to ignore while rate limiting. Rules will not apply to these values.',
      env: 'RATE_LIMIT__IGNORE_IPS',
      format: Array,
    },
    ignoreUIDs: {
      default: undefined,
      doc: 'Set of UIDs to ignore while rate limiting. Rules will not apply to these values.',
      env: 'RATE_LIMIT__IGNORE_UIDS',
      format: Array,
    },
    ignoreEmails: {
      default: undefined,
      doc: 'Set of emails to ignore while rate limiting. Rules will not apply to these values. Values can be a string or parsable regex.',
      env: 'RATE_LIMIT__IGNORE_EMAILS',
      format: Array,
    },
    rules: {
      default: '',
      doc: 'Rules for rate limiting user actions. These are essentially customs v2 rules.',
      env: 'RATE_LIMIT__RULES',
      format: String,
    },
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  log: {
    app: { default: 'fxa-user-admin-server' },
    fmt: {
      default: 'heka',
      env: 'LOGGING_FORMAT',
      format: ['heka', 'pretty'],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
    auditSanitizeProperties: {
      default: ['password', 'sessionToken', 'token', 'secret', 'key', 'auth'],
      doc: 'Properties to sanitize in the audit log',
      env: 'LOGGING_AUDIT_SANITIZE_PROPERTIES',
      format: Array,
    },
  },
  port: {
    default: 8095,
    doc: 'Default port to listen on',
    env: 'PORT',
    format: Number,
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
      default: 'fxa-admin-server',
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
        // Important - For development use ./secrets.json file for actual set of credential bundles!
        doc: 'Map of AppStore Connect credentials by app bundle ID',
        format: Object,
        default: {
          // Cannot use an actual bundleId (e.g. 'org.mozilla.ios.FirefoxVPN') as the key
          // due to https://github.com/mozilla/node-convict/issues/250
          // org_mozilla_ios_FirefoxVPN: {
          //   issuerId: 'issuer_id',
          //   serverApiKey: 'key',
          //   serverApiKeyId: 'key_id',
          // },
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
          default: ['^https://cdn.accounts.firefox.com'],
          doc: 'CDN URL Regex',
          env: 'SUBSCRIPTIONS_FIRESTORE_CONFIGS_CDN_URL_REGEX',
          format: Array,
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
  tracing: tracingConfig,
  metrics: {
    host: {
      default: '',
      doc: 'Metrics host to report to',
      env: 'METRIC_HOST',
      format: String,
    },
    port: {
      default: 8125,
      doc: 'Metric port to report to',
      env: 'METRIC_PORT',
      format: Number,
    },
    prefix: {
      default: 'fxa-admin-server.',
      doc: 'Metric prefix for statsD',
      env: 'METRIC_PREFIX',
      format: String,
    },
    telegraf: {
      default: true,
      doc: 'Whether to use telegraf formatted metrics',
      env: 'METRIC_USE_TELEGRAF',
      format: Boolean,
    },
  },
  hstsEnabled: {
    default: true,
    doc: 'Send a Strict-Transport-Security header',
    env: 'HSTS_ENABLED',
    format: Boolean,
  },
  hstsMaxAge: {
    default: 31536000, // a year
    doc: 'Max age of the STS directive in seconds',
    // Note: This format is a number because the value needs to be in seconds
    format: Number,
  },
  cors: {
    origin: {
      doc: 'Value for the Access-Control-Allow-Origin response header',
      format: String,
      env: 'CORS_ORIGIN',
      default: '*',
    },
  },
  clientFormatter: {
    i18n: {
      defaultLanguage: {
        default: 'en',
        doc: 'default target language',
        format: String,
        env: 'L10N_DEFAULT_LANGUAGE',
      },
      supportedLanguages: {
        doc: 'list of supported languages',
        format: Array,
        default: ['en'],
        env: 'L10N_SUPPORTED_LANGUAGE',
      },
    },
    lastAccessTimeUpdates: {
      earliestSaneTimestamp: {
        doc: 'timestamp used as the basis of the fallback value for lastAccessTimeFormatted, currently pinned to the deployment of 1.96.4 / a0940d7dc51e2ba20fa18aa3a830810e35c9a9d9',
        format: 'timestamp',
        default: 1507081020000,
        env: 'LASTACCESSTIME_EARLIEST_SANE_TIMESTAMP',
      },
    },
  },
  ipHmacKey: {
    doc: 'A secret to hash IP addresses for security history events',
    format: String,
    default: 'changeme',
    env: 'IP_HMAC_KEY',
  },
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
  },
  ...GuardConfig,
  featureFlags: {
    subscriptions: {
      playStore: {
        default: false,
        format: Boolean,
        env: 'FEATURE_PLAYSTORE_SUBS',
        doc: 'Querying of Google play store subscriptions',
      },
      appStore: {
        default: false,
        format: Boolean,
        env: 'FEATURE_APPSTORE_SUBS',
        doc: 'Querying of Apple app store subscriptions',
      },
      stripe: {
        default: false,
        format: Boolean,
        env: 'FEATURE_STRIPE_SUBS',
        doc: 'Querying of stripe subscriptions',
      },
    },
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
  newsletters: {
    basketHost: {
      doc: 'Host where basket api lives',
      format: String,
      default: 'basket.mozilla.org',
      env: 'BASKET_HOST',
    },
    basketApiKey: {
      doc: 'Api key for basket',
      format: String,
      default: '',
      env: 'BASKET_API_KEY',
    },
    newsletterHost: {
      doc: 'Host where newsletter api lives',
      format: String,
      default: 'www.mozilla.org',
      env: 'NEWSLETTER_HOST',
    },
  },
  cms: {
    enabled: {
      doc: 'Whether to use CMS',
      format: Boolean,
      default: false,
      env: 'CMS_ENABLED',
    },
  },
  cloudTasks: CloudTasksConvictConfigFactory(),
  notifier: {
    sns: {
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
    },
  },
  profileServer: {
    url: {
      doc: 'URL of fxa-profile-server',
      env: 'PROFILE_SERVER_URL',
      default: 'http://localhost:1111/v1',
    },
    secretBearerToken: {
      default: 'YOU MUST CHANGE ME',
      doc: 'Secret for server-to-server bearer token auth for fxa-profile-server',
      env: 'PROFILE_SERVER_AUTH_SECRET_BEARER_TOKEN',
      format: 'String',
    },
  },
  links: {
    desktopLink: {
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
      doc: 'url to Mozilla account support page',
      format: String,
      default:
        'https://support.mozilla.org/kb/im-having-problems-my-firefox-account',
    },
    subscriptionSupportUrl: {
      doc: 'url to Mozilla subscription support page',
      format: String,
      default: 'https://support.mozilla.org/products',
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
        'https://www.mozilla.org/about/legal/terms/subscription-services',
      doc: 'Subscription terms and cancellation policy URL',
      env: 'SUBSCRIPTION_TERMS_URL',
      format: String,
    },
    subscriptionSettingsUrl: {
      default: 'https://payments.firefox.com/',
      doc: 'Subscriptions management URL',
      env: 'PAYMENTS_NEXT_HOSTED_URL',
      format: String,
    },
    unsubscribeUrl: {
      doc: 'URL to unsubscribe from MoCo and MoFo emails',
      format: String,
      env: 'UNSUBSCRIBE_EMAIL_LISTS_URL',
      default:
        'https://privacyportal.onetrust.com/webform/1350748f-7139-405c-8188-22740b3b5587/4ba08202-2ede-4934-a89e-f0b0870f95f0',
    },
    initiatePasswordResetUrl: {
      doc: 'URL that allows a user to reset their account.',
      format: String,
      env: 'ACCOUNT_RESET_URL',
      default: 'http://localhost:3030/reset_password',
    },
    accountSettingsUrl: {
      doc: 'URL for account settings',
      format: String,
      env: 'ACCOUNT_SETTINGS_URL',
      default: 'http://localhost:3030/settings',
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
      default: 9999,
      env: 'SMTP_PORT',
    },
    secure: {
      doc: 'Connect to SMTP host securely',
      default: false,
      env: 'SMTP_SECURE',
    },
    ignoreTLS: {
      doc: 'Ignore fact the TLS should be required',
      default: true,
      env: 'SMTP__IGNORE_TLS',
    },
    sendingRate: {
      doc: 'How fast we can send emails',
      default: 5,
      env: 'SMTP__SENDING_RATE',
    },
    user: {
      doc: 'SMTP username',
      format: String,
      default: 'local',
      env: 'SMTP_USER',
    },
    password: {
      doc: 'SMTP password',
      format: String,
      default: 'local',
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
    sesConfigurationSet: {
      doc:
        'AWS SES Configuration Set for SES Event Publishing. If defined, ' +
        'X-SES-MESSAGE-TAGS headers will be added to emails. Only ' +
        'intended for Production/Stage use.',
      format: String,
      default: '',
      env: 'SES_CONFIGURATION_SET',
    },
    connectionTimeout: {
      doc: 'Milliseconds to wait for the connection to establish (default is 2 minutes)',
      format: 'int',
      default: 120000,
      env: 'SMTP_CONNECTION_TIMEOUT',
    },
    greetingTimeout: {
      doc: 'Milliseconds to wait for the greeting after connection is established (default is 30 seconds)',
      format: 'int',
      default: 30000,
      env: 'SMTP_GREETING_TIMEOUT',
    },
    socketTimeout: {
      doc: 'Milliseconds of inactivity to allow (default is 10 minutes)',
      format: 'int',
      default: 600000,
      env: 'SMTP_SOCKET_TIMEOUT',
    },
    dnsTimeout: {
      doc: 'Milliseconds to wait for DNS requests to be resolved (default is 30 seconds)',
      format: 'int',
      default: 30000,
      env: 'SMTP_DNS_TIMEOUT',
    },
    retry: {
      maxAttempts: {
        doc: 'Maximum number of attempts for sending an email IF it fails. 1 means 1 additional attempt after the initial failure.',
        format: 'int',
        default: 3,
        env: 'SMTP_RETRY_MAX_RETRIES',
      },
      backOffMs: {
        doc: `Number of milliseconds to exponentially back off when retrying sending an email.`,
        format: 'int',
        default: 200,
        env: 'SMTP_RETRY_BACKOFF_MS',
      },
      jitter: {
        doc: 'Jitter factor (0-1) to add randomness to backoff timing. 0 = no jitter, 1 = up to 100% jitter.',
        format: Number,
        default: 0.3,
        env: 'SMTP_RETRY_JITTER',
      },
      maxDelayMs: {
        doc: 'Maximum delay in milliseconds to cap the backoff at.',
        format: 'int',
        default: 1000 * 10, // 10 seconds maximum delay
        env: 'SMTP_RETRY_MAX_DELAY_MS',
      },
    },
    metricsEnabled: {
      doc: 'Flag to enable UTM metrics for SMTP links',
      format: Boolean,
      default: true,
      env: 'SMTP_METRICS_ENABLED',
    },
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
        // 0 are allowed in the past day.
        // 1 is allowed in the past year.
        0: 24 * 60 * 60 * 1000,
        1: 365 * 24 * 60 * 60 * 1000,
      },
      env: 'BOUNCES_COMPLAINT',
    },
    hard: {
      doc: 'Tiers of max allowed hard bounces per amount of milliseconds',
      format: Object,
      default: {
        // # of bounces allowed : time since last bounce
        0: 15 * 60 * 1000,
        1: 24 * 60 * 60 * 1000,
      },
      env: 'BOUNCES_HARD',
    },
    soft: {
      doc: 'Tiers of max allowed soft bounces per amount of milliseconds',
      format: Object,
      default: {
        0: 5 * 60 * 1000,
      },
      env: 'BOUNCES_SOFT',
    },
    ignoreTemplates: {
      doc: 'Always ignore bounces from these email templates',
      format: Array,
      default: ['verifyLoginCode', 'verifyLogin', 'recovery', 'unblockCode'],
      env: 'BOUNCES_IGNORE_TEMPLATES',
    },
  },
});

const configDir = __dirname;
const envConfig = path.join(configDir, `${conf.get('env')}.json`);
const configFiles =
  process.env.CONFIG_FILES?.split(',')
    .map((x) => path.join(configDir, x))
    .join(',') || '';
const existingConfigFiles = `${envConfig},${configFiles}`
  .split(',')
  .filter(fs.existsSync);
conf.loadFile(existingConfigFiles);
conf.validate();
const Config = conf;

export type AppConfig = ReturnType<(typeof Config)['getProperties']>;
export default Config;
