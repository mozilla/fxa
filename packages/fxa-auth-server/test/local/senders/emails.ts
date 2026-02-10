/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ROOT_DIR = '../../..';

// We import chai from this local file to get the configuration with truncation disabled.
import chai from '../../chaiWithoutTruncation';
import mocks from '../../mocks';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { URL } from 'url';
import { MOCK_LOCATION_ALL } from '../../../lib/senders/emails/partials/userLocation/mocks';
import { MOCK_DEVICE_ALL } from '../../../lib/senders/emails/partials/userDevice/mocks';
import { AppError, ERRNO as AUTH_SERVER_ERRNOS } from '@fxa/accounts/errors';
import { Container } from 'typedi';
import { ProductConfigurationManager } from '../../../../../libs/shared/cms/src';

const moment = require('moment-timezone');
const config = require(`${ROOT_DIR}/config`).default.getProperties();
const { assert } = chai;
if (!config.smtp.prependVerificationSubdomain.enabled) {
  config.smtp.prependVerificationSubdomain.enabled = true;
}
if (!config.smtp.sesConfigurationSet) {
  config.smtp.sesConfigurationSet = 'ses-config';
}

config.smtp.user = 'test';
config.smtp.password = 'test';
config.smtp.subscriptionTermsUrl = 'http://example.com/terms';

// Force enable the subscription transactional emails
config.subscriptions.transactionalEmails.enabled = true;

const TEMPLATE_VERSIONS = require(
  `${ROOT_DIR}/lib/senders/emails/templates/_versions.json`
);

const SUBSCRIPTION_TERMS_URL = 'https://example.com/subscription-product/terms';
const SUBSCRIPTION_PRIVACY_URL =
  'https://example.com/subscription-product/privacy';
const SUBSCRIPTION_CANCELLATION_SURVEY_URL =
  'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21';
const SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM =
  'https://www.mozilla.com/links/survey/custom';
const productMetadata = {
  'product:termsOfServiceDownloadURL': SUBSCRIPTION_TERMS_URL,
  'product:privacyNoticeDownloadURL': SUBSCRIPTION_PRIVACY_URL,
};
const SUBSCRIPTION_PRODUCT_SUPPORT_URL =
  'https://support.mozilla.org/products/vpn';
const SUBSCRIPTION_ENDING_REMINDER_DATE = 'April 19, 2020';

const MESSAGE = {
  // Note: acceptLanguage is not just a single locale
  acceptLanguage: 'en;q=0.8,en-US;q=0.5,en;q=0.3"',
  appStoreLink: 'https://example.com/app-store',
  code: 'abc123',
  churnTermsUrl: 'http://localhost:3035/churn/terms',
  ctaButtonLabel: 'Stay subscribed and save 20%',
  ctaButtonUrl: 'http://localhost:3030/renew',
  expirationTime: 5,
  date: moment().tz('America/Los_Angeles').format('dddd, ll'),
  deviceId: 'foo',
  email: 'a@b.com',
  flowBeginTime: Date.now(),
  flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  location: MOCK_LOCATION_ALL,
  locations: [],
  maskedLastFourPhoneNumber: '••••••1234',
  numberRemaining: 2,
  primaryEmail: 'c@d.com',
  service: 'sync',
  time: moment().tz('America/Los_Angeles').format('LTS (z)'),
  timeZone: 'America/Los_Angeles',
  tokenCode: 'abc123',
  type: 'secondary',
  device: MOCK_DEVICE_ALL,
  uid: 'uid',
  metricsEnabled: true,
  unblockCode: 'AS6334PK',
  cardType: 'mastercard',
  showTaxAmount: false,
  icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  invoiceAmountDueInCents: 3210,
  invoiceDate: new Date(1584747098816),
  invoiceLink:
    'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
  invoiceNumber: '8675309',
  invoiceTotalInCents: 999999.9,
  invoiceSubtotalInCents: 1000200.0,
  invoiceDiscountAmountInCents: -200,
  invoiceTaxAmountInCents: 48,
  invoiceTotalCurrency: 'eur',
  lastFour: '5309',
  mozillaSupportUrl: 'https://support.mozilla.org',
  twoFactorSupportLink:
    'https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication',
  nextInvoiceDate: new Date(1587339098816),
  offeringPriceInCents: 1200,
  paymentAmountOldInCents: 9999099.9,
  paymentAmountOldCurrency: 'jpy',
  paymentAmountNewInCents: 12312099.9,
  paymentAmountNewCurrency: 'gbp',
  paymentProratedInCents: 523099.9,
  paymentProratedCurrency: 'usd',
  payment_provider: 'stripe',
  planSuccessActionButtonURL: 'http://getfirefox.com/',
  planId: 'plan-example',
  planInterval: 'day',
  planIntervalCount: 2,
  playStoreLink: 'https://example.com/play-store',
  productIconURLNew:
    'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  productIconURLOld:
    'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  productId: 'wibble',
  productMetadata,
  productName: 'Firefox Fortress',
  productNameOld: 'Product A',
  productNameNew: 'Product B',
  productPaymentCycleNew: 'month',
  productPaymentCycleOld: 'year',
  providerName: 'Google',
  remainingAmountTotalInCents: undefined,
  reminderLength: 14,
  secondaryEmail: 'secondary@email.com',
  serviceLastActiveDate: new Date(1587339098816), // 04/19/2020
  showChurn: false,
  subscription: {
    productName: 'Cooking with Foxkeh',
    planId: 'plan-example',
    productId: 'wibble',
  },
  subscriptions: [
    { planId: 'plan-example', productName: 'Firefox Fortress' },
    { planId: 'other-plan', productName: 'Cooking with Foxkeh' },
  ],
  showPaymentMethod: true,
  discountType: 'forever',
  discountDuration: null,
  unusedAmountTotalInCents: 0,
};

const MESSAGE_WITH_PLAN_CONFIG = {
  ...MESSAGE,
  planConfig: {
    urls: {
      termsOfServiceDownload: 'https://payments-next.example.com/tos',
      privacyNoticeDownload: 'https://payments-next.example.com/privacy',
      cancellationSurvey: 'https://subplat.example.com/survey',
    },
  },
};

const MESSAGE_FORMATTED = {
  // Note: Intl.NumberFormat rounds 1/10 cent up
  invoiceTotal: '€10,000.00',
  paymentAmountOld: '¥99,991',
  paymentAmountNew: '£123,121.00',
  paymentProrated: '$5,231.00',
  invoiceAmountDue: '€32.10',
  invoiceAmountDue2: '£32.10',
  invoiceAmountDue3: '€0.00',
  invoiceSubtotal: '€10,002.00',
  invoiceDiscountAmount: '-€2.00',
  invoiceTaxAmount: '€0.48',
};

// key = query param name, value = MESSAGE property name
const MESSAGE_PARAMS = new Map([
  ['code', 'code'],
  ['deviceId', 'deviceId'],
  ['email', 'email'],
  ['flowBeginTime', 'flowBeginTime'],
  ['flowId', 'flowId'],
  ['primary_email_verified', 'email'],
  ['plan_id', 'planId'],
  ['product_id', 'productId'],
  ['product_name', 'productName'],
  ['secondary_email_verified', 'email'],
  ['service', 'service'],
  ['token', 'token'],
  ['uid', 'uid'],
  ['unblockCode', 'unblockCode'],
]);

interface Test {
  test: 'equal' | 'include' | 'notInclude';
  expected: string;
}

// prettier-ignore
const senderTests = (sender) => new Map<string, Test | any>([
  ['from', { test: 'equal', expected: sender }],
  ['sender', { test: 'equal', expected: sender }],
]);
const COMMON_TESTS = (templateValues = MESSAGE) =>
  new Map<string, Test | any>([
    [
      'headers',
      new Map([
        ['X-Device-Id', { test: 'equal', expected: templateValues.deviceId }],
        [
          'X-Flow-Begin-Time',
          { test: 'equal', expected: templateValues.flowBeginTime },
        ],
        ['X-Flow-Id', { test: 'equal', expected: templateValues.flowId }],
        ['X-Service-Id', { test: 'equal', expected: templateValues.service }],
        [
          'X-SES-CONFIGURATION-SET',
          { test: 'equal', expected: config.smtp.sesConfigurationSet },
        ],
        ['X-Uid', { test: 'equal', expected: templateValues.uid }],
      ]),
    ],
    [
      'text',
      [
        // Ensure no HTML character entities appear in plaintext emails, &amp; etc
        { test: 'notMatch', expected: /(?:&#x?[0-9a-f]+;)|(?:&[a-z]+;)/i },
      ],
    ],
  ]);

const COMMON_METRICS_OPT_OUT_TESTS: { test: string; expected: string }[] = [
  { test: 'notInclude', expected: 'utm_source=email' },
  { test: 'notInclude', expected: 'utm_medium=email' },
  { test: 'notInclude', expected: 'utm_campaign=' },
  { test: 'notInclude', expected: 'utm_context=' },
];

// prettier-ignore
const TESTS: [string, any, Record<string, any>?][] = [
  [
    'downloadSubscriptionEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `Welcome to ${MESSAGE.productName}` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('downloadSubscription'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'downloadSubscription' },
          ],
          [
            'X-Template-Version',
            { test: 'equal', expected: TEMPLATE_VERSIONS.downloadSubscription },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: 'https://www.mozilla.org/privacy/websites/',
          },
          { test: 'include', expected: MESSAGE.planSuccessActionButtonURL },
          { test: 'include', expected: MESSAGE.appStoreLink },
          { test: 'include', expected: MESSAGE.playStoreLink },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionPrivacyUrl',
                'new-subscription',
                'subscription-privacy'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'new-subscription',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'new-subscription',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'new-subscription',
                'subscription-support'
              )
            ),
          },
          { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
          {
            test: 'include',
            expected:
              'get started using all the features included in your subscription',
          },
          { test: 'include', expected: 'Get Started' },
          { test: 'include', expected: 'alt="Mozilla logo"' },
          { test: 'notInclude', expected: 'alt="Firefox logo"' },
          {
            test: 'include',
            expected: `alt="Download ${MESSAGE.productName} on the App Store"`,
          },
          {
            test: 'include',
            expected: `alt="Download ${MESSAGE.productName} on Google Play"`,
          },
          { test: 'include', expected: 'alt="Mozilla logo"' },
          { test: 'notInclude', expected: 'alt="Devices"' },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: MESSAGE.planSuccessActionButtonURL },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionPrivacyUrl',
              'new-subscription',
              'subscription-privacy'
            ),
          },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionSettingsUrl',
              'new-subscription',
              'cancel-subscription',
              'plan_id',
              'product_id',
              'uid',
              'email'
            ),
          },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionTermsUrl',
              'new-subscription',
              'subscription-terms'
            ),
          },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionSupportUrl',
              'new-subscription',
              'subscription-support'
            ),
          },
          { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
          {
            test: 'include',
            expected:
              'get started using all the features included in your subscription',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],
  [
    'downloadSubscriptionEmail',
    new Map<string, Test | any>([
      ['html', COMMON_METRICS_OPT_OUT_TESTS],
      ['text', COMMON_METRICS_OPT_OUT_TESTS],
    ]),
    {
      updateTemplateValues: (values) => ({ ...values, metricsEnabled: false }),
    },
  ],

  [
    'subscriptionAccountDeletionEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.productName} subscription has been cancelled`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionAccountDeletion'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionAccountDeletion' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionAccountDeletion,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionPrivacyUrl',
                'subscription-account-deletion',
                'subscription-privacy'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-account-deletion',
                'reactivate-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-account-deletion',
                'subscription-terms'
              )
            ),
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          {
            test: 'include',
            expected: `cancelled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.`,
          },
          { test: 'include', expected: 'alt="Mozilla logo"' },
          { test: 'notInclude', expected: 'alt="Firefox logo"' },
          { test: 'notInclude', expected: `alt="${MESSAGE.productName}"` },
          { test: 'notInclude', expected: 'alt="Devices"' },
          { test: 'notInclude', expected: 'alt="Sync Devices"' },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been cancelled`,
          },
          {
            test: 'include',
            expected: `cancelled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.`,
          },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionPrivacyUrl',
              'subscription-account-deletion',
              'subscription-privacy'
            ),
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],
  [
    'subscriptionAccountDeletionEmail',
    new Map<string, Test | any>([
      [
        'html',
        [
          {
            test: 'include',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
          },
          {
            test: 'notInclude',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL,
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
          },
          {
            test: 'notInclude',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL,
          },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productMetadata: {
          ...MESSAGE.productMetadata,
          'product:cancellationSurveyURL':
            SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
        },
      }),
    },
  ],

  [
    'subscriptionAccountReminderFirstEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: 'Reminder: Finish setting up your account' },
      ],
      [
        'headers',
        new Map([
          [
            'X-Link',
            {
              test: 'equal',
              expected: configUrl(
                'accountFinishSetupUrl',
                'first-subscription-account-reminder',
                'subscription-account-create-email',
                'email',
                'product_name',
                'token',
                'product_id',
                'flowId',
                'flowBeginTime',
                'deviceId'
              ),
            },
          ],
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionAccountReminderFirst'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionAccountReminderFirst' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionAccountReminderFirst,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: 'Reminder: Finish setting up your account',
          },
          { test: 'include', expected: 'Create Password' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'privacyUrl',
                'first-subscription-account-reminder',
                'privacy'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'supportUrl',
                'first-subscription-account-reminder',
                'support'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'accountFinishSetupUrl',
                'first-subscription-account-reminder',
                'subscription-account-create-email',
                'email',
                'product_name',
                'token',
                'product_id',
                'flowId',
                'flowBeginTime',
                'deviceId'
              )
            ),
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: 'Reminder: Finish setting up your account',
          },
          {
            test: 'include',
            expected: `Create Password:\n${configUrl('accountFinishSetupUrl', 'first-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')}`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionAccountReminderSecondEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: 'Final reminder: Setup your account' },
      ],
      [
        'headers',
        new Map([
          [
            'X-Link',
            {
              test: 'equal',
              expected: configUrl(
                'accountFinishSetupUrl',
                'second-subscription-account-reminder',
                'subscription-account-create-email',
                'email',
                'product_name',
                'token',
                'product_id',
                'flowId',
                'flowBeginTime',
                'deviceId'
              ),
            },
          ],
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionAccountReminderSecond'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionAccountReminderSecond' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionAccountReminderSecond,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: 'Final reminder: Setup your account' },
          { test: 'include', expected: 'Create Password' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'privacyUrl',
                'second-subscription-account-reminder',
                'privacy'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'supportUrl',
                'second-subscription-account-reminder',
                'support'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'accountFinishSetupUrl',
                'second-subscription-account-reminder',
                'subscription-account-create-email',
                'email',
                'product_name',
                'token',
                'product_id',
                'flowId',
                'flowBeginTime',
                'deviceId'
              )
            ),
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: 'Final reminder: Setup your account' },
          {
            test: 'include',
            expected: `Create Password:\n${configUrl('accountFinishSetupUrl', 'second-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')}`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionDowngradeEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `You have switched to ${MESSAGE.productNameNew}`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionDowngrade'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionDowngrade' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionDowngrade,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `You have switched to ${MESSAGE.productNameNew}`,
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-downgrade',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-downgrade',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.`,
          },
          {
            test: 'include',
            expected: `one-time credit of ${MESSAGE_FORMATTED.paymentProrated} to reflect the lower charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: 'Your subscription will automatically renew',
          },
          { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
          { test: 'include', expected: `alt="${MESSAGE.productNameNew}"` },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.`,
          },
          {
            test: 'include',
            expected: `one-time credit of ${MESSAGE_FORMATTED.paymentProrated} to reflect the lower charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
          {
            test: 'include',
            expected: 'Your subscription will automatically renew',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      // If expected `productName` differs from MESSAGE.productName, set the value for testing
      // only; we do the equivalent in the mailer methods, e.g. `productName: newProductName`
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.productNameNew,
      }),
    },
  ],

  [
    'subscriptionCancellationEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.productName} subscription has been canceled`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionCancellation'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionCancellation' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionCancellation,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been canceled`,
          },
          { test: 'include', expected: 'Sorry to see you go' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-cancellation',
                'reactivate-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-cancellation',
                'subscription-terms'
              )
            ),
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          {
            test: 'include',
            expected: `canceled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.`,
          },
          { test: 'include', expected: `billing period, which is 04/19/2020.` },
          { test: 'notInclude', expected: `alt="${MESSAGE.productName}"` },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been canceled`,
          },
          { test: 'include', expected: 'Sorry to see you go' },
          {
            test: 'include',
            expected: `canceled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.`,
          },
          { test: 'include', expected: `billing period, which is 04/19/2020.` },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionCancellationEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.productName} subscription has been canceled`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionCancellation'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionCancellation' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionCancellation,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been canceled`,
          },
          { test: 'include', expected: 'Sorry to see you go' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-cancellation',
                'reactivate-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-cancellation',
                'subscription-terms'
              )
            ),
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          {
            test: 'include',
            expected: `canceled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.`,
          },
          { test: 'include', expected: `billing period, which is 04/19/2020.` },
          { test: 'notInclude', expected: `alt="${MESSAGE.productName}"` },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been canceled`,
          },
          { test: 'include', expected: 'Sorry to see you go' },
          {
            test: 'include',
            expected: `canceled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.`,
          },
          { test: 'include', expected: `billing period, which is 04/19/2020.` },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, showOutstandingBalance: true }) },
  ],

  [
    'subscriptionCancellationEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.productName} subscription has been canceled`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionCancellation'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionCancellation' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionCancellation,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been canceled`,
          },
          { test: 'include', expected: 'Sorry to see you go' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-cancellation',
                'reactivate-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-cancellation',
                'subscription-terms'
              )
            ),
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          {
            test: 'include',
            expected: `canceled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.`,
          },
          {
            test: 'notInclude',
            expected: `billing period, which is 04/19/2020.`,
          },
          { test: 'notInclude', expected: `alt="${MESSAGE.productName}"` },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been canceled`,
          },
          { test: 'include', expected: 'Sorry to see you go' },
          {
            test: 'include',
            expected: `canceled your ${MESSAGE.productName} subscription`,
          },
          {
            test: 'include',
            expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.`,
          },
          {
            test: 'notInclude',
            expected: `billing period, which is 04/19/2020.`,
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        showOutstandingBalance: true,
        cancelAtEnd: false,
      }),
    },
  ],

  [
    'subscriptionCancellationEmail',
    new Map<string, Test | any>([
      [
        'html',
        [
          {
            test: 'include',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
          },
          {
            test: 'notInclude',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL,
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
          },
          {
            test: 'notInclude',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL,
          },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productMetadata: {
          ...MESSAGE.productMetadata,
          'product:cancellationSurveyURL':
            SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
        },
      }),
    },
  ],

  [
    'subscriptionReplacedEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your subscription has been updated as part of your upgrade`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionReplaced'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionReplaced' },
          ],
          [
            'X-Template-Version',
            { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionReplaced },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `Your individual ${MESSAGE.productName} subscription has been replaced and is now included in your new bundle.`,
          },
          { test: 'include', expected: `Your subscription has been updated` },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-replaced',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-replaced',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `You’ll receive a credit for any unused time from your previous subscription. This credit will be automatically applied to your account and used toward future charges.`,
          },
          { test: 'include', expected: `No action is required on your part.` },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your individual ${MESSAGE.productName} subscription has been replaced and is now included in your new bundle.`,
          },
          { test: 'include', expected: `Your subscription has been updated` },
          {
            test: 'include',
            expected: `You’ll receive a credit for any unused time from your previous subscription. This credit will be automatically applied to your account and used toward future charges.`,
          },
          { test: 'include', expected: `No action is required on your part.` },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionFailedPaymentsCancellationEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.productName} subscription has been cancelled`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionFailedPaymentsCancellation'
              ),
            },
          ],
          [
            'X-Template-Name',
            {
              test: 'equal',
              expected: 'subscriptionFailedPaymentsCancellation',
            },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected:
                TEMPLATE_VERSIONS.subscriptionFailedPaymentsCancellation,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been cancelled`,
          },
          { test: 'include', expected: 'Your subscription has been cancelled' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-failed-payments-cancellation',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-failed-payments-cancellation',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          {
            test: 'include',
            expected: `We’ve cancelled your ${MESSAGE.productName} subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.productName} subscription has been cancelled`,
          },
          { test: 'include', expected: 'Your subscription has been cancelled' },
          {
            test: 'include',
            expected: `We’ve cancelled your ${MESSAGE.productName} subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.`,
          },
          { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionFailedPaymentsCancellationEmail',
    new Map<string, Test | any>([
      [
        'html',
        [
          {
            test: 'include',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
          },
          {
            test: 'notInclude',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL,
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
          },
          {
            test: 'notInclude',
            expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL,
          },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productMetadata: {
          ...MESSAGE.productMetadata,
          'product:cancellationSurveyURL':
            SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM,
        },
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `Discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
  ],

  // Show Unknown card ending in [last four digits] when cardType is Unknown
  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Card ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `Discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: `Taxes &amp; fees` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Card ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: `Taxes &amp; fees` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        cardType: 'Unknown',
        invoiceTaxAmountInCents: 0,
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `One-time discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `One-time discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        discountType: 'once',
        discountDuration: null,
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `3-month discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `3-month discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        discountType: 'repeating',
        discountDuration: 3,
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Taxes &amp; fees` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'notInclude', expected: `Discount` },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'notInclude', expected: `Discount:` },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        discountType: null,
        discountDuration: null,
        invoiceTaxAmountInCents: 48,
        showTaxAmount: true,
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Taxes &amp; fees` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `3-month discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          {
            test: 'include',
            expected: `3-month discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        discountType: 'repeating',
        discountDuration: 3,
        invoiceTaxAmountInCents: 48,
        showTaxAmount: true,
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Taxes &amp; fees` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Prorated price` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Prorated price` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        remainingAmountTotalInCents: 500,
        showTaxAmount: true,
      }),
    },
  ],

  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `<b>Payment method:</b> Link` },
          { test: 'include', expected: `Taxes &amp; fees` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Prorated price` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Payment method: Link` },
          { test: 'include', expected: `Prorated price` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        remainingAmountTotalInCents: 500,
        showTaxAmount: true,
        payment_provider: 'link',
      }),
    },
  ],
  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `<b>Payment method:</b> Apple Pay` },
          { test: 'include', expected: `Taxes &amp; fees` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Prorated price` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Payment method: Apple Pay` },
          { test: 'include', expected: `Prorated price` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        remainingAmountTotalInCents: 500,
        showTaxAmount: true,
        payment_provider: 'apple_pay',
      }),
    },
  ],
  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-first-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-first-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-first-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Thank you for subscribing to ${MESSAGE.productName}`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `<b>Payment method:</b> Google Pay` },
          { test: 'include', expected: `Taxes &amp; fees` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Prorated price` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment confirmed`,
          },
          { test: 'include', expected: `start using ${MESSAGE.productName}` },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Payment method: Google Pay` },
          { test: 'include', expected: `Prorated price` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
          { test: 'notInclude', expected: 'List price' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        remainingAmountTotalInCents: 500,
        showTaxAmount: true,
        payment_provider: 'google_pay',
        paymentProviderName: 'Google Pay',
      }),
    },
  ],
  [
    'subscriptionPaymentExpiredEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Payment method for ${MESSAGE.productName} expired or expiring soon`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionPaymentExpired'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionPaymentExpired' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionPrivacyUrl',
                'subscription-payment-expired',
                'subscription-privacy'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-payment-expired',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-payment-expired',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `for ${MESSAGE.productName} is expired or about to expire.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Payment method for ${MESSAGE.productName} expired or expiring soon`,
          },
          {
            test: 'include',
            expected: `for ${MESSAGE.productName} is expired or about to expire.`,
          },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionPrivacyUrl',
              'subscription-payment-expired',
              'subscription-privacy'
            ),
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        subscriptions: [
          {
            planId: MESSAGE.planId,
            productId: MESSAGE.productId,
            ...x.subscriptions[0],
          },
        ],
      }),
    },
  ],

  [
    'subscriptionPaymentExpiredEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected:
            'The payment method for your subscriptions is expired or expiring soon',
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionsPaymentExpired'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionsPaymentExpired' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionPrivacyUrl',
                'subscriptions-payment-expired',
                'subscription-privacy'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscriptions-payment-expired',
                'update-billing',
                'email',
                'uid'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscriptions-payment-expired',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected:
              'using to make payments for the following subscriptions is expired or about to expire.',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected:
              'The payment method for your subscriptions is expired or expiring soon',
          },
          {
            test: 'include',
            expected:
              'using to make payments for the following subscriptions is expired or about to expire.',
          },
          {
            test: 'include',
            expected: configUrl(
              'subscriptionPrivacyUrl',
              'subscriptions-payment-expired',
              'subscription-privacy'
            ),
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, productName: undefined }) },
  ],

  [
    'subscriptionPaymentFailedEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment failed` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionPaymentFailed'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionPaymentFailed' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionPaymentFailed,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-payment-failed',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-payment-failed',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected:
              'We’ll try your payment again over the next few days, but you may need to help us fix it',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment failed`,
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected:
              'We’ll try your payment again over the next few days, but you may need to help us fix it',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionPaymentProviderCancelledEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Payment information update required for ${MESSAGE.productName}`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionPaymentProviderCancelled'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionPaymentProviderCancelled' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionPaymentProviderCancelled,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-payment-provider-cancelled',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-payment-provider-cancelled',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: 'Sorry, we’re having trouble with your payment method',
          },
          {
            test: 'include',
            expected: `We have detected a problem with your payment method for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected:
              'It may be that your payment method has expired, or your current payment method is out-of-date.',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Payment information update required for ${MESSAGE.productName}`,
          },
          {
            test: 'include',
            expected: 'Sorry, we’re having trouble with your payment method',
          },
          {
            test: 'include',
            expected: `We have detected a problem with your payment method for ${MESSAGE.productName}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        subscriptions: [
          {
            planId: MESSAGE.planId,
            productId: MESSAGE.productId,
            ...x.subscriptions[0],
          },
        ],
      }),
    },
  ],

  // test for `subscriptionsPaymentProviderCancelledEmail` (plural)
  [
    'subscriptionPaymentProviderCancelledEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected:
            'Payment information update required for Mozilla subscriptions',
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionsPaymentProviderCancelled'
              ),
            },
          ],
          [
            'X-Template-Name',
            {
              test: 'equal',
              expected: 'subscriptionsPaymentProviderCancelled',
            },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionsPaymentProviderCancelled,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected:
              'Payment information update required for Mozilla subscriptions',
          },
          {
            test: 'include',
            expected: 'Sorry, we’re having trouble with your payment method',
          },
          { test: 'include', expected: 'Firefox Fortress' },
          { test: 'include', expected: 'Cooking with Foxkeh' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscriptions-payment-provider-cancelled',
                'update-billing',
                'email',
                'uid'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscriptions-payment-provider-cancelled',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected:
              'We have detected a problem with your payment method for the following subscriptions.',
          },
          {
            test: 'include',
            expected:
              'It may be that your payment method has expired, or your current payment method is out-of-date.',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected:
              'Payment information update required for Mozilla subscriptions',
          },
          {
            test: 'include',
            expected: 'Sorry, we’re having trouble with your payment method',
          },
          { test: 'include', expected: 'Firefox Fortress' },
          { test: 'include', expected: 'Cooking with Foxkeh' },
          {
            test: 'include',
            expected:
              'We have detected a problem with your payment method for the following subscriptions.',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, productName: undefined }) },
  ],

  [
    'subscriptionReactivationEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `${MESSAGE.productName} subscription reactivated`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionReactivation'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionReactivation' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionReactivation,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `Thank you for reactivating your ${MESSAGE.productName} subscription!`,
          },
          {
            test: 'include',
            expected: `will be ${MESSAGE_FORMATTED.invoiceTotal} on 04/19/2020`,
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-reactivation',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-reactivation',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `reactivating your ${MESSAGE.productName} subscription`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Thank you for reactivating your ${MESSAGE.productName} subscription!`,
          },
          {
            test: 'include',
            expected: `will be ${MESSAGE_FORMATTED.invoiceTotal} on 04/19/2020`,
          },
          {
            test: 'include',
            expected: `reactivating your ${MESSAGE.productName} subscription`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionRenewalReminderEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `${MESSAGE.subscription.productName} automatic renewal notice`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionRenewalReminder'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionRenewalReminder' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionRenewalReminder,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-renewal-reminder',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-renewal-reminder',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-renewal-reminder',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Dear ${MESSAGE.subscription.productName} customer`,
          },
          {
            test: 'include',
            expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days.`,
          },
          {
            test: 'include',
            expected: `At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.`,
          },
          { test: 'include', expected: 'Sincerely,' },
          {
            test: 'include',
            expected: `The ${MESSAGE.subscription.productName} team`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.subscription.productName} automatic renewal notice`,
          },
          {
            test: 'include',
            expected: `Dear ${MESSAGE.subscription.productName} customer`,
          },
          {
            test: 'include',
            expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days.`,
          },
          {
            test: 'include',
            expected: `At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.`,
          },
          { test: 'include', expected: 'Sincerely,' },
          {
            test: 'include',
            expected: `The ${MESSAGE.subscription.productName} team`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.subscription.productName,
      }),
    },
  ],

  [
    'subscriptionRenewalReminderEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `${MESSAGE.subscription.productName} automatic renewal notice`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionRenewalReminder'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionRenewalReminder' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionRenewalReminder,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-renewal-reminder',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-renewal-reminder',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-renewal-reminder',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Dear ${MESSAGE.subscription.productName} customer`,
          },
          {
            test: 'include',
            expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days.`,
          },
          {
            test: 'include',
            expected: `Because a previous discount has ended, your subscription will renew at the standard price.`,
          },
          {
            test: 'notInclude',
            expected: `Your next invoice reflects a change in pricing, as a previous discount has ended and a new discount has been applied.`,
          },
          {
            test: 'include',
            expected: `At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.`,
          },
          { test: 'include', expected: 'Sincerely,' },
          {
            test: 'include',
            expected: `The ${MESSAGE.subscription.productName} team`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.subscription.productName} automatic renewal notice`,
          },
          {
            test: 'include',
            expected: `Dear ${MESSAGE.subscription.productName} customer`,
          },
          {
            test: 'include',
            expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days.`,
          },
          {
            test: 'include',
            expected: `Because a previous discount has ended, your subscription will renew at the standard price.`,
          },
          {
            test: 'notInclude',
            expected: `Your next invoice reflects a change in pricing, as a previous discount has ended and a new discount has been applied.`,
          },
          {
            test: 'include',
            expected: `At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.`,
          },
          { test: 'include', expected: 'Sincerely,' },
          {
            test: 'include',
            expected: `The ${MESSAGE.subscription.productName} team`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.subscription.productName,
        hadDiscount: true,
        hasDifferentDiscount: false,
      }),
    },
  ],

  [
    'subscriptionRenewalReminderEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `${MESSAGE.subscription.productName} automatic renewal notice`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionRenewalReminder'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionRenewalReminder' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionRenewalReminder,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-renewal-reminder',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-renewal-reminder',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-renewal-reminder',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Dear ${MESSAGE.subscription.productName} customer`,
          },
          {
            test: 'include',
            expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days.`,
          },
          {
            test: 'include',
            expected: `Your next invoice reflects a change in pricing, as a previous discount has ended and a new discount has been applied.`,
          },
          {
            test: 'notInclude',
            expected: `Because a previous discount has ended, your subscription will renew at the standard price.`,
          },
          {
            test: 'include',
            expected: `At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.`,
          },
          { test: 'include', expected: 'Sincerely,' },
          {
            test: 'include',
            expected: `The ${MESSAGE.subscription.productName} team`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.subscription.productName} automatic renewal notice`,
          },
          {
            test: 'include',
            expected: `Dear ${MESSAGE.subscription.productName} customer`,
          },
          {
            test: 'include',
            expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days.`,
          },
          {
            test: 'include',
            expected: `Your next invoice reflects a change in pricing, as a previous discount has ended and a new discount has been applied.`,
          },
          {
            test: 'notInclude',
            expected: `Because a previous discount has ended, your subscription will renew at the standard price.`,
          },
          {
            test: 'include',
            expected: `At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.`,
          },
          { test: 'include', expected: 'Sincerely,' },
          {
            test: 'include',
            expected: `The ${MESSAGE.subscription.productName} team`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.subscription.productName,
        hadDiscount: false,
        hasDifferentDiscount: true,
      }),
    },
  ],

  [
    'subscriptionEndingReminderEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.subscription.productName} subscription will expire soon`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionEndingReminder'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionEndingReminder' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionEndingReminder,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-ending-reminder',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-ending-reminder',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionProductSupportUrl',
                'subscription-ending-reminder',
                'subscription-product-support'
              )
            ),
          },
          {
            test: 'notInclude',
            expected: decodeUrl(
              configHref(
                'churnTermsUrl',
                'subscription-ending-reminder',
                'subscription-product-support'
              )
            ),
          },
          {
            test: 'notInclude',
            expected: decodeUrl(
              configHref(
                'ctaButtonUrl',
                'subscription-ending-reminder',
                'subscription-product-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Your ${MESSAGE.subscription.productName} subscription will expire soon`,
          },
          {
            test: 'include',
            expected: `Your access to ${MESSAGE.subscription.productName} will end on <strong>${SUBSCRIPTION_ENDING_REMINDER_DATE}</strong>.`,
          },
          {
            test: 'include',
            expected: `If you’d like to continue using ${MESSAGE.subscription.productName}, you can reactivate your subscription in`,
          },
          { test: 'include', expected: `Account Settings` },
          {
            test: 'include',
            expected: `before <strong>${SUBSCRIPTION_ENDING_REMINDER_DATE}</strong>. If you need assistance`,
          },
          { test: 'include', expected: `contact our Support Team` },
          {
            test: 'include',
            expected: 'Thanks for being a valued subscriber!',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'Want to keep access?' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.subscription.productName} subscription will expire soon`,
          },
          {
            test: 'include',
            expected: `Your access to ${MESSAGE.subscription.productName} will end on ${SUBSCRIPTION_ENDING_REMINDER_DATE}.`,
          },
          {
            test: 'include',
            expected: `If you’d like to continue using ${MESSAGE.subscription.productName}, you can reactivate your subscription in Account Settings before ${SUBSCRIPTION_ENDING_REMINDER_DATE}. If you need assistance, contact our Support Team.`,
          },
          {
            test: 'include',
            expected: 'Thanks for being a valued subscriber!',
          },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'Want to keep access?' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.subscription.productName,
        subscriptionSupportUrl: SUBSCRIPTION_PRODUCT_SUPPORT_URL,
      }),
    },
  ],

  [
    'subscriptionEndingReminderEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `Your ${MESSAGE.subscription.productName} subscription will expire soon`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionEndingReminder'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionEndingReminder' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionEndingReminder,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-ending-reminder',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-ending-reminder',
                'update-billing',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionProductSupportUrl',
                'subscription-ending-reminder',
                'subscription-product-support'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'churnTermsUrl',
                'subscription-ending-reminder',
                'subscription-product-support'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'ctaButtonUrl',
                'subscription-ending-reminder',
                'subscription-product-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `Your ${MESSAGE.subscription.productName} subscription will expire soon`,
          },
          {
            test: 'include',
            expected: `Your access to ${MESSAGE.subscription.productName} will end on <strong>${SUBSCRIPTION_ENDING_REMINDER_DATE}</strong>.`,
          },
          {
            test: 'include',
            expected: `If you’d like to continue using ${MESSAGE.subscription.productName}, you can reactivate your subscription in`,
          },
          { test: 'include', expected: `Account Settings` },
          {
            test: 'include',
            expected: `before <strong>${SUBSCRIPTION_ENDING_REMINDER_DATE}</strong>. If you need assistance`,
          },
          { test: 'include', expected: `contact our Support Team` },
          {
            test: 'include',
            expected: 'Thanks for being a valued subscriber!',
          },
          { test: 'include', expected: 'Want to keep access?' },
          { test: 'include', expected: MESSAGE.ctaButtonLabel },
          { test: 'include', expected: 'Limited terms and restrictions apply' },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `Your ${MESSAGE.subscription.productName} subscription will expire soon`,
          },
          {
            test: 'include',
            expected: `Your access to ${MESSAGE.subscription.productName} will end on ${SUBSCRIPTION_ENDING_REMINDER_DATE}.`,
          },
          {
            test: 'include',
            expected: `If you’d like to continue using ${MESSAGE.subscription.productName}, you can reactivate your subscription in Account Settings before ${SUBSCRIPTION_ENDING_REMINDER_DATE}. If you need assistance, contact our Support Team.`,
          },
          {
            test: 'include',
            expected: 'Thanks for being a valued subscriber!',
          },
          { test: 'include', expected: 'Want to keep access?' },
          { test: 'include', expected: MESSAGE.ctaButtonLabel },
          { test: 'include', expected: 'Limited terms and restrictions apply' },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.subscription.productName,
        subscriptionSupportUrl: SUBSCRIPTION_PRODUCT_SUPPORT_URL,
        showChurn: true,
      }),
    },
  ],

  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment received` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: 'Thank you for being a subscriber!' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-subsequent-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-subsequent-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-subsequent-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `You have received an account credit of ${MESSAGE_FORMATTED.invoiceTotal}, which will be applied to your future invoices.`,
          },
          {
            test: 'notInclude',
            expected: `Charged ${MESSAGE_FORMATTED.invoiceAmountDue2} on 03/20/2020`,
          },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment received`,
          },
          { test: 'include', expected: 'Thank you for being a subscriber!' },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `You have received an account credit of ${MESSAGE_FORMATTED.invoiceTotal}, which will be applied to your future invoices.`,
          },
          {
            test: 'notInclude',
            expected: `Charged ${MESSAGE_FORMATTED.invoiceAmountDue2} on 03/20/2020`,
          },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, invoiceTotalInCents: -1000000 }) },
  ],
  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment received` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: 'Thank you for being a subscriber!' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-subsequent-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-subsequent-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-subsequent-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment received`,
          },
          { test: 'include', expected: 'Thank you for being a subscriber!' },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
  ],

  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment received` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-subsequent-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-subsequent-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-subsequent-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `Discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment received`,
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `Discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
  ],
  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment received` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-subsequent-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-subsequent-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-subsequent-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue3}`,
          },
          { test: 'include', expected: `Discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment received`,
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue3}`,
          },
          {
            test: 'include',
            expected: `Discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, invoiceAmountDueInCents: 0 }) },
  ],
  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment received` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-subsequent-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-subsequent-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-subsequent-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `One-time discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment received`,
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `One-time discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        discountType: 'once',
        discountDuration: null,
      }),
    },
  ],
  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        { test: 'equal', expected: `${MESSAGE.productName} payment received` },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-subsequent-invoice',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-subsequent-invoice',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSupportUrl',
                'subscription-subsequent-invoice',
                'subscription-support'
              )
            ),
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `<b>Invoice number:</b> ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          { test: 'include', expected: `Amount paid` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          { test: 'include', expected: `3-month discount` },
          {
            test: 'include',
            expected: `${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `<b>Date:</b> March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View invoice` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `${MESSAGE.productName} payment received`,
          },
          {
            test: 'include',
            expected: `latest payment for ${MESSAGE.productName}.`,
          },
          {
            test: 'include',
            expected: `Invoice number: ${MESSAGE.invoiceNumber}`,
          },
          { test: 'include', expected: `Mastercard ending in 5309` },
          {
            test: 'include',
            expected: `Amount paid: ${MESSAGE_FORMATTED.invoiceAmountDue}`,
          },
          {
            test: 'include',
            expected: `3-month discount: ${MESSAGE_FORMATTED.invoiceDiscountAmount}`,
          },
          { test: 'include', expected: `Date: March 20, 2020` },
          {
            test: 'include',
            expected: `Your next invoice will be issued on April 19, 2020`,
          },
          { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
          { test: 'notInclude', expected: 'utm_source=email' },
          { test: 'notInclude', expected: 'PayPal' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        discountType: 'repeating',
        discountDuration: 3,
      }),
    },
  ],

  [
    'subscriptionUpgradeEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `You have upgraded to ${MESSAGE.productNameNew}`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionUpgrade'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionUpgrade' },
          ],
          [
            'X-Template-Version',
            { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionUpgrade },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `You have upgraded to ${MESSAGE.productNameNew}`,
          },
          { test: 'include', expected: 'Thank you for upgrading!' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-upgrade',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-upgrade',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `You have successfully upgraded to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `The previous rate was ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: `Going forward, you will be charged ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}`,
          },
          {
            test: 'include',
            expected: `You have been charged a one-time fee of ${MESSAGE_FORMATTED.invoiceAmountDue2} to reflect your subscription’s higher price for the remainder of this billing period (${MESSAGE.productPaymentCycleOld}).`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'notInclude',
            expected: `You have received an account credit in the amount of ${MESSAGE_FORMATTED.paymentProrated}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `You have upgraded to ${MESSAGE.productNameNew}`,
          },
          { test: 'include', expected: 'Thank you for upgrading!' },
          {
            test: 'include',
            expected: `You have successfully upgraded to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `The previous rate was ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: `Going forward, you will be charged ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}`,
          },
          {
            test: 'include',
            expected: `You have been charged a one-time fee of ${MESSAGE_FORMATTED.invoiceAmountDue2} to reflect your subscription’s higher price for the remainder of this billing period (${MESSAGE.productPaymentCycleOld}).`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'notInclude',
            expected: `You have received an account credit in the amount of ${MESSAGE_FORMATTED.paymentProrated}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.productNameNew,
        paymentProratedInCents: 523100,
      }),
    },
  ],

  [
    'subscriptionUpgradeEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `You have upgraded to ${MESSAGE.productNameNew}`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionUpgrade'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionUpgrade' },
          ],
          [
            'X-Template-Version',
            { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionUpgrade },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `You have upgraded to ${MESSAGE.productNameNew}`,
          },
          { test: 'include', expected: 'Thank you for upgrading!' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-upgrade',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-upgrade',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `You have successfully upgraded to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `You have received an account credit in the amount of ${MESSAGE_FORMATTED.paymentProrated}.`,
          },
          {
            test: 'include',
            expected: `The previous rate was ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: `Going forward, you will be charged ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.invoiceAmountDue} to reflect your subscription’s higher price for the remainder of this billing period (${MESSAGE.productPaymentCycleOld}).`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `You have upgraded to ${MESSAGE.productNameNew}`,
          },
          { test: 'include', expected: 'Thank you for upgrading!' },
          {
            test: 'include',
            expected: `You have successfully upgraded to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `You have received an account credit in the amount of ${MESSAGE_FORMATTED.paymentProrated}.`,
          },
          {
            test: 'include',
            expected: `The previous rate was ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: `Going forward, you will be charged ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.invoiceAmountDue} to reflect your subscription’s higher price for the remainder of this billing period (${MESSAGE.productPaymentCycleOld}).`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.productNameNew,
        paymentProratedInCents: -523100,
      }),
    },
  ],

  [
    'subscriptionUpgradeEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `You have upgraded to ${MESSAGE.productNameNew}`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionUpgrade'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionUpgrade' },
          ],
          [
            'X-Template-Version',
            { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionUpgrade },
          ],
        ]),
      ],
      [
        'html',
        [
          {
            test: 'include',
            expected: `You have upgraded to ${MESSAGE.productNameNew}`,
          },
          { test: 'include', expected: 'Thank you for upgrading!' },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionSettingsUrl',
                'subscription-upgrade',
                'cancel-subscription',
                'plan_id',
                'product_id',
                'uid',
                'email'
              )
            ),
          },
          {
            test: 'include',
            expected: decodeUrl(
              configHref(
                'subscriptionTermsUrl',
                'subscription-upgrade',
                'subscription-terms'
              )
            ),
          },
          {
            test: 'include',
            expected: `You have successfully upgraded to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `The previous rate was ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: `Going forward, you will be charged ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}`,
          },
          {
            test: 'notInclude',
            expected: `You have received an account credit in the amount of ${MESSAGE_FORMATTED.paymentProrated}.`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.invoiceAmountDue} to reflect your subscription’s higher price for the remainder of this billing period (${MESSAGE.productPaymentCycleOld}).`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: `You have upgraded to ${MESSAGE.productNameNew}`,
          },
          { test: 'include', expected: 'Thank you for upgrading!' },
          {
            test: 'include',
            expected: `You have successfully upgraded to ${MESSAGE.productNameNew}.`,
          },
          {
            test: 'include',
            expected: `The previous rate was ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld}.`,
          },
          {
            test: 'include',
            expected: `Going forward, you will be charged ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}`,
          },
          {
            test: 'notInclude',
            expected: `You have received an account credit in the amount of ${MESSAGE_FORMATTED.paymentProrated}.`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.invoiceAmountDue} to reflect your subscription’s higher price for the remainder of this billing period (${MESSAGE.productPaymentCycleOld}).`,
          },
          {
            test: 'notInclude',
            expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.`,
          },
          { test: 'notInclude', expected: 'utm_source=email' },
        ],
      ],
    ]),
    {
      updateTemplateValues: (x) => ({
        ...x,
        productName: MESSAGE.productNameNew,
        paymentProratedInCents: 0,
      }),
    },
  ],
];

const TESTS_WITH_PLAN_CONFIG: [string, any, Record<string, any>?][] = [
  [
    'downloadSubscriptionEmail',
    new Map<string, Test | any>([
      [
        'html',
        [
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.privacyNoticeDownload,
          },
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.termsOfServiceDownload,
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.privacyNoticeDownload,
          },
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.termsOfServiceDownload,
          },
        ],
      ],
    ]),
  ],
  [
    'subscriptionCancellationEmail',
    new Map<string, Test | any>([
      [
        'html',
        [
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.cancellationSurvey,
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.cancellationSurvey,
          },
        ],
      ],
    ]),
  ],
];

const PAYPAL_MESSAGE = Object.assign({}, MESSAGE);

PAYPAL_MESSAGE.payment_provider = 'paypal';

const TESTS_WITH_PAYPAL_AS_PAYMENT_PROVIDER: [
  string,
  any,
  Record<string, any>?,
][] = [
  [
    'subscriptionFirstInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `${PAYPAL_MESSAGE.productName} payment confirmed`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice'),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: 'Mastercard ending in 5309' },
        ],
      ],
    ]),
  ],
  [
    'subscriptionSubsequentInvoiceEmail',
    new Map<string, Test | any>([
      [
        'subject',
        {
          test: 'equal',
          expected: `${PAYPAL_MESSAGE.productName} payment received`,
        },
      ],
      [
        'headers',
        new Map([
          [
            'X-SES-MESSAGE-TAGS',
            {
              test: 'equal',
              expected: sesMessageTagsHeaderValue(
                'subscriptionSubsequentInvoice'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionSubsequentInvoice' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `Mastercard ending in 5309` },
        ],
      ],
    ]),
  ],
];

describe('lib/senders/emails:', () => {
  type LocalizeFn = (message: Record<any, any>) => Promise<Record<any, string>>;

  let mockLog: Record<any, any>,
    mailer: Record<any, any>,
    localize: LocalizeFn,
    sendMail: Record<any, any>;

  before(async () => {
    Container.set(
      ProductConfigurationManager,
      mocks.mockProductConfigurationManager()
    );
    mockLog = mocks.mockLog();
    mailer = await setup(mockLog, config, {
      './oauth_client_info': () => ({
        async fetch() {
          return { name: 'Mock Relier' };
        },
      }),
    });
    // These tests do a lot of ad hoc mocking. Rather than try and clean up
    // after each case, give them carte blanche to do what they want then
    // restore the original methods in the top-level afterEach.
    localize = mailer.localize;
    sendMail = {
      mailer: mailer.mailer.sendMail,
    };
  });

  after(() => {
    mailer.stop();
    Container.reset();
  });

  afterEach(() => {
    Object.values(mockLog).forEach((fn) => {
      if (typeof fn === 'function') {
        fn.resetHistory();
      }
    });
    if (mailer.localize !== localize) {
      mailer.localize = localize;
    }

    if (mailer.mailer.sendMail !== sendMail.mailer) {
      mailer.mailer.sendMail = sendMail.mailer;
    }
  });

  it('mailer is not mocked', () => {
    assert.isObject(mailer.mailer);
    assert.isFunction(mailer.mailer.sendMail);
  });

  for (const [type, test, opts = {}] of TESTS) {
    it(`declarative test for ${type}`, async () => {
      const { updateTemplateValues }: any = opts;
      const tmplVals = updateTemplateValues
        ? updateTemplateValues(MESSAGE)
        : MESSAGE;

      mailer.mailer.sendMail = stubSendMail((message: Record<any, any>) => {
        if (tmplVals.target === 'strapi' && tmplVals.cmsRpFromName) {
          const sender = `${tmplVals.cmsRpFromName} <${config.smtp.sender.substring(
            config.smtp.sender.indexOf('<') + 1,
            config.smtp.sender.indexOf('>')
          )}>`;
          senderTests(sender).forEach((assertions, property) => {
            applyAssertions(type, message, property, assertions);
          });
        } else {
          senderTests(config.smtp.sender).forEach((assertions, property) => {
            applyAssertions(type, message, property, assertions);
          });
        }

        COMMON_TESTS(tmplVals).forEach((assertions, property) => {
          applyAssertions(type, message, property, assertions);
        });
        test.forEach((assertions: any, property: string) => {
          applyAssertions(type, message, property, assertions);
        });
      });
      await mailer[type](tmplVals);
    });
  }

  describe('use urls from plan config', () => {
    beforeEach(async () => {
      mailer = await setup(
        mockLog,
        {
          ...config,
          subscriptions: {
            ...config.subscriptions,
            productConfigsFirestore: { enabled: true },
          },
        },
        {
          './oauth_client_info': () => ({
            async fetch() {
              return { name: 'Mock Relier' };
            },
          }),
        }
      );
      localize = mailer.localize;
      sendMail = {
        mailer: mailer.mailer.sendMail,
      };
    });
    for (const [type, test, opts = {}] of TESTS_WITH_PLAN_CONFIG) {
      it(`subscription emails using the correct loalized urls`, async () => {
        mailer.mailer.sendMail = stubSendMail((message) => {
          test.forEach((assertions, property) => {
            applyAssertions(type, message, property, assertions);
          });
        });
        const { updateTemplateValues }: any = opts;
        const tmplVals = updateTemplateValues
          ? updateTemplateValues(MESSAGE_WITH_PLAN_CONFIG)
          : MESSAGE_WITH_PLAN_CONFIG;
        await mailer[type](tmplVals);
      });
    }
  });

  describe('payment info is correctly rendered when payment_provider === "paypal"', () => {
    for (const [
      type,
      test,
      opts = {},
    ] of TESTS_WITH_PAYPAL_AS_PAYMENT_PROVIDER) {
      it(`"Paypal" is rendered instead of credit card and last four digits - ${type}`, async () => {
        mailer.mailer.sendMail = stubSendMail((message) => {
          test.forEach((assertions, property) => {
            applyAssertions(type, message, property, assertions);
          });
        });
        const { updateTemplateValues }: any = opts;
        const tmplVals = updateTemplateValues
          ? updateTemplateValues(PAYPAL_MESSAGE)
          : PAYPAL_MESSAGE;
        await mailer[type](tmplVals);
      });
    }
  });

  describe('formats user agent strings sanely', () => {
    it('with all safe properties, returns the same data', () => {
      const uaInfo = {
        uaBrowser: 'Firefox',
        uaOS: 'Windows',
        uaOSVersion: '10',
      };

      const result = mailer._formatUserAgentInfo(uaInfo);
      assert.deepEqual(result, uaInfo);
    });

    it('with missing optional property', () => {
      const uaInfo = {
        uaOS: 'Windows',
        uaOSVersion: '10',
        uaBrowser: null,
      };
      const result = mailer._formatUserAgentInfo(uaInfo);
      assert.deepEqual(result, uaInfo);
    });

    it('with falsey required properties', () => {
      const result = mailer._formatUserAgentInfo({
        uaOS: null,
        uaBrowser: null,
        uaOSVersion: '10',
      });
      assert.equal(result, null);
    });

    it('with suspicious uaBrowser', () => {
      const result = mailer._formatUserAgentInfo({
        uaOS: 'Windows',
        uaBrowser: '<a>Firefox</a>',
        uaOSVersion: '10',
      });
      assert.deepEqual(result, {
        uaOS: 'Windows',
        uaBrowser: null,
        uaOSVersion: '10',
      });
    });

    it('with suspicious uaOS', () => {
      const result = mailer._formatUserAgentInfo({
        uaOS: 'http://example.com/',
        uaBrowser: 'Firefox',
        uaOSVersion: '10',
      });
      assert.deepEqual(result, {
        uaOS: null,
        uaBrowser: 'Firefox',
        uaOSVersion: '10',
      });
    });

    it('with suspicious uaOSVersion', () => {
      const result = mailer._formatUserAgentInfo({
        uaOS: 'Windows',
        uaBrowser: 'Firefox',
        uaOSVersion: 'dodgy-looking',
      });
      assert.deepEqual(result, {
        uaOS: 'Windows',
        uaBrowser: 'Firefox',
        uaOSVersion: null,
      });
    });
  });

  it('formats currency strings when given an invalid language tag', () => {
    const result = mailer._getLocalizedCurrencyString(123, 'USD', 'en__us');
    assert.equal(result, '$1.23');
  });

  it('defaults X-Template-Version to 1', () => {
    mailer.localize = () => ({});
    mailer.mailer.sendMail = stubSendMail((emailConfig) => {
      assert.equal(emailConfig.headers['X-Template-Version'], 1);
    });
    return mailer.send({
      ...MESSAGE,
      template: 'wibble-blee-definitely-does-not-exist',
    });
  });

  describe('constructLocalTimeString - returns date/time', () => {
    // Moment expects a single locale identifier. This tests to ensure
    // we account for this in _constructLocalTimeString
    const enAcceptLanguageHeader = 'en,en-US;q=0.7,nl;q=0.3';

    it('returns date/time based on given values', () => {
      const message = {
        timeZone: 'America/Los_Angeles',
        acceptLanguage: enAcceptLanguageHeader,
      };

      const result = mailer._constructLocalTimeString(
        message.timeZone,
        message.acceptLanguage
      );
      const testTime = moment().tz(message.timeZone).format('LTS (z)');
      const testDay = moment().tz(message.timeZone).format('dddd, ll');
      assert.deepEqual(result, [testTime, testDay]);
    });

    it('returns date/time based on default timezone (UTC) if timezone is undefined', () => {
      const message = {
        timeZone: undefined,
        acceptLanguage: enAcceptLanguageHeader,
      };
      const result = mailer._constructLocalTimeString(
        message.timeZone,
        message.acceptLanguage
      );
      assert.include(result[0], 'UTC');
    });

    it('returns date/time based on default locale (en) if locale is undefined', () => {
      const message = {
        timeZone: 'Europe/Berlin',
        acceptLanguage: undefined,
      };

      const result = mailer._constructLocalTimeString(
        message.timeZone,
        message.acceptLanguage
      );
      assert.include(
        [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        result[1].split(',')[0]
      );
    });

    it('returns date/time in another timezone (at the time of writing - EST', () => {
      const message = {
        timeZone: 'Europe/Berlin',
        acceptLanguage: MESSAGE.acceptLanguage,
      };

      const result = mailer._constructLocalTimeString(
        message.timeZone,
        message.acceptLanguage
      );
      assert.include(['CET', 'CEST'], result[0].replace(/(^.*\(|\).*$)/g, ''));
    });

    it('returns date/time in Spanish', () => {
      const message = {
        timeZone: 'America/Los_Angeles',
        acceptLanguage: 'es,en-US;q=0.7,en;q=0.3',
      };

      const result = mailer._constructLocalTimeString(
        message.timeZone,
        message.acceptLanguage
      );
      assert.include(
        [
          'lunes',
          'martes',
          'miércoles',
          'jueves',
          'viernes',
          'sábado',
          'domingo',
        ],
        result[1].split(',')[0]
      );
    });
  });

  describe('mock sendMail method:', () => {
    beforeEach(() => {
      mailer.localize = () => ({ language: 'en' });
      sinon.stub(mailer.mailer, 'sendMail').callsFake((_config, cb: any) => {
        cb(null, { resp: 'ok' });
      });
    });

    it('logs emailEvent on send', () => {
      const message = {
        email: 'test@restmail.net',
        flowId: 'wibble',
        subject: 'subject',
        template: 'verifyLogin',
        uid: 'foo',
      };

      return mailer.send(message).then(() => {
        assert.equal(mockLog.info.callCount, 1);
        const emailEventLog = mockLog.info.getCalls()[0];
        assert.equal(emailEventLog.args[0], 'emailEvent');
        assert.equal(emailEventLog.args[1].domain, 'other');
        assert.equal(emailEventLog.args[1].flow_id, 'wibble');
        assert.equal(emailEventLog.args[1].template, 'verifyLogin');
        assert.equal(emailEventLog.args[1].type, 'sent');
        assert.equal(emailEventLog.args[1].locale, 'en');
      });
    });
  });

  describe('mock failing sendMail method:', () => {
    beforeEach(() => {
      mailer.localize = () => ({});
      sinon.stub(mailer.mailer, 'sendMail').callsFake((_config, cb: any) => {
        cb(new Error('Fail'));
      });
    });

    it('rejects sendMail status', () => {
      const message = {
        email: 'test@restmail.net',
        subject: 'subject',
        template: 'verifyLogin',
        uid: 'foo',
      };

      return mailer.send(message).then(assert.notOk, (err: any) => {
        assert.equal(err.message, 'Fail');
      });
    });
  });
});

describe('mailer constructor:', () => {
  let mailerConfig: any, mockLog: any, mailer: any;

  before(async () => {
    mailerConfig = [
      'accountSettingsUrl',
      'accountRecoveryCodesUrl',
      'androidUrl',
      'initiatePasswordChangeUrl',
      'initiatePasswordResetUrl',
      'iosUrl',
      'iosAdjustUrl',
      'passwordManagerInfoUrl',
      'passwordResetUrl',
      'privacyUrl',
      'reportSignInUrl',
      'sender',
      'sesConfigurationSet',
      'supportUrl',
      'syncUrl',
      'verificationUrl',
      'verifyLoginUrl',
      'verifyPrimaryEmailUrl',
    ].reduce((target: any, key) => {
      target[key] = `mock ${key}`;
      return target;
    }, {});
    mockLog = mocks.mockLog();
    mailer = await setup(
      mockLog,
      { ...config, smtp: mailerConfig },
      {},
      'en',
      'wibble'
    );
  });

  it('mailer is mocked', () => {
    assert.equal(mailer.mailer, 'wibble');
  });

  it('set properties on self from config correctly', () => {
    Object.entries(mailerConfig).forEach(([key, expected]) => {
      assert.equal(mailer[key], expected, `${key} was correct`);
    });
  });
});

describe('mailer bounce throws exceptions', () => {
  let mailer: Record<any, any>, mockStatsd: any;

  before(async () => {
    mockStatsd = mocks.mockStatsd();
    mailer = await setup(
      mocks.mockLog(),
      config,
      {},
      'en',
      null,
      {
        check: async () => {
          throw AppError.emailComplaint(10);
        },
      },
      mockStatsd
    );

    mailer.localize = () => ({});
  });

  it('email bounce exceptions increment stats', () => {
    const message = {
      email: 'test@restmail.net',
      flowId: 'wibble',
      subject: 'subject',
      template: 'inactive-first-email',
      uid: 'foo',
    };

    // We shouldn't get to this call, so we fail it.
    sinon.stub(mailer.mailer, 'sendMail').callsFake((_config, cb: any) => {
      cb(new Error('Fail'));
    });

    return mailer.send(message).then(() => {
      const spiedStatsd = mockStatsd.increment.getCalls()[0];

      assert.equal(spiedStatsd.args[0], 'email.bounce.limit');
      assert.equal(spiedStatsd.args[1].template, 'inactive-first-email');
      assert.equal(
        spiedStatsd.args[1].error,
        AUTH_SERVER_ERRNOS.BOUNCE_COMPLAINT
      );
    });
  });
});

describe('mailer bounces succeed', () => {
  let mailer: Record<any, any>, mockStatsd: any;
  const mockLog = mocks.mockLog();

  before(async () => {
    mockStatsd = mocks.mockStatsd();
    mailer = await setup(
      mockLog,
      config,
      {},
      'en',
      null,
      {
        check: async () => Promise.resolve(),
      },
      mockStatsd
    );

    mailer.localize = () => ({});
    sinon.stub(mailer.mailer, 'sendMail').callsFake((_config, cb: any) => {
      cb(null, { resp: 'ok' });
    });
  });

  it('email bounce check sends mail', () => {
    const message = {
      email: 'test@restmail.net',
      flowId: 'wibble',
      subject: 'subject',
      template: 'inactive-first-email',
      uid: 'foo',
    };

    return mailer.send(message).then((resp) => {
      // assert that the log in the final 'sendMail' function is called.
      const emailEventLog = mockLog.debug.getCalls()[1];
      assert.equal(emailEventLog.args[0], 'mailer.send.1');
    });
  });
});

function sesMessageTagsHeaderValue(templateName: string, serviceName?: any) {
  return `messageType=fxa-${templateName}, app=fxa, service=${
    serviceName || 'fxa-auth-server'
  }, ses:feedback-id-a=fxa-${templateName}`;
}

function configHref(
  key: string,
  campaign: string,
  content: string,
  ...params: Array<any>
) {
  return `href="${configUrl(key, campaign, content, ...params)}"`;
}

function configUrl(
  key: string,
  campaign: string,
  content: string,
  ...params: Array<any>
) {
  let baseUri: string;
  if (key === 'subscriptionTermsUrl') {
    baseUri = MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.termsOfServiceDownload;
  } else if (key === 'subscriptionPrivacyUrl') {
    baseUri = MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.privacyNoticeDownload;
  } else if (key === 'subscriptionProductSupportUrl') {
    baseUri = SUBSCRIPTION_PRODUCT_SUPPORT_URL;
  } else if (key === 'churnTermsUrl') {
    baseUri = MESSAGE.churnTermsUrl;
  } else if (key === 'ctaButtonUrl') {
    baseUri = MESSAGE.ctaButtonUrl;
  } else {
    baseUri = config.smtp[key];
  }

  if (key === 'verificationUrl' || key === 'verifyLoginUrl') {
    baseUri = baseUri.replace(
      '//',
      `//${config.smtp.prependVerificationSubdomain.subdomain}.`
    );
  }

  const out = new URL(baseUri);

  for (const param of params) {
    const [key, value] = param.split('=');
    out.searchParams.append(
      key,
      value || MESSAGE[MESSAGE_PARAMS.get(key) as keyof typeof MESSAGE] || ''
    );
  }

  [
    ['utm_medium', 'email'],
    ['utm_campaign', `fx-${campaign}`],
    ['utm_content', `fx-${content}`],
  ].forEach(([key, value]) => out.searchParams.append(key, value));

  return out.toString();
}

function decodeUrl(encodedUrl: string) {
  return encodedUrl.replace(/&/gm, '&amp;');
}

async function setup(
  log: Record<any, any>,
  config: Record<any, any>,
  mocks: any,
  locale = 'en',
  sender: any = null,
  bounces: any = null,
  statsd: any = null
) {
  const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, mocks)(
    log,
    config,
    bounces || {
      check: () => Promise.resolve(),
    },
    statsd
  );
  return new Mailer(config.smtp, sender);
}

type CallbackFunction = (arg: any) => void;

function stubSendMail(stub: CallbackFunction, status?: any) {
  return (message: any, callback: any) => {
    try {
      stub(message);
      return callback(null, status);
    } catch (err) {
      return callback(err, status);
    }
  };
}

function applyAssertions(
  type: string,
  target: Record<any, any>,
  property: string,
  assertions: any
) {
  target = target[property];

  if (assertions instanceof Map) {
    assertions.forEach((nestedAssertions, nestedProperty) => {
      applyAssertions(type, target, nestedProperty, nestedAssertions);
    });
    return;
  }

  if (!Array.isArray(assertions)) {
    assertions = [assertions];
  }

  describe(`${type} - ${property}`, () => {
    assertions.forEach(({ test, expected }: Test) => {
      it(`${test} - ${expected}`, () => {
        assert[test](target, expected, `${type}: ${property}`);
      });
    });
  });
}
