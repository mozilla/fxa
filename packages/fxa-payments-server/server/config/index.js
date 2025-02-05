/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');
const convict = require('convict');
const { tracingConfig } = require('fxa-shared/tracing/config');

convict.addFormats(require('convict-format-with-moment'));
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  featureFlags: {
    useFirestoreProductConfigs: {
      default: false,
      doc: 'Feature flag on whether to expect Firestore (and not Stripe metadata) based product and plan configurations',
      env: 'SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED',
      format: Boolean,
    },
    useStripeAutomaticTax: {
      default: false,
      doc: 'Feature flag on whether Stripe automatic tax is enabled',
      env: 'SUBSCRIPTIONS_STRIPE_TAX_ENABLED',
      format: Boolean,
    },
  },
  amplitude: {
    enabled: {
      default: true,
      doc: 'Enable amplitude events',
      env: 'AMPLITUDE_ENABLED',
      format: Boolean,
    },
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
  clientAddressDepth: {
    default: 3,
    doc: 'location of the client ip address in the remote address chain',
    env: 'CLIENT_ADDRESS_DEPTH',
    format: Number,
  },
  clientMetrics: {
    maxEventOffset: {
      default: '2 days',
      doc: 'Maximum event offset',
      env: 'CLIENT_METRICS_MAX_EVENT_OFFSET',
      format: 'duration',
    },
  },
  csp: {
    enabled: {
      default: true,
      doc: 'Send "Content-Security-Policy" header',
      env: 'CSP_ENABLED',
    },
    reportUri: {
      default: 'https://accounts.firefox.com/_/csp-violation',
      doc: 'Location of "report-uri" for full, blocking CSP rules',
      env: 'CSP_REPORT_URI',
    },
    reportOnlyEnabled: {
      default: false,
      doc: 'Send "Content-Security-Policy-Report-Only" header',
      env: 'CSP_REPORT_ONLY_ENABLED',
    },
    reportOnlyUri: {
      default: 'https://accounts.firefox.com/_/csp-violation-report-only',
      doc: 'Location of "report-uri" for report-only CSP rules',
      env: 'CSP_REPORT_ONLY_URI',
    },
    extraImgSrc: {
      default: [],
      doc: 'Additional hosts to allow as image sources',
      env: 'CSP_EXTRA_IMG_SRC',
    },
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'production', 'test'],
  },
  flow_id_expiry: {
    default: '2 hours',
    doc: 'Time after which flow ids are considered stale',
    env: 'FLOW_ID_EXPIRY',
    format: 'duration',
  },
  googleAnalytics: {
    enabled: {
      default: false,
      doc: 'Toggle Google Analytics enabled',
      env: 'GA_ENABLED',
      format: Boolean,
    },
    measurementId: {
      default: '',
      doc: 'Google Analytics measurement ID',
      env: 'GA_MEASUREMENT_ID',
      format: String,
    },
    supportedProductIds: {
      default: 'prod_GqM9ToKK62qjkK',
      doc: 'Comma separated string of supported Stripe Product IDs',
      env: 'GA_SUPPORTED_STRIPE_PRODUCT_IDS',
      format: String,
    },
    debugMode: {
      default: false,
      doc: 'Toggle Google Analytics gtag debug mode. (Not to be confused with library react-ga testMode',
      env: 'GA_TEST_MODE',
      format: Boolean,
    },
  },
  geodb: {
    dbPath: {
      default: path.resolve(__dirname, '../../../fxa-geodb/db/cities-db.mmdb'),
      doc: 'Path to maxmind database file',
      env: 'GEODB_DBPATH',
      format: String,
    },
    enabled: {
      default: true,
      doc: 'Feature flag for geolocation',
      env: 'GEODB_ENABLED',
      format: Boolean,
    },
    locationOverride: {
      doc: 'override for forcing location',
      format: Object,
      default: {},
      env: 'GEODB_LOCATION_OVERRIDE',
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
  legalDocLinks: {
    privacyNotice: {
      default: 'https://www.mozilla.org/privacy/firefox-private-network',
      doc: 'Link to Privacy Notice',
      env: 'PAYMENT_PRIVACY_NOTICE',
      format: 'url',
    },
    termsOfService: {
      default:
        'https://www.mozilla.org/about/legal/terms/firefox-private-network',
      doc: 'Link to Terms of Service',
      env: 'PAYMENT_TERMS_OF_SERVCIE',
      format: 'url',
    },
    cdnFqdn: {
      default: 'accounts-static.cdn.mozilla.net',
      doc: 'The domain name where the legal doc downloads are hosted.',
      env: 'PAYMENT_LEGAL_DOWNLOAD_FQDN',
      format: String,
    },
    httpResCacheLimit: {
      default: 65536,
      doc: 'The max number of entries in the redirect endpoint HTTP results cache.  0 means unlimited and the memory usage on the cache could reach the max of Map (1GB on V8)',
      env: 'PAYMENT_LEGAL_DOWNLOAD_CACHE_LIMIT',
      format: Number,
    },
  },
  listen: {
    host: {
      default: '0.0.0.0',
      doc: 'The ip address the server should bind',
      env: 'IP_ADDRESS',
      format: String,
    },
    port: {
      default: 3031,
      doc: 'The port the server should bind',
      env: 'PORT',
      format: 'port',
    },
    publicUrl: {
      default: 'http://localhost:3031',
      env: 'PUBLIC_URL',
      format: 'url',
    },
    useHttps: {
      default: false,
      doc: 'set to true to serve directly over https',
      env: 'USE_TLS',
    },
  },
  logging: {
    app: { default: 'fxa-payments-server' },
    // TBD: This will preserve how things are currently working prior to this PR.
    //      Do we actually want to use 'mozlog', so the jsonPayload.fields is present in bigquery?
    target: { default: 'winston' },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
    routes: {
      enabled: {
        default: true,
        doc: 'Enable route logging. Set to false to trimming CI logs.',
        env: 'ENABLE_ROUTE_LOGGING',
      },
      format: {
        default: 'default_fxa',
        format: ['default_fxa', 'dev_fxa', 'default', 'dev', 'short', 'tiny'],
      },
    },
  },
  oauth_client_id_map: {
    default: {
      dcdb5ae7add825d2: '123done',
      '325b4083e32fe8e7': '321done',
    },
    doc: 'Mappings from client id to service name: { "id1": "name-1", "id2": "name-2" }',
    env: 'OAUTH_CLIENT_IDS',
    format: Object,
  },
  productRedirectURLs: {
    default: {
      '123doneProProduct': 'http://localhost:8080/',
      fortressProProduct: 'http://localhost:9292/download',
      prod_FUUNYnlDso7FeB: 'https://fortress-latest.dev.lcip.org/',
      prod_GqM9ToKK62qjkK: 'https://123done-latest.dev.lcip.org/',
      // todo get new prod_id for 123done stage
      prod_FfiuDs9u11ESbD: 'https://123done-stage.dev.lcip.org',
    },
    doc: 'Mapping between product IDs and post-subscription redirect URLs',
    env: 'PRODUCT_REDIRECT_URLS',
    format: Object,
  },
  proxyStaticResourcesFrom: {
    default: '',
    doc: 'Instead of loading static resources from disk, get them by proxy from this URL (typically a special reloading dev server)',
    env: 'PROXY_STATIC_RESOURCES_FROM',
    format: String,
  },
  sentry: {
    dsn: {
      default: '',
      doc: 'Sentry DSN',
      env: 'SENTRY_DSN',
      format: 'String',
    },
    env: {
      doc: 'Environment name to report to sentry',
      default: 'local',
      format: ['local', 'ci', 'dev', 'stage', 'prod'],
      env: 'SENTRY_ENV',
    },
    url: {
      default: 'https://sentry.prod.mozaws.net/444',
      doc: 'Sentry URL',
      env: 'SENTRY_URL',
      format: 'String',
    },
    sampleRate: {
      default: 1.0,
      doc: 'Rate at which errors are sampled.',
      env: 'SENTRY_SAMPLE_RATE',
      format: 'Number',
    },
    serverName: {
      doc: 'Name used by sentry to identify the server.',
      default: 'fxa-payments-broker',
      format: 'String',
      env: 'SENTRY_SERVER_NAME',
    },
    clientName: {
      doc: 'Name used by sentry to identify the client.',
      default: 'fxa-payments-client',
      format: 'String',
      env: 'SENTRY_CLIENT_NAME',
    },
    tracesSampleRate: {
      doc: 'Rate at which sentry traces are captured',
      default: 0,
      format: 'Number',
      env: 'SENTRY_TRACES_SAMPLE_RATE',
    },
  },
  servers: {
    auth: {
      url: {
        default: 'http://localhost:9000',
        doc: 'The url of the fxa-auth-server instance',
        env: 'AUTH_SERVER_URL',
        format: 'url',
      },
    },
    content: {
      url: {
        default: 'http://localhost:3030',
        doc: 'The url of the corresponding fxa-content-server instance',
        env: 'CONTENT_SERVER_URL',
        format: 'url',
      },
    },
    oauth: {
      url: {
        default: 'http://localhost:9000',
        doc: 'The url of the corresponding fxa-oauth-server instance',
        env: 'OAUTH_SERVER_URL',
        format: 'url',
      },
      clientId: {
        default: '59cceb6f8c32317c',
        doc: 'The Payments frontend OAuth client id.',
        env: 'OAUTH_SUBSCRIPTIONS_CLIENT_ID',
        format: 'String',
      },
    },
    profile: {
      url: {
        default: 'http://localhost:1111',
        doc: 'The url of the corresponding fxa-profile-server instance',
        env: 'PROFILE_SERVER_URL',
        format: 'url',
      },
    },
    profileImages: {
      url: {
        default: 'http://localhost:1112',
        doc: 'The url of the Firefox Account Profile Image Server',
        env: 'FXA_PROFILE_IMAGES_URL',
        format: 'url',
      },
    },
    accountsCdn: {
      url: {
        default: 'https://accounts-static.cdn.mozilla.net',
        doc: 'The URL of the Mozilla Accounts static content CDN',
        env: 'FXA_STATIC_CDN_URL',
        format: 'url',
      },
    },
  },
  staticResources: {
    directory: {
      default: 'build',
      doc: 'Directory where static resources are located',
      env: 'STATIC_DIRECTORY',
      format: String,
    },
    maxAge: {
      default: '10 minutes',
      doc: 'Cache max age for static assets, in ms',
      env: 'STATIC_MAX_AGE',
      format: 'duration',
    },
    url: {
      default: 'http://localhost:3031',
      doc: 'The origin of the static resources',
      env: 'STATIC_RESOURCE_URL',
      format: 'url',
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
      default: 'fxa-payments.',
      env: 'STATSD_PREFIX',
    },
  },
  paypal: {
    clientId: {
      default: 'sb',
      doc: 'The PayPal client ID',
      env: 'PAYPAL_CLIENT_ID',
      format: String,
    },
    apiUrl: {
      default: 'https://www.sandbox.paypal.com',
      doc: 'The PAYPAL API url',
      env: 'PAYPAL_API_URL',
      format: 'url',
    },
    scriptUrl: {
      default: 'https://www.paypal.com',
      doc: 'The PayPal script url',
      env: 'PAYPAL_SCRIPT_URL',
      format: 'url',
    },
  },
  stripe: {
    apiKey: {
      default: 'pk_test_VNpCidC0a2TJJB3wqXq7drhN00sF8r9mhs',
      doc: 'API key for Stripe',
      env: 'STRIPE_API_KEY',
      format: String,
    },
    apiUrl: {
      default: 'https://api.stripe.com',
      doc: 'The Stripe API url',
      env: 'STRIPE_API_URL',
      format: 'url',
    },
    hooksUrl: {
      default: 'https://hooks.stripe.com',
      doc: 'The Stripe hooks url',
      env: 'STRIPE_HOOKS_URL',
      format: 'url',
    },
    scriptUrl: {
      default: 'https://js.stripe.com',
      doc: 'The Stripe script url',
      env: 'STRIPE_SCRIPT_URL',
      format: 'url',
    },
  },
  tracing: tracingConfig,
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

let envConfig = path.join(__dirname, `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });

module.exports = conf;
