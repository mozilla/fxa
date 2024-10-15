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
import {
  MOCK_DEVICE_ALL,
  MOCK_DEVICE_BROWSER,
  MOCK_DEVICE_BROWSER_OS,
  MOCK_DEVICE_OS,
  MOCK_DEVICE_OS_VERSION,
} from '../../../lib/senders/emails/partials/userDevice/mocks';

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

const TEMPLATE_VERSIONS = require(`${ROOT_DIR}/lib/senders/emails/templates/_versions.json`);

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

const MESSAGE = {
  // Note: acceptLanguage is not just a single locale
  acceptLanguage: 'en;q=0.8,en-US;q=0.5,en;q=0.3"',
  appStoreLink: 'https://example.com/app-store',
  code: 'abc123',
  date: moment().tz('America/Los_Angeles').format('dddd, ll'),
  deviceId: 'foo',
  email: 'a@b.com',
  flowBeginTime: Date.now(),
  flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  locations: [],
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
  cardType: 'Mastercard',
  icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
  invoiceDate: new Date(1584747098816),
  invoiceLink:
    'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
  invoiceNumber: '8675309',
  invoiceTotalInCents: 999999.9,
  invoiceSubtotalInCents: 1000200.0,
  invoiceDiscountAmountInCents: 200,
  invoiceTotalCurrency: 'eur',
  lastFour: '5309',
  mozillaSupportUrl: 'https://support.mozilla.org',
  nextInvoiceDate: new Date(1587339098816),
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
    'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
  productIconURLOld:
    'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
  productId: 'wibble',
  productMetadata,
  productName: 'Firefox Fortress',
  productNameOld: 'Product A',
  productNameNew: 'Product B',
  productPaymentCycleNew: 'month',
  productPaymentCycleOld: 'year',
  providerName: 'Google',
  reminderLength: 14,
  secondaryEmail: 'secondary@email.com',
  serviceLastActiveDate: new Date(1587339098816),
  subscription: {
    productName: 'Cooking with Foxkeh',
    planId: 'plan-example',
    productId: 'wibble',
  },
  subscriptions: [
    { productName: 'Firefox Fortress' },
    { productName: 'Cooking with Foxkeh' },
  ],
  showPaymentMethod: true,
  discountType: 'forever',
  discountDuration: null,
};

const MESSAGE_WITH_PLAN_CONFIG = {
  ...MESSAGE,
  planConfig: {
    urls: {
      termsOfServiceDownload: 'https://subplat.example.com/tos',
      privacyNoticeDownload: 'https://subplat.example.com/privacy',
      cancellationSurvey: 'https://subplat.example.com/survey',
    },
    locales: {
      fr: {
        urls: {
          termsOfServiceDownload: 'https://subplat.example.co.fr/tos',
          privacyNoticeDownload: 'https://subplat.example.co.fr/privacy',
          cancellationSurvey: 'https://subplat.example.co.fr/survey',
        },
      },
    },
  },
};

const MESSAGE_FORMATTED = {
  // Note: Intl.NumberFormat rounds 1/10 cent up
  invoiceTotal: '€10,000.00',
  paymentAmountOld: '¥99,991',
  paymentAmountNew: '£123,121.00',
  paymentProrated: '$5,231.00',
  invoiceSubtotal: '€10,002.00',
  invoiceDiscountAmount: '€2.00',
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
const COMMON_TESTS = new Map<string, Test | any>([
  ['from', { test: 'equal', expected: config.smtp.sender }],
  ['sender', { test: 'equal', expected: config.smtp.sender }],
  [
    'headers',
    new Map([
      ['X-Device-Id', { test: 'equal', expected: MESSAGE.deviceId }],
      ['X-Flow-Begin-Time', { test: 'equal', expected: MESSAGE.flowBeginTime }],
      ['X-Flow-Id', { test: 'equal', expected: MESSAGE.flowId }],
      ['X-Service-Id', { test: 'equal', expected: MESSAGE.service }],
      [
        'X-SES-CONFIGURATION-SET',
        { test: 'equal', expected: config.smtp.sesConfigurationSet },
      ],
      ['X-Uid', { test: 'equal', expected: MESSAGE.uid }],
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
  ['cadReminderFirstEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Reminder! Let’s sync Firefox' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'cad-reminder-first', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('cadReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'cadReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.cadReminderFirst }],
    ])],
    ['html', [
      { test: 'include', expected: 'It takes two to sync' },
      { test: 'include', expected: 'Take your tabs across all your devices. Get your bookmarks, passwords, and other data everywhere you use Firefox.' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'cad-reminder-first', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: 'another device' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'cad-reminder-first', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'cad-reminder-first', 'support')) },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'include', expected: 'alt="Devices"' },
      { test: 'include', expected: `alt="Download Firefox on the App Store"` },
      { test: 'include', expected: `alt="Download Firefox on Google Play"` },
      { test: 'notInclude', expected: 'alt="Sync devices"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: config.smtp.firefoxDesktopUrl },
    ]],
    ['text', [
      { test: 'include', expected: 'It takes two to sync' },
      { test: 'include', expected: 'Take your tabs across all your devices. Get your bookmarks, passwords, and other data everywhere you use Firefox.' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'cad-reminder-first', 'privacy')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ]),
    {updateTemplateValues: x => (
      {...x, productName: undefined})}],

  ['cadReminderSecondEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Don’t miss out! Let’s finish your sync setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'cad-reminder-second', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('cadReminderSecond') }],
      ['X-Template-Name', { test: 'equal', expected: 'cadReminderSecond' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.cadReminderSecond }],
    ])],
    ['html', [
      { test: 'include', expected: 'Don’t forget to sync!' },
      { test: 'include', expected: 'Sync your bookmarks, passwords, open tabs and more — everywhere you use Firefox.' },
      { test: 'include', expected: 'Plus, your data is always encrypted. Only you and devices you approve can see it.' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'cad-reminder-second', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'cad-reminder-second', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'cad-reminder-second', 'support')) },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: 'alt="Devices"' },
    ]],
    ['text', [
      { test: 'include', expected: 'Don’t forget to sync!' },
      { test: 'include', expected: 'Sync your bookmarks, passwords, open tabs and more — everywhere you use Firefox.' },
      { test: 'include', expected: 'Plus, your data is always encrypted. Only you and devices you approve can see it.' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'cad-reminder-second', 'privacy')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['fraudulentAccountDeletionEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Your Mozilla account was deleted' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('fraudulentAccountDeletion') }],
      ['X-Template-Name', { test: 'equal', expected: 'fraudulentAccountDeletion' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.fraudulentAccountDeletion }],
    ])],
    ['html', [
      { test: 'include', expected: 'Your account was deleted' },
      { test: 'include', expected: 'Recently, a Mozilla account was created and a subscription was charged using this email address. As we do with all new accounts, we asked that you confirm your account by first validating this email address.' },
      { test: 'include', expected: 'At present, we see that the account was never confirmed. Since this step was not completed, we are not sure if this was an authorized subscription. As a result, the Mozilla account registered to this email address was deleted and your subscription was canceled with all charges reimbursed.' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-deletion', 'privacy')) },
      { test: 'include', expected: 'https://support.mozilla.org' },
      { test: 'notInclude', expected: 'https://accounts.firefox.com/support' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Your account was deleted' },
      { test: 'include', expected: 'Recently, a Mozilla account was created and a subscription was charged using this email address. As we do with all new accounts, we asked that you confirm your account by first validating this email address.' },
      { test: 'include', expected: 'At present, we see that the account was never confirmed. Since this step was not completed, we are not sure if this was an authorized subscription. As a result, the Mozilla account registered to this email address was deleted and your subscription was canceled with all charges reimbursed.' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice:\n${configUrl('privacyUrl', 'account-deletion', 'privacy')}` },
      { test: 'include', expected: 'https://support.mozilla.org' },
      { test: 'notInclude', expected: 'https://accounts.firefox.com/support' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['lowRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', [
      { test: 'include', expected: 'Only 2 backup authentication codes left!' }
    ]],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('lowRecoveryCodes') }],
      ['X-Template-Name', { test: 'equal', expected: 'lowRecoveryCodes' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.lowRecoveryCodes }],
    ])],
    ['html', [
      { test: 'include', expected: 'Time to create more backup authentication codes' },
      { test: 'include', expected: decodeUrl(configHref('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'low-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'low-recovery-codes', 'support')) },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You only have two codes left' },
      { test: 'include', expected: `Create codes:\n${configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'low-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'low-recovery-codes', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['lowRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', [
      { test: 'include', expected: 'Only 1 backup authentication code left' }
    ]],
    ['html', [
      { test: 'include', expected: 'You’re on your last backup authentication code' },
      { test: 'include', expected: decodeUrl(configHref('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'low-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'low-recovery-codes', 'support')) },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Backup authentication codes help you restore your info when you forget your password.' },
      { test: 'include', expected: `Create codes:\n${configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'low-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'low-recovery-codes', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ]),
      {updateTemplateValues: values => ({...values, numberRemaining: 1 })}],
  ['lowRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', [
      { test: 'include', expected: 'No backup authentication codes left' }
    ]],
    ['html', [
      { test: 'include', expected: 'You’re out of backup authentication codes!' },
      { test: 'include', expected: decodeUrl(configHref('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'low-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'low-recovery-codes', 'support')) },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You’re out of backup authentication codes!' },
      { test: 'include', expected: `Create codes:\n${configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'low-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'low-recovery-codes', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ]),
      {updateTemplateValues: values => ({...values, numberRemaining: 0 })}],

  ['postVerifyEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Welcome to Mozilla!' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'account-verified', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postVerify') }],
      ['X-Template-Name', { test: 'equal', expected: 'postVerify' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postVerify }],
    ])],
    ['html', [
      { test: 'include', expected: 'We’re delighted to see you!' },
      { test: 'include', expected: 'Want to see the same tab on two devices?' },
      { test: 'include', expected: 'It’s easy! Just install Firefox on another device and log in to sync. It’s like magic!' },
      { test: 'include', expected: '(Psst… It also means you can get your bookmarks, passwords, and other Firefox data everywhere you’re signed in.)' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'account-verified', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: 'another desktop device' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-verified', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-verified', 'support')) },
      { test: 'include', expected: decodeUrl(config.smtp.firefoxDesktopUrl) },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: 'alt="Devices"' },
    ]],
    ['text', [
      { test: 'include', expected: 'We’re delighted to see you!' },
      { test: 'include', expected: 'Want to see the same tab on two devices?' },
      { test: 'include', expected: 'It’s easy! Just install Firefox on another device and log in to sync. It’s like magic!' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-verified', 'privacy')}` },
      { test: 'include', expected: `For more info` },
      { test: 'include', expected: configUrl('supportUrl', 'account-verified', 'support') },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postRemoveSecondaryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Secondary email removed' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-email-removed', 'account-email-removed', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveSecondary') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveSecondary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveSecondary }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-email-removed', 'account-email-removed', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-email-removed', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-email-removed', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Secondary email removed' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-removed', 'account-email-removed', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-email-removed', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'account-email-removed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verificationReminderFirstEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Remember to confirm your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verificationReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'verificationReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verificationReminderFirst }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: 'Remember to confirm your account' },
      { test: 'include', expected: 'Welcome to Mozilla' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'first-verification-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'first-verification-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Welcome to Mozilla' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'first-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'first-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm account:\n${configUrl('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verificationReminderSecondEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Remember to confirm your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verificationReminderSecond') }],
      ['X-Template-Name', { test: 'equal', expected: 'verificationReminderSecond' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verificationReminderSecond }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'second-verification-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'second-verification-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'second-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'second-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm account:\n${configUrl('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verificationReminderFinalEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Final reminder to confirm your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'final-verification-reminder', 'confirm-email', 'code', 'reminder=final', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verificationReminderFinal') }],
      ['X-Template-Name', { test: 'equal', expected: 'verificationReminderFinal' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verificationReminderFinal }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'final-verification-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'final-verification-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'final-verification-reminder', 'confirm-email', 'code', 'reminder=final', 'uid')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'final-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'final-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm account:\n${configUrl('verificationUrl', 'final-verification-reminder', 'confirm-email', 'code', 'reminder=final', 'uid')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Finish creating your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verify') }],
      ['X-Template-Name', { test: 'equal', expected: 'verify' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verify }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: 'Finish creating your account' },
      { test: 'include', expected: 'Open the internet with Mozilla' },
      { test: 'include', expected: 'Confirm your account and get the most out of Mozilla everywhere you sign in starting with:' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: 'alt="Sync devices"' },
      { test: 'notInclude', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Open the internet with Mozilla' },
      { test: 'include', expected: 'Confirm your account and get the most out of Mozilla everywhere you sign in starting with:' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `Confirm account:\n${configUrl('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyShortCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Confirm your account' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verify') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyShortCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyShortCode }],
      ['X-Verify-Short-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: 'Confirm your account' },
      { test: 'include', expected: 'Open the internet with Mozilla' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: 'Use this confirmation code:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Open the internet with Mozilla' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: `Use this confirmation code:\n${MESSAGE.code}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifySecondaryCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Confirm secondary email' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifySecondaryCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifySecondaryCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifySecondaryCode }],
    ])],
    ['html', [
      { test: 'include', expected: 'Confirm secondary email' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-secondary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-secondary', 'support')) },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Mozilla account:` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: 'Use this confirmation code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once confirmed, this address will begin receiving security notifications and confirmations.' },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('privacyUrl', 'welcome-secondary', 'privacy') },
      { test: 'include', expected: configUrl('supportUrl', 'welcome-secondary', 'support') },
      { test: 'include', expected: 'Confirm secondary email' },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Mozilla account:` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: 'Use this confirmation code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once confirmed, this address will begin receiving security notifications and confirmations.' },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifySecondaryCodeEmail', new Map<string, Test | any>([
    ['html', COMMON_METRICS_OPT_OUT_TESTS],
    ['text', COMMON_METRICS_OPT_OUT_TESTS]]),
      {updateTemplateValues: values => ({...values, metricsEnabled: false })}],

  ['passwordResetEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Your password has been reset' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordReset') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordReset' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordReset }],
    ])],
    ['html', [
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-success', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'password-reset-success', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'password-reset-success', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postAddLinkedAccountEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'New account linked to your Mozilla account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('initiatePasswordChangeUrl', 'account-linked', 'change-password', 'email') }],
      ['X-Linked-Account-Provider-Id', { test: 'equal', expected: 'Google'}],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddLinkedAccount') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddLinkedAccount' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddLinkedAccount }],
    ])],
    ['html', [
      { test: 'include', expected: 'Your Google account has been linked to your Mozilla account' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-linked', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-linked', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-linked', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-linked', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Your Google account has been linked to your Mozilla account' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-linked', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password:\n${configUrl('initiatePasswordChangeUrl', 'account-linked', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-linked', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'account-linked', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['newDeviceLoginEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'New sign-in to Mock Relier' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('newDeviceLogin') }],
      ['X-Template-Name', { test: 'equal', expected: 'newDeviceLogin' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.newDeviceLogin }],
    ])],
    ['html', [
      { test: 'include', expected: 'New sign-in to Mock Relier' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'new-device-signin', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-device-signin', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'new-device-signin', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Your Mozilla account was used to sign in' },
      { test: 'include', expected: `Not you? Change your password:\n${configUrl('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email')}` },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'new-device-signin', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'new-device-signin', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'new-device-signin', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['passwordChangedEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Password updated' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordChanged') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordChanged' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordChanged }],
    ])],
    ['html', [
      { test: 'include', expected: 'Password updated' },
      { test: 'include', expected: 'Password changed successfully' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-changed-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-changed-success', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Password changed successfully' },
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'password-changed-success', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'password-changed-success', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['unblockCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account authorization code' }],
    ['headers', new Map([
      ['X-Report-SignIn-Link', { test: 'equal', expected: configUrl('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('unblockCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'unblockCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.unblockCode }],
      ['X-Unblock-Code', { test: 'equal', expected: MESSAGE.unblockCode }],
    ])],
    ['html', [
      { test: 'include', expected: 'Account authorization code' },
      { test: 'include', expected: 'Is this you signing in?' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-unblock', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: MESSAGE.unblockCode },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Is this you signing in?' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'new-unblock', 'privacy')}` },
      { test: 'include', expected: configUrl('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `If yes, here is the authorization code you need: ${MESSAGE.unblockCode}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyPrimaryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Confirm primary email' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyPrimary') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyPrimary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyPrimary }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: 'Confirm primary email' },
      { test: 'include', expected: 'Confirm primary email' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-primary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-primary', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Confirm primary email' },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'welcome-primary', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'welcome-primary', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyLoginEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Confirm sign-in' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyLogin') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyLogin' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyLogin }],
    ])],
    ['html', [
      { test: 'include', expected: 'Confirm sign-in' },
      { test: 'include', expected: 'Did you sign in to Mock Relier?' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-signin', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Did you sign in to Mock Relier?' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'new-signin', 'privacy')}` },
      { test: 'include', expected: `Confirm sign-in\n${configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyLoginCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Approve sign-in to Mock Relier' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyLoginCode') }],
      ['X-Signin-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyLoginCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyLoginCode }],
    ])],
    ['html', [
      { test: 'include', expected: 'Approve sign-in to Mock Relier' },
      { test: 'include', expected: 'Did you sign in to Mock Relier?' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-signin-verify-code', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-signin-verify-code', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'new-signin-verify-code', 'support')) },
      { test: 'include', expected: MESSAGE.code },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Did you sign in to Mock Relier?' },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'new-signin-verify-code', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'new-signin-verify-code', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'new-signin-verify-code', 'support')}` },
      { test: 'include', expected: `If yes, here is your authorization code:\n\n${MESSAGE.code}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['recoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Reset your password' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('recovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'recovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.recovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'Forgot your password?' },
      { test: 'include', expected: 'Create new password' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'forgot-password', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'forgot-password', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Forgot your password?' },
      { test: 'include', expected: 'Create a new password by copying and pasting the URL below into your browser. This link will expire within the next hour.' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'forgot-password', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'forgot-password', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['passwordForgotOtpEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Forgot your password?' }],
    ['headers', new Map([
      ['X-Password-Forgot-Otp', { test: 'equal', expected: MESSAGE.code}],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordForgotOtp') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordForgotOtp' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordForgotOtp }],
    ])],
    ['html', [
      { test: 'include', expected: 'Forgot your password?' },
      { test: 'include', expected: 'We received a request for a password change on your Mozilla account from:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
    ]],
    ['text', [
      { test: 'include', expected: 'Forgot your password?' },
      { test: 'include', expected: 'We received a request for a password change on your Mozilla account from:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
    ]],
  ])],

  ['passwordResetAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Your password has been reset' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'password-reset-account-recovery-success', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordResetAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordResetAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordResetAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'password-reset-account-recovery-success', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-account-recovery-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-account-recovery-success', 'support')) },
      { test: 'include', expected: 'If you didn’t take this action, '},
      { test: 'include', expected: 'change your password'},
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
    ]],
    ['text', [
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: configUrl('accountSettingsUrl', 'password-reset-account-recovery-success', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'password-reset-account-recovery-success', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'password-reset-account-recovery-success', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: `Download Firefox on the App Store:` },
      { test: 'include', expected: `Install Firefox on another device:` },
      { test: 'include', expected: `Get Firefox on Google Play:` },
    ]],
  ]),{updateTemplateValues: values => ({...values, productName: 'Firefox' })}],

  ['passwordResetWithRecoveryKeyPromptEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Your password has been reset' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('createAccountRecoveryUrl', 'password-reset-w-recovery-key-prompt', 'create-recovery-key', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordResetWithRecoveryKeyPrompt') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordResetWithRecoveryKeyPrompt' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordResetWithRecoveryKeyPrompt }],
    ])],
    ['html', [
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: decodeUrl(configHref('createAccountRecoveryUrl', 'password-reset-w-recovery-key-prompt', 'create-recovery-key', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'password-reset-w-recovery-key-prompt', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-w-recovery-key-prompt', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-w-recovery-key-prompt', 'support')) },
      { test: 'include', expected: 'If you didn’t take this action, '},
      { test: 'include', expected: 'change your password'},
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
    ]],
    ['text', [
      { test: 'include', expected: 'Your password has been reset' },
      { test: 'include', expected: configUrl('createAccountRecoveryUrl', 'password-reset-w-recovery-key-prompt', 'create-recovery-key', 'email', 'uid') },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'password-reset-w-recovery-key-prompt', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'password-reset-w-recovery-key-prompt', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'password-reset-w-recovery-key-prompt', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
    ]],
  ]),{updateTemplateValues: values => ({...values, productName: 'Firefox' })}],

  ['postAddAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'New account recovery key created' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'You created a new account recovery key' },
      { test: 'include', expected: 'Save this key in a safe place — you’ll need it to restore your encrypted browsing data if you forget your password.' },
      { test: 'include', expected: 'This key can only be used once. After you use it, we’ll automatically create a new one for you. Or you can create a new one any time from your account settings.' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: `This request came from ${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}.` },
      { test: 'include', expected: decodeUrl(configHref('revokeAccountRecoveryUrl', 'account-recovery-generated', 'report')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-generated', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-generated', 'privacy')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You created a new account recovery key' },
      { test: 'include', expected: 'Save this key in a safe place — you’ll need it to restore your encrypted browsing data if you forget your password.' },
      { test: 'include', expected: 'This key can only be used once. After you use it, we’ll automatically create a new one for you. Or you can create a new one any time from your account settings.' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `This request came from:\n${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `If this wasn’t you, delete the new key:\n${configUrl('revokeAccountRecoveryUrl', 'account-recovery-generated', 'report')}` },
      { test: 'include', expected: `and change your password:\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-recovery-generated', 'support')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-recovery-generated', 'privacy')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postChangeAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account recovery key changed' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-changed', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postChangeAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postChangeAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postChangeAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'You changed your account recovery key' },
      { test: 'include', expected: 'You now have a new account recovery key. Your previous key was deleted.' },
      { test: 'include', expected: 'Save this new key in a safe place — you’ll need it to restore your encrypted browsing data if you forget your password.' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-changed', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: `This request came from ${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}.` },
      { test: 'include', expected: decodeUrl(configHref('revokeAccountRecoveryUrl', 'account-recovery-changed', 'report')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-changed', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-changed', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-changed', 'privacy')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You changed your account recovery key' },
      { test: 'include', expected: 'You now have a new account recovery key. Your previous key was deleted.' },
      { test: 'include', expected: 'Save this new key in a safe place — you’ll need it to restore your encrypted browsing data if you forget your password.' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-changed', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `This request came from:\n${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `If this wasn’t you, delete the new key:\n${configUrl('revokeAccountRecoveryUrl', 'account-recovery-changed', 'report')}` },
      { test: 'include', expected: `and change your password:\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-changed', 'change-password', 'email')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-recovery-changed', 'support')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-recovery-changed', 'privacy')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postRemoveAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account recovery key deleted' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'You deleted your account recovery key' },
      { test: 'include', expected: 'Your account recovery key is required to restore your encrypted browsing data if you forget your password.' },
      { test: 'include', expected: 'If you haven’t already, create a new account recovery key in your account settings to prevent losing your saved passwords, bookmarks, browsing history, and more.' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: `This request came from ${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}.` },
      { test: 'notInclude', expected: decodeUrl(configHref('revokeAccountRecoveryUrl', 'account-recovery-removed', 'report')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-removed', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-removed', 'privacy')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You deleted your account recovery key' },
      { test: 'include', expected: 'Your account recovery key is required to restore your encrypted browsing data if you forget your password.' },
      { test: 'include', expected: 'If you haven’t already, create a new account recovery key in your account settings to prevent losing your saved passwords, bookmarks, browsing history, and more.' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `This request came from:\n${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `If this wasn’t you, change your password:\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email')}` },
      { test: 'notInclude', expected: decodeUrl(configHref('revokeAccountRecoveryUrl', 'account-recovery-removed', 'report')) },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-recovery-removed', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-recovery-removed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postRemoveTwoStepAuthenticationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Two-step authentication turned off' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: 'You turned off two-step authentication' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-two-step-disabled', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-two-step-disabled', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You turned off two-step authentication' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-two-step-disabled', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-two-step-disabled', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postVerifySecondaryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Secondary email added' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postVerifySecondary') }],
      ['X-Template-Name', { test: 'equal', expected: 'postVerifySecondary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postVerifySecondary }],
    ])],
    ['html', [
      { test: 'include', expected: `You have successfully confirmed ${MESSAGE.secondaryEmail}` },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-email-verified', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-email-verified', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Secondary email added' },
      { test: 'include', expected: `You have successfully confirmed ${MESSAGE.secondaryEmail}` },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-email-verified', 'privacy')}` },
      { test: 'notInclude', expected: config.smtp.supportUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postAddTwoStepAuthenticationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Two-step authentication turned on' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: 'You turned on two-step authentication' },
      { test: 'include', expected: 'Security codes from your authentication app are now required every time you sign in.' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-two-step-enabled', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-two-step-enabled', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You turned on two-step authentication' },
      { test: 'include', expected: 'Security codes from your authentication app are now required every time you sign in.' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-two-step-enabled', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-two-step-enabled', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postChangePrimaryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Primary email updated' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postChangePrimary') }],
      ['X-Template-Name', { test: 'equal', expected: 'postChangePrimary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postChangePrimary }],
    ])],
    ['html', [
      { test: 'include', expected: 'New primary email' },
      { test: 'include', expected: `You have successfully changed your primary email to ${MESSAGE.email}` },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-email-changed', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-email-changed', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-email-changed', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'New primary email' },
      { test: 'include', expected: `You have successfully changed your primary email to ${MESSAGE.email}` },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-email-changed', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-email-changed', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support: ${configUrl('supportUrl', 'account-email-changed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postConsumeRecoveryCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: '2 backup authentication codes left' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postConsumeRecoveryCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'postConsumeRecoveryCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postConsumeRecoveryCode }],
    ])],
    ['html', [
      { test: 'include', expected: 'You used a backup authentication code' },
      { test: 'include', expected: 'It was used on:' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-consume-recovery-code', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-consume-recovery-code', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You used a backup authentication code' },
      { test: 'include', expected: 'It was used on:' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-consume-recovery-code', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-consume-recovery-code', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postNewRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'New backup authentication codes created' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postNewRecoveryCodes') }],
      ['X-Template-Name', { test: 'equal', expected: 'postNewRecoveryCodes' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postNewRecoveryCodes }],
    ])],
    ['html', [
      { test: 'include', expected: 'You created new backup authentication codes' },
      { test: 'include', expected: 'They were created on:' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-replace-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-replace-recovery-codes', 'support')) },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You created new backup authentication codes' },
      { test: 'include', expected: 'They were created on:' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password right away:\n${configUrl('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'account-replace-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more info, visit Mozilla Support:\n${configUrl('supportUrl', 'account-replace-recovery-codes', 'support')}` },
      { test: 'include', expected: `${MESSAGE.device.uaBrowser} on ${MESSAGE.device.uaOS} ${MESSAGE.device.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['passwordChangeRequiredEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Suspicious activity detected' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordChangeRequired') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordChangeRequired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordChangeRequired }],
    ])],
    ['html', [
      { test: 'include', expected: 'Password Change Required' },
      { test: 'include', expected: 'change your password as a precaution' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-change-required', 'privacy')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Password Change Required' },
      { test: 'include', expected: 'change your password as a precaution' },
      { test: 'include', expected: `Mozilla Accounts Privacy Notice\n${configUrl('privacyUrl', 'password-change-required', 'privacy')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['downloadSubscriptionEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Welcome to ${MESSAGE.productName}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('downloadSubscription') }],
      ['X-Template-Name', { test: 'equal', expected: 'downloadSubscription' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.downloadSubscription }],
    ])],
    ['html', [
      { test: 'include', expected: 'https://www.mozilla.org/privacy/websites/' },
      { test: 'include', expected: MESSAGE.planSuccessActionButtonURL },
      { test: 'include', expected: MESSAGE.appStoreLink },
      { test: 'include', expected: MESSAGE.playStoreLink },
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'new-subscription', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'new-subscription', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'new-subscription', 'subscription-terms')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'new-subscription', 'subscription-support')) },
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
      { test: 'include', expected: 'get started using all the features included in your subscription' },
      { test: 'include', expected: 'Get Started' },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: `alt="Download ${MESSAGE.productName} on the App Store"` },
      { test: 'include', expected: `alt="Download ${MESSAGE.productName} on Google Play"` },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Devices"'},
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: MESSAGE.planSuccessActionButtonURL },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'new-subscription', 'subscription-privacy') },
      { test: 'include', expected: configUrl('subscriptionSettingsUrl', 'new-subscription', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configUrl('subscriptionTermsUrl', 'new-subscription', 'subscription-terms') },
      { test: 'include', expected: configUrl('subscriptionSupportUrl', 'new-subscription', 'subscription-support') },
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
      { test: 'include', expected: 'get started using all the features included in your subscription' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['downloadSubscriptionEmail', new Map<string, Test | any>([
    ['html', COMMON_METRICS_OPT_OUT_TESTS],
    ['text', COMMON_METRICS_OPT_OUT_TESTS]]),
      {updateTemplateValues: values => ({...values, metricsEnabled: false })}],

  ['subscriptionAccountDeletionEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been cancelled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionAccountDeletion') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionAccountDeletion' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionAccountDeletion }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-account-deletion', 'subscription-privacy') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-account-deletion', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-account-deletion', 'subscription-terms') },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: `alt="${MESSAGE.productName}"` },
      { test: 'notInclude', expected: 'alt="Devices"' },
      { test: 'notInclude', expected: 'alt="Sync Devices"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'subscription-account-deletion', 'subscription-privacy') },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionAccountDeletionEmail', new Map<string, Test | any>([
      ['html', [
        { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM },
        { test: 'notInclude', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      ]],
      ['text', [
        { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM },
        { test: 'notInclude', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      ]]
    ]),
    {updateTemplateValues: x => (
      {...x, productMetadata: { ...MESSAGE.productMetadata, 'product:cancellationSurveyURL': SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM}})}
  ],

  ['subscriptionAccountFinishSetupEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Welcome to ${MESSAGE.productName}: Please set your password.` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionAccountFinishSetup') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionAccountFinishSetup' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionAccountFinishSetup }],
    ])],
    ['html', [
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}: Please set your password.` },
      { test: 'include', expected: decodeUrl(configHref('accountFinishSetupUrl', 'subscription-account-finish-setup', 'subscriptions', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'subscription-account-finish-setup', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-account-finish-setup', 'subscription-support')) },
      { test: 'notInclude', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-account-finish-setup', 'cancel-subscription', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId', 'uid')) },
      { test: 'notInclude', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-account-finish-setup', 'update-billing', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId', 'uid'))},
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Charged: ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: 'Next, you’ll create a Mozilla account password to start using your new subscription.' },
      { test: 'include', expected: `alt="${MESSAGE.productName}"` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}: Please set your password.` },
      { test: 'include', expected: configUrl('accountFinishSetupUrl', 'subscription-account-finish-setup', 'subscriptions', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId') },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'subscription-account-finish-setup', 'subscription-privacy') },
      { test: 'include', expected: configUrl('subscriptionSupportUrl', 'subscription-account-finish-setup', 'subscription-support') },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Charged: ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: 'Next, you’ll create a Mozilla account password to start using your new subscription.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

  ['subscriptionAccountReminderFirstEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Reminder: Finish setting up your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountFinishSetupUrl', 'first-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionAccountReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionAccountReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionAccountReminderFirst }],
    ])],
    ['html', [
      { test: 'include', expected: 'Reminder: Finish setting up your account' },
      { test: 'include', expected: 'Create Password' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'first-subscription-account-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'first-subscription-account-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('accountFinishSetupUrl', 'first-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Reminder: Finish setting up your account' },
      { test: 'include', expected: `Create Password:\n${configUrl('accountFinishSetupUrl', 'first-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['subscriptionAccountReminderSecondEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Final reminder: Setup your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountFinishSetupUrl', 'second-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionAccountReminderSecond') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionAccountReminderSecond' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionAccountReminderSecond }],
    ])],
    ['html', [
      { test: 'include', expected: 'Final reminder: Setup your account' },
      { test: 'include', expected: 'Create Password' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'second-subscription-account-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'second-subscription-account-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('accountFinishSetupUrl', 'second-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Final reminder: Setup your account' },
      { test: 'include', expected: `Create Password:\n${configUrl('accountFinishSetupUrl', 'second-subscription-account-reminder', 'subscription-account-create-email', 'email', 'product_name', 'token', 'product_id', 'flowId', 'flowBeginTime', 'deviceId')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['subscriptionDowngradeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `You have switched to ${MESSAGE.productNameNew}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionDowngrade') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionDowngrade' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionDowngrade }],
    ])],
    ['html', [
      { test: 'include', expected: `You have switched to ${MESSAGE.productNameNew}` },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-downgrade', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-downgrade', 'subscription-terms') },
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.` },
      { test: 'include', expected: `one-time credit of ${MESSAGE_FORMATTED.paymentProrated} to reflect the lower charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'include', expected: 'Your subscription will automatically renew' },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'include', expected: `alt="${MESSAGE.productNameNew}"` },
      { test: 'include', expected: `alt="${MESSAGE.productNameOld}"` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.` },
      { test: 'include', expected: `one-time credit of ${MESSAGE_FORMATTED.paymentProrated} to reflect the lower charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'include', expected: 'Your subscription will automatically renew' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
    // If expected `productName` differs from MESSAGE.productName, set the value for testing
    // only; we do the equivalent in the mailer methods, e.g. `productName: newProductName`
  ]), {updateTemplateValues: x => ({...x, productName: MESSAGE.productNameNew})}],

  ['subscriptionCancellationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been canceled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionCancellation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionCancellation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionCancellation }],
    ])],
    ['html', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been canceled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-cancellation', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-cancellation', 'subscription-terms')) },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'include', expected: `canceled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: `alt="${MESSAGE.productName}"`},
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been canceled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: `canceled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

  ['subscriptionCancellationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been canceled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionCancellation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionCancellation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionCancellation }],
    ])],
    ['html', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been canceled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-cancellation', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-cancellation', 'subscription-terms')) },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'include', expected: `canceled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: `alt="${MESSAGE.productName}"`},
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been canceled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: `canceled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]),
    {updateTemplateValues: x => (
      {...x, showOutstandingBalance: true})}
  ],

  ['subscriptionCancellationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been canceled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionCancellation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionCancellation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionCancellation }],
    ])],
    ['html', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been canceled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-cancellation', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-cancellation', 'subscription-terms')) },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'include', expected: `canceled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.` },
      { test: 'notInclude', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: `alt="${MESSAGE.productName}"`},
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been canceled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: `canceled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} will be paid on 03/20/2020.` },
      { test: 'notInclude', expected: `billing period, which is 04/19/2020.` },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]),
    {updateTemplateValues: x => (
      {...x, showOutstandingBalance: true, cancelAtEnd: false})}
  ],

  ['subscriptionCancellationEmail', new Map<string, Test | any>([
    ['html', [
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM },
      { test: 'notInclude', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
    ]],
    ['text', [
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM },
      { test: 'notInclude', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
    ]]
  ]),
    {updateTemplateValues: x => (
      {...x, productMetadata: { ...MESSAGE.productMetadata, 'product:cancellationSurveyURL': SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM}})}
  ],

  ['subscriptionFailedPaymentsCancellationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been cancelled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFailedPaymentsCancellation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFailedPaymentsCancellation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFailedPaymentsCancellation }],
    ])],
    ['html', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: 'Your subscription has been cancelled' },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-failed-payments-cancellation', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-failed-payments-cancellation', 'update-billing', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'include', expected: `We’ve cancelled your ${MESSAGE.productName} subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: 'Your subscription has been cancelled' },
      { test: 'include', expected: `We’ve cancelled your ${MESSAGE.productName} subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.` },
      { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

  ['subscriptionFailedPaymentsCancellationEmail', new Map<string, Test | any>([
      ['html', [
        { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM },
        { test: 'notInclude', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      ]],
      ['text', [
        { test: 'include', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM },
        { test: 'notInclude', expected: SUBSCRIPTION_CANCELLATION_SURVEY_URL },
      ]]
    ]),
    {updateTemplateValues: x => (
      {...x, productMetadata: { ...MESSAGE.productMetadata, 'product:cancellationSurveyURL': SUBSCRIPTION_CANCELLATION_SURVEY_URL_CUSTOM}})}
  ],

  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],

  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],

  // Show Unknown card ending in [last four digits] when cardType is Unknown
  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Unknown card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Unknown card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]]),
    {updateTemplateValues: x => (
      {...x, cardType: 'Unknown'})}
  ],

  // Do not display the Payment Method when "showPaymentMethod" is false
  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: `Mastercard card ending in 5309` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: `Mastercard card ending in 5309` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]]),
    {updateTemplateValues: x => (
      {...x, showPaymentMethod: false})}
  ],

  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `One time Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `One time Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, discountType: 'once', discountDuration: null})}
  ],

  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `3-month Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `3-month Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, discountType: 'repeating', discountDuration: 3})}
  ],

  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Taxes &amp; fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'notInclude', expected: `Discount:` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}` },
      { test: 'notInclude', expected: `Discount:` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, discountType: null, discountDuration: null, invoiceTaxAmountInCents: 48, showTaxAmount: true })}
  ],

  ['subscriptionFirstInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Taxes &amp; fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `3-month Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Taxes & fees: ${MESSAGE_FORMATTED.invoiceTaxAmount}` },
      { test: 'include', expected: `3-month Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, discountType: 'repeating', discountDuration: 3, invoiceTaxAmountInCents: 48, showTaxAmount: true })}
  ],

  ['subscriptionPaymentExpiredEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Credit card for ${MESSAGE.productName} expired or expiring soon` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentExpired') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentExpired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'subscription-payment-expired', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-payment-expired', 'update-billing', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-payment-expired', 'subscription-terms')) },
      { test: 'include', expected: `for ${MESSAGE.productName} is expired or about to expire.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Credit card for ${MESSAGE.productName} expired or expiring soon` },
      { test: 'include', expected: `for ${MESSAGE.productName} is expired or about to expire.` },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'subscription-payment-expired', 'subscription-privacy') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]),
    {updateTemplateValues: x => (
      {...x, subscriptions: [{planId: MESSAGE.planId, productId: MESSAGE.productId, ...x.subscriptions[0]}]})}],

  ['subscriptionPaymentExpiredEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Credit card for your subscriptions is expired or expiring soon' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionsPaymentExpired') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionsPaymentExpired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'subscriptions-payment-expired', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscriptions-payment-expired', 'update-billing', 'email', 'uid')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscriptions-payment-expired', 'subscription-terms') },
      { test: 'include', expected: 'using to make payments for the following subscriptions is expired or about to expire.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Credit card for your subscriptions is expired or expiring soon' },
      { test: 'include', expected: 'using to make payments for the following subscriptions is expired or about to expire.' },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'subscriptions-payment-expired', 'subscription-privacy') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]), {updateTemplateValues: x => ({...x, productName: undefined})}],

  ['subscriptionPaymentFailedEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment failed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentFailed') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentFailed' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentFailed }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-payment-failed', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-payment-failed', 'subscription-terms') },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: 'We’ll try your payment again over the next few days, but you may need to help us fix it' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment failed` },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: 'We’ll try your payment again over the next few days, but you may need to help us fix it' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

  ['subscriptionPaymentProviderCancelledEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Payment information update required for ${MESSAGE.productName}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentProviderCancelled') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentProviderCancelled' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentProviderCancelled }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-payment-provider-cancelled', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-payment-provider-cancelled', 'update-billing', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: 'Sorry, we’re having trouble with your payment method' },
      { test: 'include', expected: `We have detected a problem with your payment method for ${MESSAGE.productName}.` },
      { test: 'include', expected: 'It may be that your credit card has expired, or your current payment method is out of date.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Payment information update required for ${MESSAGE.productName}` },
      { test: 'include', expected: 'Sorry, we’re having trouble with your payment method' },
      { test: 'include', expected: `We have detected a problem with your payment method for ${MESSAGE.productName}.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]),
    {updateTemplateValues: x => (
      {...x, subscriptions: [{planId: MESSAGE.planId, productId: MESSAGE.productId, ...x.subscriptions[0]}]})}
  ],

  // test for `subscriptionsPaymentProviderCancelledEmail` (plural)
  ['subscriptionPaymentProviderCancelledEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Payment information update required for Mozilla subscriptions' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionsPaymentProviderCancelled') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionsPaymentProviderCancelled' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionsPaymentProviderCancelled }],
    ])],
    ['html', [
      { test: 'include', expected: 'Payment information update required for Mozilla subscriptions' },
      { test: 'include', expected: 'Sorry, we’re having trouble with your payment method' },
      { test: 'include', expected: 'Firefox Fortress' },
      { test: 'include', expected: 'Cooking with Foxkeh' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscriptions-payment-provider-cancelled', 'update-billing', 'email', 'uid')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscriptions-payment-provider-cancelled', 'subscription-terms') },
      { test: 'include', expected: 'We have detected a problem with your payment method for the following subscriptions.' },
      { test: 'include', expected: 'It may be that your credit card has expired, or your current payment method is out of date.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Payment information update required for Mozilla subscriptions' },
      { test: 'include', expected: 'Sorry, we’re having trouble with your payment method' },
      { test: 'include', expected: 'Firefox Fortress' },
      { test: 'include', expected: 'Cooking with Foxkeh' },
      { test: 'include', expected: 'We have detected a problem with your payment method for the following subscriptions.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]), {updateTemplateValues: x => ({...x, productName: undefined})}],

  ['subscriptionReactivationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} subscription reactivated` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionReactivation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionReactivation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionReactivation }],
    ])],
    ['html', [
      { test: 'include', expected: `Thank you for reactivating your ${MESSAGE.productName} subscription!` },
      { test: 'include', expected: `will be ${MESSAGE_FORMATTED.invoiceTotal} on 04/19/2020` },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-reactivation', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-reactivation', 'subscription-terms') },
      { test: 'include', expected: `reactivating your ${MESSAGE.productName} subscription` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Thank you for reactivating your ${MESSAGE.productName} subscription!` },
      { test: 'include', expected: `will be ${MESSAGE_FORMATTED.invoiceTotal} on 04/19/2020` },
      { test: 'include', expected: `reactivating your ${MESSAGE.productName} subscription` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

  ['subscriptionRenewalReminderEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.subscription.productName} automatic renewal notice` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionRenewalReminder') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionRenewalReminder' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionRenewalReminder }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-renewal-reminder', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-renewal-reminder', 'update-billing', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-renewal-reminder', 'subscription-support')) },
      { test: 'include', expected: `Dear ${MESSAGE.subscription.productName} customer` },
      { test: 'include', expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days. At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.` },
      { test: 'include', expected: "Sincerely," },
      { test: 'include', expected: `The ${MESSAGE.subscription.productName} team` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.subscription.productName} automatic renewal notice` },
      { test: 'include', expected: `Dear ${MESSAGE.subscription.productName} customer` },
      { test: 'include', expected: `Your current subscription is set to automatically renew in ${MESSAGE.reminderLength} days. At that time, Mozilla will renew your ${MESSAGE.planIntervalCount} ${MESSAGE.planInterval} subscription and a charge of ${MESSAGE_FORMATTED.invoiceTotal} will be applied to the payment method on your account.` },
      { test: 'include', expected: "Sincerely," },
      { test: 'include', expected: `The ${MESSAGE.subscription.productName} team` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]), {updateTemplateValues: x => ({...x, productName: MESSAGE.subscription.productName })}],

  ['subscriptionSubsequentInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: 'Thank you for being a subscriber!' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice', 'subscription-support')) },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment received` },
      { test: 'include', expected: 'Thank you for being a subscriber!' },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],

  ['subscriptionSubsequentInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice', 'subscription-support')) },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment received` },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],
  ['subscriptionSubsequentInvoiceEmail', new Map<string, Test | any>([
      ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
      ['headers', new Map([
        ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoice') }],
        ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoice' }],
        ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice }],
      ])],
      ['html', [
        { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
        { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice', 'subscription-terms') },
        { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice', 'subscription-support')) },
        { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
        { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
        { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
        { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
        { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
        { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
        { test: 'include', expected: `Next Invoice: 04/19/2020` },
        { test: 'include', expected: `View your invoice` },
        { test: 'notInclude', expected: `Mastercard card ending in 5309` },
        { test: 'notInclude', expected: 'utm_source=email' },
        { test: 'notInclude', expected: 'PayPal' },
      ]],
      ['text', [
        { test: 'include', expected: `${MESSAGE.productName} payment received` },
        { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
        { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
        { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
        { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
        { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
        { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
        { test: 'include', expected: `Next Invoice: 04/19/2020` },
        { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
        { test: 'notInclude', expected: `Mastercard card ending in 5309` },
        { test: 'notInclude', expected: 'utm_source=email' },
        { test: 'notInclude', expected: 'PayPal' },
      ]]
    ]),
    {updateTemplateValues: x => ({...x, showPaymentMethod: false})}
  ],
  ['subscriptionSubsequentInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice', 'subscription-support')) },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `One time Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment received` },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `One time Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, discountType: 'once', discountDuration: null})}
  ],
  ['subscriptionSubsequentInvoiceEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice', 'subscription-support')) },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `3-month Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment received` },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `Mastercard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `3-month Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, discountType: 'repeating', discountDuration: 3})}
  ],

  ['subscriptionUpgradeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `You have upgraded to ${MESSAGE.productNameNew}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionUpgrade') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionUpgrade' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionUpgrade }],
    ])],
    ['html', [
      { test: 'include', expected: `You have upgraded to ${MESSAGE.productNameNew}` },
      { test: 'include', expected: 'Thank you for upgrading!' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-upgrade', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-upgrade', 'subscription-terms')) },
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.` },
      { test: 'include', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect your subscription’s higher price for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `You have upgraded to ${MESSAGE.productNameNew}` },
      { test: 'include', expected: 'Thank you for upgrading!' },
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.` },
      { test: 'include', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect your subscription’s higher price for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]), {updateTemplateValues: x => (
    {...x, productName: MESSAGE.productNameNew })}
  ],

  // Template partial specific tests (choose a template containing the partial)
  ['verifyLoginEmail', new Map<string, Test | any>([
    ['html', [
      { test: 'include', expected: 'Firefox Nightly on Mac OSX 10.11' },
    ]],
    ['text', [
      { test: 'include', expected: 'Firefox Nightly on Mac OSX 10.11' },
    ]]])],
  ['verifyLoginEmail', new Map<string, Test | any>([
    ['html', [
      { test: 'include', expected: 'Firefox Nightly on Mac OSX' },
      { test: 'notInclude', expected: '10.11' }
    ]],
    ['text', [
      { test: 'include', expected: 'Firefox Nightly on Mac OSX' },
      { test: 'notInclude', expected: '10.11' }
    ]]]),
      {updateTemplateValues: values => ({...values, device: MOCK_DEVICE_BROWSER_OS })}],
  ['verifyLoginEmail', new Map<string, Test | any>([
    ['html', [
      { test: 'include', expected: 'Firefox Nightly' },
      { test: 'notInclude', expected: 'Firefox Nightly on' },
    ]],
    ['text', [
      { test: 'include', expected: 'Firefox Nightly' },
      { test: 'notInclude', expected: 'Firefox Nightly on' },
    ]]]),
      {updateTemplateValues: values => ({...values, device: MOCK_DEVICE_BROWSER })}],
  ['verifyLoginEmail', new Map<string, Test | any>([
    ['html', [
      { test: 'include', expected: 'Mac OSX' },
      { test: 'notInclude', expected: '10.11' },
      { test: 'notInclude', expected: 'Firefox Nightly' },
    ]],
    ['text', [
      { test: 'include', expected: 'Mac OSX' },
      { test: 'notInclude', expected: '10.11' },
      { test: 'notInclude', expected: 'Firefox Nightly' },
    ]]]),
      {updateTemplateValues: values => ({...values, device: MOCK_DEVICE_OS })}],
  ['verifyLoginEmail', new Map<string, Test | any>([
    ['html', [
      { test: 'include', expected: 'Mac OSX 10.11' },
      { test: 'notInclude', expected: 'Firefox Nightly' },
    ]],
    ['text', [
      { test: 'include', expected: 'Mac OSX 10.11' },
      { test: 'notInclude', expected: 'Firefox Nightly' },
    ]]]),
      {updateTemplateValues: values => ({...values, device: MOCK_DEVICE_OS_VERSION })}],
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
            expected: encodeURIComponent(
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.privacyNoticeDownload
            ),
          },
          {
            test: 'include',
            expected: encodeURIComponent(
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.termsOfServiceDownload
            ),
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected: encodeURIComponent(
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.privacyNoticeDownload
            ),
          },
          {
            test: 'include',
            expected: encodeURIComponent(
              MESSAGE_WITH_PLAN_CONFIG.planConfig.urls.termsOfServiceDownload
            ),
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
  [
    'subscriptionCancellationEmail',
    new Map<string, Test | any>([
      [
        'html',
        [
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.locales.fr.urls
                .cancellationSurvey,
          },
        ],
      ],
      [
        'text',
        [
          {
            test: 'include',
            expected:
              MESSAGE_WITH_PLAN_CONFIG.planConfig.locales.fr.urls
                .cancellationSurvey,
          },
        ],
      ],
    ]),
    {
      updateTemplateValues: (values) => ({
        ...values,
        acceptLanguage: 'fr',
      }),
    },
  ],
];

const PAYPAL_MESSAGE = Object.assign({}, MESSAGE);

PAYPAL_MESSAGE.payment_provider = 'paypal';

const TESTS_WITH_PAYPAL_AS_PAYMENT_PROVIDER: [
  string,
  any,
  Record<string, any>?
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
          { test: 'notInclude', expected: `Mastercard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: 'Mastercard card ending in 5309' },
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
          { test: 'notInclude', expected: `Mastercard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `Mastercard card ending in 5309` },
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

  after(() => mailer.stop());

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
      mailer.mailer.sendMail = stubSendMail((message: Record<any, any>) => {
        COMMON_TESTS.forEach((assertions, property) => {
          applyAssertions(type, message, property, assertions);
        });
        test.forEach((assertions: any, property: string) => {
          applyAssertions(type, message, property, assertions);
        });
      });
      const { updateTemplateValues }: any = opts;
      const tmplVals = updateTemplateValues
        ? updateTemplateValues(MESSAGE)
        : MESSAGE;
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
      sinon.stub(mailer.mailer, 'sendMail').callsFake((config, cb) => {
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
      sinon
        .stub(mailer.mailer, 'sendMail')
        .callsFake((config, cb) => cb(new Error('Fail')));
    });

    it('rejects sendMail status', () => {
      const message = {
        email: 'test@restmail.net',
        subject: 'subject',
        template: 'verifyLogin',
        uid: 'foo',
      };

      return mailer.send(message).then(assert.notOk, (err) => {
        assert.equal(err.message, 'Fail');
      });
    });
  });
});

describe('mailer constructor:', () => {
  let mailerConfig, mockLog, mailer;

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
    ].reduce((target, key) => {
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

function sesMessageTagsHeaderValue(templateName: string, serviceName?: any) {
  return `messageType=fxa-${templateName}, app=fxa, service=${
    serviceName || 'fxa-auth-server'
  }`;
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
    baseUri = SUBSCRIPTION_TERMS_URL;
  } else if (key === 'subscriptionPrivacyUrl') {
    baseUri = SUBSCRIPTION_PRIVACY_URL;
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

  const url = out.toString();
  if (['subscriptionTermsUrl', 'subscriptionPrivacyUrl'].includes(key)) {
    const parsedUrl = new URL(config.subscriptions.paymentsServer.url);
    return `${parsedUrl.origin}/legal-docs?url=${encodeURIComponent(url)}`;
  }

  return url;
}

function decodeUrl(encodedUrl: string) {
  return encodedUrl.replace(/&/gm, '&amp;');
}

async function setup(
  log: Record<any, any>,
  config: Record<any, any>,
  mocks: any,
  locale = 'en',
  sender: any = null
) {
  const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, mocks)(
    log,
    config,
    {
      check: () => Promise.resolve(),
    }
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
