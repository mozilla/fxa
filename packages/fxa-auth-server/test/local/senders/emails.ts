/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ROOT_DIR = '../../..';

import { assert } from 'chai';
import mocks from '../../mocks';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { URL } from 'url';

const moment = require('moment-timezone');
const config = require(`${ROOT_DIR}/config`).getProperties();
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
  location: {
    city: 'Mountain View',
    country: 'USA',
    stateCode: 'CA',
  },
  email: 'a@b.com',
  flowBeginTime: Date.now(),
  flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  ip: '219.129.234.194',
  locations: [],
  numberRemaining: 2,
  primaryEmail: 'c@d.com',
  service: 'sync',
  time: moment().tz('America/Los_Angeles').format('LTS (z)'),
  timeZone: 'America/Los_Angeles',
  tokenCode: 'abc123',
  type: 'secondary',
  uaBrowser: 'Firefox',
  uaBrowserVersion: '70.0a1',
  uaOS: 'Windows',
  uaOSVersion: '10',
  uid: 'uid',
  metricsEnabled: true,
  unblockCode: 'AS6334PK',
  cardType: 'mastercard',
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
  nextInvoiceDate: new Date(1587339098816),
  paymentAmountOldInCents: 9999099.9,
  paymentAmountOldCurrency: 'jpy',
  paymentAmountNewInCents: 12312099.9,
  paymentAmountNewCurrency: 'gbp',
  paymentProratedInCents: 523099.9,
  paymentProratedCurrency: 'usd',
  payment_provider: 'stripe',
  planDownloadURL: 'http://getfirefox.com/',
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
};

const MESSAGE_FORMATTED = {
  // Note: Intl.NumberFormat rounds 1/10 cent up
  invoiceTotal: '€10,000.00',
  paymentAmountOld: '¥99,991',
  paymentAmountNew: '£123,121.00',
  paymentProrated: '$5,231.00',
  invoiceSubtotal: '€10,002.00',
  invoiceDiscountAmount: '€2.00',
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
    ['subject', { test: 'equal', expected: 'Your Friendly Reminder: How To Complete Your Sync Setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'cad-reminder-first', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('cadReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'cadReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.cadReminderFirst }],
    ])],
    ['html', [
      { test: 'include', expected: "Here’s your reminder to sync devices." },
      { test: 'include', expected: 'It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'cad-reminder-first', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: 'another device' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'cad-reminder-first', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'cad-reminder-first', 'support')) },
      { test: 'include', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: 'alt="Devices"' },
      { test: 'include', expected: `alt="Download Firefox on the App Store"` },
      { test: 'include', expected: `alt="Download Firefox on Google Play"` },
      { test: 'notInclude', expected: 'alt="Sync devices"' },
      { test: 'notInclude', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: config.smtp.firefoxDesktopUrl },
    ]],
    ['text', [
      { test: 'include', expected: "Here’s your reminder to sync devices." },
      { test: 'include', expected: 'It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'cad-reminder-first', 'privacy')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ]),
    {updateTemplateValues: x => (
      {...x, productName: undefined})}],

  ['cadReminderSecondEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Final Reminder: Complete Sync Setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'cad-reminder-second', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('cadReminderSecond') }],
      ['X-Template-Name', { test: 'equal', expected: 'cadReminderSecond' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.cadReminderSecond }],
    ])],
    ['html', [
      { test: 'include', expected: 'Last reminder to sync devices!' },
      { test: 'include', expected: 'Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'cad-reminder-second', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'cad-reminder-second', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'cad-reminder-second', 'support')) },
      { test: 'include', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: 'alt="Devices"' },
    ]],
    ['text', [
      { test: 'include', expected: 'Last reminder to sync devices!' },
      { test: 'include', expected: 'Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'cad-reminder-second', 'privacy')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['lowRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', [
      { test: 'include', expected: '2 recovery codes remaining' }
    ]],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('lowRecoveryCodes') }],
      ['X-Template-Name', { test: 'equal', expected: 'lowRecoveryCodes' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.lowRecoveryCodes }],
    ])],
    ['html', [
      { test: 'include', expected: '2 recovery codes remaining' },
      { test: 'include', expected: decodeUrl(configHref('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'low-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'low-recovery-codes', 'support')) },
      { test: 'include', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Low recovery codes remaining' },
      { test: 'include', expected: `Generate codes:\n${configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'low-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'low-recovery-codes', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['lowRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', [
      { test: 'include', expected: '1 recovery code remaining' }
    ]]]),
      {updateTemplateValues: values => ({...values, numberRemaining: 1 })}],

  ['postVerifyEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account verified. Next, sync another device to finish setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'account-verified', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postVerify') }],
      ['X-Template-Name', { test: 'equal', expected: 'postVerify' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postVerify }],
    ])],
    ['html', [
      { test: 'include', expected: 'Account verified. Next, sync another device to finish setup' },
      { test: 'include', expected: "Firefox account verified. You’re almost there." },
      { test: 'include', expected: 'Next sync between your devices!' },
      { test: 'include', expected: 'Sync privately keeps your bookmarks, passwords and other Firefox data the same across all your devices.' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'account-verified', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: 'another desktop device' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-verified', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-verified', 'support')) },
      { test: 'include', expected: decodeUrl(config.smtp.firefoxDesktopUrl) },
      { test: 'include', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: 'alt="Devices"' },
    ]],
    ['text', [
      { test: 'include', expected: 'Firefox account verified. You’re almost there.' },
      { test: 'include', expected: 'Next sync between your devices!' },
      { test: 'include', expected: 'Sync privately keeps your bookmarks, passwords and other Firefox data the same across all your devices.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-verified', 'privacy')}` },
      { test: 'include', expected: `Have questions? Visit` },
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
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-email-removed', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-email-removed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verificationReminderFirstEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Reminder: Finish creating your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verificationReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'verificationReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verificationReminderFirst }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: 'Reminder: Finish creating your account' },
      { test: 'include', expected: 'Welcome to the Firefox family' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'first-verification-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'first-verification-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Welcome to the Firefox family' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'first-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'first-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verificationReminderSecondEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Final reminder: Activate your account' }],
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
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'second-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'second-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid')}` },
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
      { test: 'include', expected: 'Activate the Firefox family of products' },
      { test: 'include', expected: 'Confirm your account and get the most out of Firefox everywhere you sign in starting with:' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'alt="Sync devices"' },
      { test: 'notInclude', expected: 'alt="Firefox logo"' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Activate the Firefox family of products' },
      { test: 'include', expected: 'Confirm your account and get the most out of Firefox everywhere you sign in.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyShortCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Verification code: ${MESSAGE.code}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verify') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyShortCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyShortCode }],
      ['X-Verify-Short-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: `Verification code: ${MESSAGE.code}` },
      { test: 'include', expected: 'Is this you signing up?' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: 'If yes, use this verification code in your registration form:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Is this you signing up?' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'include', expected: `If yes, use this verification code in your registration form:\n${MESSAGE.code}` },
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
      { test: 'include', expected: 'Verify secondary email' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-secondary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-secondary', 'support')) },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox account:` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'Use this verification code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once verified, this address will begin receiving security notifications and confirmations.' },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('privacyUrl', 'welcome-secondary', 'privacy') },
      { test: 'include', expected: configUrl('supportUrl', 'welcome-secondary', 'support') },
      { test: 'include', expected: 'Verify secondary email' },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox account:` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'Use this verification code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once verified, this address will begin receiving security notifications and confirmations.' },
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
    ['subject', { test: 'equal', expected: 'Password updated' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordReset') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordReset' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordReset }],
    ])],
    ['html', [
      { test: 'include', expected: 'Password updated' },
      { test: 'include', expected: 'Your account password was changed' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-success', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Your account password was changed' },
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-reset-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-reset-success', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postAddLinkedAccountEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'New account linked to Firefox' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('initiatePasswordChangeUrl', 'account-linked', 'change-password', 'email') }],
      ['X-Linked-Account-Provider-Id', { test: 'equal', expected: 'Google'}],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddLinkedAccount') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddLinkedAccount' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddLinkedAccount }],
    ])],
    ['html', [
      { test: 'include', expected: 'New account linked to Firefox' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-linked', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-linked', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-linked', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-linked', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'New account linked to Firefox' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-linked', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password:\n${configUrl('initiatePasswordChangeUrl', 'account-linked', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-linked', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-linked', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'New sign-in to Mock Relier' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'new-device-signin', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password immediately at ${configUrl('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-device-signin', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'new-device-signin', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Password changed successfully' },
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-changed-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-changed-success', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: MESSAGE.unblockCode },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Is this you signing in?' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-unblock', 'privacy')}` },
      { test: 'include', expected: configUrl('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: 'Verify primary email' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-primary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-primary', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Verify primary email' },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome-primary', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome-primary', 'support')}` },
      { test: 'include', expected: `Verify email:\n${configUrl('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyLoginEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Confirm new sign-in to Mock Relier' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyLogin') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyLogin' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyLogin }],
    ])],
    ['html', [
      { test: 'include', expected: 'Confirm new sign-in to Mock Relier' },
      { test: 'include', expected: 'New sign-in to Mock Relier' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-signin', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'New sign-in to Mock Relier' },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-signin', 'privacy')}` },
      { test: 'include', expected: `Confirm sign-in\n${configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifyLoginCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Sign-in code for Mock Relier' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyLoginCode') }],
      ['X-Signin-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyLoginCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyLoginCode }],
    ])],
    ['html', [
      { test: 'include', expected: 'Sign-in code for Mock Relier' },
      { test: 'include', expected: 'Is this you signing in?' },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-signin-verify-code', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-signin-verify-code', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'new-signin-verify-code', 'support')) },
      { test: 'include', expected: MESSAGE.code },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Is this you signing in?' },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'new-signin-verify-code', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-signin-verify-code', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'new-signin-verify-code', 'support')}` },
      { test: 'include', expected: `If yes, here is the verification code:\n${MESSAGE.code}` },
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
      { test: 'include', expected: 'Need to reset your password?' },
      { test: 'include', expected: 'Create new password' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'forgot-password', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'forgot-password', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Need to reset your password?' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'forgot-password', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'forgot-password', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['passwordResetAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Password updated using recovery key' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordResetAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordResetAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordResetAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'Your account password was reset with a recovery key' },
      { test: 'include', expected: decodeUrl(configHref('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-account-recovery-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-account-recovery-success', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Your account password was reset with a recovery key' },
      { test: 'include', expected: configUrl('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid') },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-reset-account-recovery-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-reset-account-recovery-success', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postAddAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account recovery key generated' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'Account recovery key generated' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-generated', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-generated', 'support')) },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Account recovery key generated' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-recovery-generated', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-recovery-generated', 'support')}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postRemoveAccountRecoveryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account recovery key removed' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: 'Account recovery key removed' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-removed', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-removed', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Account recovery key removed' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-recovery-removed', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-recovery-removed', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postRemoveTwoStepAuthenticationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Two-step authentication is off' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: 'Two-step authentication disabled' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-two-step-disabled', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-two-step-disabled', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Two-step authentication disabled' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-two-step-disabled', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-two-step-disabled', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: `You have successfully verified ${MESSAGE.secondaryEmail}` },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-email-verified', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-email-verified', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Secondary email added' },
      { test: 'include', expected: `You have successfully verified ${MESSAGE.secondaryEmail}` },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-email-verified', 'privacy')}` },
      { test: 'notInclude', expected: config.smtp.supportUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postAddTwoStepAuthenticationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Two-step authentication enabled' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: 'You have successfully enabled two-step authentication on your Firefox account from the following device:' },
      { test: 'include', expected: 'Security codes from your authentication app will now be required at each sign-in.' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-two-step-enabled', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-two-step-enabled', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'You have successfully enabled two-step authentication on your Firefox account.' },
      { test: 'include', expected: 'Security codes from your authentication app will now be required at each sign-in.' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-two-step-enabled', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-two-step-enabled', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-email-changed', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-email-changed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postConsumeRecoveryCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Recovery code used' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postConsumeRecoveryCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'postConsumeRecoveryCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postConsumeRecoveryCode }],
    ])],
    ['html', [
      { test: 'include', expected: 'Recovery code consumed' },
      { test: 'include', expected: 'You have successfully consumed a recovery code from the following device:' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-consume-recovery-code', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-consume-recovery-code', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Recovery code consumed' },
      { test: 'include', expected: 'You have successfully consumed a recovery code from the following device:' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-consume-recovery-code', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-consume-recovery-code', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postNewRecoveryCodesEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'New recovery codes generated' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postNewRecoveryCodes') }],
      ['X-Template-Name', { test: 'equal', expected: 'postNewRecoveryCodes' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postNewRecoveryCodes }],
    ])],
    ['html', [
      { test: 'include', expected: 'New recovery codes generated' },
      { test: 'include', expected: 'You have successfully generated new recovery codes' },
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-replace-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-replace-recovery-codes', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'exists', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'New recovery codes generated' },
      { test: 'include', expected: 'You have successfully generated new recovery codes' },
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-replace-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-replace-recovery-codes', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
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
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-change-required', 'privacy')}` },
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
      { test: 'include', expected: MESSAGE.planDownloadURL },
      { test: 'include', expected: MESSAGE.appStoreLink },
      { test: 'include', expected: MESSAGE.playStoreLink },
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'new-subscription', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'new-subscription', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'new-subscription', 'subscription-terms')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'new-subscription', 'subscription-support')) },
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
      { test: 'include', expected: `already downloaded ${MESSAGE.productName}` },
      { test: 'include', expected: `Download ${MESSAGE.productName}` },
      { test: 'include', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: `alt="Download ${MESSAGE.productName} on the App Store"` },
      { test: 'include', expected: `alt="Download ${MESSAGE.productName} on Google Play"` },
      { test: 'include', expected: 'alt="Mozilla logo"' },
      { test: 'notInclude', expected: 'alt="Devices"'},
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: MESSAGE.planDownloadURL },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'new-subscription', 'subscription-privacy') },
      { test: 'include', expected: configUrl('subscriptionSettingsUrl', 'new-subscription', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configUrl('subscriptionTermsUrl', 'new-subscription', 'subscription-terms') },
      { test: 'include', expected: configUrl('subscriptionSupportUrl', 'new-subscription', 'subscription-support') },
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
      { test: 'include', expected: `already downloaded ${MESSAGE.productName}` },
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
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: 'alt="Firefox logo"' },
      { test: 'include', expected: 'alt="Mozilla logo"' },
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
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

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
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Charged: ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: 'Next, you’ll create a Firefox account password to start using your new subscription.' },
      { test: 'notInclude', expected: `alt="${MESSAGE.productName}"` },
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
      { test: 'include', expected: 'Next, you’ll create a Firefox account password to start using your new subscription.' },
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
  ])],

  ['subscriptionCancellationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been cancelled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionCancellation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionCancellation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionCancellation }],
    ])],
    ['html', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-cancellation', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-cancellation', 'subscription-terms')) },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: `alt="${MESSAGE.productName}"`},
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: 'Sorry to see you go' },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

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
      { test: 'include', expected: `We’ve cancelled your ${MESSAGE.productName} subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: 'Your subscription has been cancelled' },
      { test: 'include', expected: `We’ve cancelled your ${MESSAGE.productName} subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],

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
      { test: 'include', expected: `MasterCard card ending in 5309` },
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
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],

  ['subscriptionFirstInvoiceDiscountEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoiceDiscount') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoiceDiscount' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoiceDiscount }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice-discount', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice-discount', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice-discount', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `MasterCard card ending in 5309` },
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
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],
  // Do not display the Payment Method when "showPaymentMethod" is false
  ['subscriptionFirstInvoiceDiscountEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoiceDiscount') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoiceDiscount' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoiceDiscount }],
    ])],
    ['html', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-first-invoice-discount', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice-discount', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-first-invoice-discount', 'subscription-support')) },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View your invoice` },
      { test: 'notInclude', expected: `MasterCard card ending in 5309` },
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
      { test: 'notInclude', expected: `MasterCard card ending in 5309` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]]),
    {updateTemplateValues: x => (
      {...x, showPaymentMethod: false})}
  ],

  ['subscriptionPaymentExpiredEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Credit card for ${MESSAGE.productName} expiring soon` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentExpired') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentExpired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'subscription-payment-expired', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-payment-expired', 'update-billing', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-payment-expired', 'subscription-terms')) },
      { test: 'include', expected: `for ${MESSAGE.productName} is about to expire.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Credit card for ${MESSAGE.productName} expiring soon` },
      { test: 'include', expected: `for ${MESSAGE.productName} is about to expire.` },
      { test: 'include', expected: configUrl('subscriptionPrivacyUrl', 'subscription-payment-expired', 'subscription-privacy') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ]),
    {updateTemplateValues: x => (
      {...x, subscriptions: [{planId: MESSAGE.planId, productId: MESSAGE.productId, ...x.subscriptions[0]}]})}],

  ['subscriptionPaymentExpiredEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Credit card for your subscriptions is expiring soon' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionsPaymentExpired') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionsPaymentExpired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionPrivacyUrl', 'subscriptions-payment-expired', 'subscription-privacy')) },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscriptions-payment-expired', 'update-billing', 'email', 'uid')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscriptions-payment-expired', 'subscription-terms') },
      { test: 'include', expected: 'using to make payments for the following subscriptions is about to expire.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Credit card for your subscriptions is expiring soon' },
      { test: 'include', expected: 'using to make payments for the following subscriptions is about to expire.' },
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
  ])],

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
      { test: 'include', expected: `MasterCard card ending in 5309` },
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
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],

  ['subscriptionSubsequentInvoiceDiscountEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoiceDiscount') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoiceDiscount' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoiceDiscount }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice-discount', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice-discount', 'subscription-terms') },
      { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice-discount', 'subscription-support')) },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `MasterCard card ending in 5309` },
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
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
      { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'include', expected: `View Invoice: ${MESSAGE.invoiceLink}` },
      { test: 'notInclude', expected: 'utm_source=email' },
      { test: 'notInclude', expected: 'PayPal' },
    ]]
  ])],
  ['subscriptionSubsequentInvoiceDiscountEmail', new Map<string, Test | any>([
      ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
      ['headers', new Map([
        ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoiceDiscount') }],
        ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoiceDiscount' }],
        ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoiceDiscount }],
      ])],
      ['html', [
        { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice-discount', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
        { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice-discount', 'subscription-terms') },
        { test: 'include', expected: decodeUrl(configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice-discount', 'subscription-support')) },
        { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
        { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
        { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
        { test: 'include', expected: `Subtotal: ${MESSAGE_FORMATTED.invoiceSubtotal}` },
        { test: 'include', expected: `Discount: -${MESSAGE_FORMATTED.invoiceDiscountAmount}` },
        { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
        { test: 'include', expected: `Next Invoice: 04/19/2020` },
        { test: 'include', expected: `View your invoice` },
        { test: 'notInclude', expected: `MasterCard card ending in 5309` },
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
        { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        { test: 'notInclude', expected: 'utm_source=email' },
        { test: 'notInclude', expected: 'PayPal' },
      ]]
    ]),
    {updateTemplateValues: x => ({...x, showPaymentMethod: false})}
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
      { test: 'include', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `You have upgraded to ${MESSAGE.productNameNew}` },
      { test: 'include', expected: 'Thank you for upgrading!' },
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycleOld} to ${MESSAGE_FORMATTED.paymentAmountNew} per ${MESSAGE.productPaymentCycleNew}.` },
      { test: 'include', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycleOld}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
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
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: 'MasterCard card ending in 5309' },
        ],
      ],
    ]),
  ],
  [
    'subscriptionFirstInvoiceDiscountEmail',
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
              expected: sesMessageTagsHeaderValue(
                'subscriptionFirstInvoiceDiscount'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoiceDiscount' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoiceDiscount,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: 'MasterCard card ending in 5309' },
        ],
      ],
    ]),
  ],
  [
    'subscriptionFirstInvoiceDiscountEmail',
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
              expected: sesMessageTagsHeaderValue(
                'subscriptionFirstInvoiceDiscount'
              ),
            },
          ],
          [
            'X-Template-Name',
            { test: 'equal', expected: 'subscriptionFirstInvoiceDiscount' },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionFirstInvoiceDiscount,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'notInclude', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'notInclude', expected: `PayPal` },
          { test: 'notInclude', expected: 'MasterCard card ending in 5309' },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, showPaymentMethod: false }) },
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
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
    ]),
  ],
  [
    'subscriptionSubsequentInvoiceDiscountEmail',
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
                'subscriptionSubsequentInvoiceDiscount'
              ),
            },
          ],
          [
            'X-Template-Name',
            {
              test: 'equal',
              expected: 'subscriptionSubsequentInvoiceDiscount',
            },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoiceDiscount,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'include', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
    ]),
  ],
  [
    'subscriptionSubsequentInvoiceDiscountEmail',
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
                'subscriptionSubsequentInvoiceDiscount'
              ),
            },
          ],
          [
            'X-Template-Name',
            {
              test: 'equal',
              expected: 'subscriptionSubsequentInvoiceDiscount',
            },
          ],
          [
            'X-Template-Version',
            {
              test: 'equal',
              expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoiceDiscount,
            },
          ],
        ]),
      ],
      [
        'html',
        [
          { test: 'notInclude', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
      [
        'text',
        [
          { test: 'notInclude', expected: `PayPal` },
          { test: 'notInclude', expected: `MasterCard card ending in 5309` },
        ],
      ],
    ]),
    { updateTemplateValues: (x) => ({ ...x, showPaymentMethod: false }) },
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

  it('formats user-agent strings sanely', () => {
    let result = mailer._formatUserAgentInfo({
      uaBrowser: 'Firefox',
      uaBrowserVersion: '70',
      uaOS: 'Windows',
      uaOSVersion: '10',
    });
    assert.equal(result, 'Firefox on Windows 10');

    result = mailer._formatUserAgentInfo({
      uaBrowserVersion: '70',
      uaOS: 'Windows',
      uaOSVersion: '10',
    });
    assert.equal(result, 'Windows 10');

    result = mailer._formatUserAgentInfo({
      uaBrowser: 'Firefox',
      uaBrowserVersion: '70',
      uaOS: 'Windows',
    });
    assert.equal(result, 'Firefox on Windows');

    result = mailer._formatUserAgentInfo({
      uaBrowser: 'Firefox',
      uaBrowserVersion: '70',
      uaOSVersion: '10',
    });
    assert.equal(result, 'Firefox');

    result = mailer._formatUserAgentInfo({
      uaBrowser: 'Firefox',
      uaBrowserVersion: '70',
    });
    assert.equal(result, 'Firefox');

    result = mailer._formatUserAgentInfo({ uaOS: 'Windows' });
    assert.equal(result, 'Windows');

    result = mailer._formatUserAgentInfo({});
    assert.equal(result, '');

    result = mailer._formatUserAgentInfo({
      uaBrowser: '<a>Firefox</a>',
      uaBrowserVersion: '70',
      uaOS: 'Windows',
      uaOSVersion: '10',
    });
    assert.equal(result, 'Windows 10');

    result = mailer._formatUserAgentInfo({
      uaBrowser: 'Firefox',
      uaBrowserVersion: '70',
      uaOS: 'http://example.com/',
      uaOSVersion: '10',
    });
    assert.equal(result, 'Firefox');

    result = mailer._formatUserAgentInfo({
      uaBrowser: 'Firefox',
      uaBrowserVersion: '70',
      uaOS: 'Windows',
      uaOSVersion: 'dodgy-looking',
    });
    assert.equal(result, 'Firefox on Windows');
  });

  it('formats location strings sanely', () => {
    const localMessage = {
      ...MESSAGE,
      location: {
        city: 'Bournemouth',
        state: 'England',
        stateCode: 'EN',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
    };
    assert.equal(
      mailer._constructLocationString(localMessage),
      'Bournemouth, EN, United Kingdom (estimated)'
    );

    localMessage.location.stateCode = null;
    assert.equal(
      mailer._constructLocationString(localMessage),
      'Bournemouth, United Kingdom (estimated)'
    );

    localMessage.location.city = null;
    localMessage.location.stateCode = 'EN';
    assert.equal(
      mailer._constructLocationString(localMessage),
      'EN, United Kingdom (estimated)'
    );

    localMessage.location.stateCode = null;
    assert.equal(
      mailer._constructLocationString(localMessage),
      'United Kingdom (estimated)'
    );

    localMessage.location = null;
    assert.equal(mailer._constructLocationString(localMessage), '');
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
    it('returns date/time based on given values', () => {
      const message = {
        timeZone: 'America/Los_Angeles',
        acceptLanguage: 'en',
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
        acceptLanguage: 'en',
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
        acceptLanguage: 'en',
      };

      const result = mailer._constructLocalTimeString(
        message.timeZone,
        message.acceptLanguage
      );
      assert.include(result[0], 'CET');
    });

    it('returns date/time in Spanish', () => {
      const message = {
        timeZone: 'America/Los_Angeles',
        acceptLanguage: 'es',
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
      value || MESSAGE[MESSAGE_PARAMS!.get(key)! as keyof typeof MESSAGE] || ''
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
  locale: string = 'en',
  sender: any = null
) {
  const translator = await Promise.resolve(
    require(`${ROOT_DIR}/lib/senders/translator`)([locale], locale)
  );
  const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, mocks)(
    log,
    config,
    {
      check: () => Promise.resolve(),
    }
  );
  return new Mailer(translator, config.smtp, sender);
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
        /* @ts-ignore */
        assert[test](target, expected, `${type}: ${property}`);
      });
    });
  });
}
