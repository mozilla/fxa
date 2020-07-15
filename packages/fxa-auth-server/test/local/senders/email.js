/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const mocks = require('../../mocks');
const P = require('bluebird');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { URL } = require('url');

const config = require(`${ROOT_DIR}/config`).getProperties();
if (!config.smtp.prependVerificationSubdomain.enabled) {
  config.smtp.prependVerificationSubdomain.enabled = true;
}
if (!config.smtp.sesConfigurationSet) {
  config.smtp.sesConfigurationSet = 'ses-config';
}
config.smtp.subscriptionTermsUrl = 'http://example.com/terms';

// Force enable the subscription transactional emails
config.subscriptions.transactionalEmails.enabled = true;

const TEMPLATE_VERSIONS = require(`${ROOT_DIR}/lib/senders/templates/_versions.json`);

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
  productId: 'wibble',
  planId: 'plan-example',
  productName: 'Firefox Fortress',
  planEmailIconURL: 'http://example.com/icon.jpg',
  planDownloadURL: 'http://getfirefox.com/',
  playStoreLink: 'https://example.com/play-store',
  invoiceNumber: '8675309',
  cardType: 'mastercard',
  lastFour: '5309',
  invoiceDate: new Date(1584747098816),
  nextInvoiceDate: new Date(1587339098816),
  serviceLastActiveDate: new Date(1587339098816),
  productIconURLNew: 'http://placekitten.com/512/512?image=1',
  productIconURLOld: 'http://placekitten.com/512/512?image=1',
  productNameOld: 'Product A',
  productNameNew: 'Product B',
  invoiceTotalInCents: 999999.9,
  invoiceTotalCurrency: 'eur',
  paymentAmountOldInCents: 9999099.9,
  paymentAmountOldCurrency: 'jpy',
  paymentAmountNewInCents: 12312099.9,
  paymentAmountNewCurrency: 'gbp',
  paymentProratedInCents: 523099.9,
  paymentProratedCurrency: 'usd',
  productPaymentCycle: 'month',
  productMetadata,
  service: 'sync',
  timeZone: 'America/Los_Angeles',
  tokenCode: 'abc123',
  type: 'secondary',
  uaBrowser: 'Firefox',
  uaBrowserVersion: '70.0a1',
  uaOS: 'Windows',
  uaOSVersion: '10',
  uid: 'uid',
  unblockCode: 'AS6334PK',
};

const MESSAGE_FORMATTED = {
  // Note: Intl.NumberFormat rounds 1/10 cent up
  invoiceTotal: '€10,000.00',
  paymentAmountOld: '¥99,991',
  paymentAmountNew: '£123,121.00',
  paymentProrated: '$5,231.00',
};

// key = query param name, value = MESSAGE property name
const MESSAGE_PARAMS = new Map([
  ['code', 'code'],
  ['email', 'email'],
  ['primary_email_verified', 'email'],
  ['product_id', 'productId'],
  ['plan_id', 'planId'],
  ['secondary_email_verified', 'email'],
  ['service', 'service'],
  ['uid', 'uid'],
  ['unblockCode', 'unblockCode'],
]);

const COMMON_TESTS = new Map([
  ['from', { test: 'equal', expected: config.smtp.sender }],
  ['sender', { test: 'equal', expected: config.smtp.sender }],
  [
    'headers',
    new Map([
      ['X-Device-Id', { test: 'equal', expected: MESSAGE.deviceId }],
      ['X-Email-Service', { test: 'equal', expected: 'fxa-auth-server' }],
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

// prettier-ignore
const TESTS = new Map([
  ['verifySecondaryCodeEmail', new Map([
    ['subject', { test: 'equal', expected: 'Confirm secondary email' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifySecondaryCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifySecondaryCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifySecondaryCode }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'welcome-secondary', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'welcome-secondary', 'support') },
      { test: 'include', expected: 'Verify secondary email' },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account:` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'Use this verification code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once verified, this address will begin receiving security notifications and confirmations.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('privacyUrl', 'welcome-secondary', 'privacy') },
      { test: 'include', expected: configUrl('supportUrl', 'welcome-secondary', 'support') },
      { test: 'include', expected: 'Verify secondary email' },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account:` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'Use this verification code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once verified, this address will begin receiving security notifications and confirmations.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['downloadSubscriptionEmail', new Map([
    ['subject', { test: 'equal', expected: `Welcome to ${MESSAGE.productName}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('downloadSubscription') }],
      ['X-Template-Name', { test: 'equal', expected: 'downloadSubscription' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.downloadSubscription }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'new-subscription', 'subscription-privacy') },
      { test: 'include', expected: MESSAGE.planDownloadURL },
      { test: 'include', expected: MESSAGE.appStoreLink },
      { test: 'include', expected: MESSAGE.playStoreLink },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'new-subscription', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'new-subscription', 'subscription-terms') },
      { test: 'include', expected: configHref('subscriptionSupportUrl', 'new-subscription', 'subscription-support') },
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
      { test: 'include', expected: `already downloaded ${MESSAGE.productName}` },
      { test: 'include', expected: `>Download ${MESSAGE.productName}</a>` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Privacy notice:\n${configUrl('subscriptionPrivacyUrl', 'new-subscription', 'subscription-privacy')}` },
      { test: 'include', expected: MESSAGE.planDownloadURL },
      { test: 'include', expected: configUrl('subscriptionSettingsUrl', 'new-subscription', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configUrl('subscriptionTermsUrl', 'new-subscription', 'subscription-terms') },
      { test: 'include', expected: configUrl('subscriptionSupportUrl', 'new-subscription', 'subscription-support') },
      { test: 'include', expected: `Welcome to ${MESSAGE.productName}` },
      { test: 'include', expected: `already downloaded ${MESSAGE.productName}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['subscriptionFirstInvoiceEmail', new Map([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment confirmed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionFirstInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionFirstInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionFirstInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-first-invoice', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-first-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-first-invoice', 'subscription-terms') },
      { test: 'include', expected: configHref('subscriptionSupportUrl', 'subscription-first-invoice', 'subscription-support') },
      { test: 'include', expected: `Thank you for subscribing to ${MESSAGE.productName}!` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment confirmed` },
      { test: 'include', expected: `start using ${MESSAGE.productName}` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionSubsequentInvoiceEmail', new Map([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment received` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionSubsequentInvoice') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionSubsequentInvoice' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionSubsequentInvoice }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-subsequent-invoice', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-subsequent-invoice', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-subsequent-invoice', 'subscription-terms') },
      { test: 'include', expected: configHref('subscriptionSupportUrl', 'subscription-subsequent-invoice', 'subscription-support') },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: <b>${MESSAGE.invoiceNumber}</b>` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `${MESSAGE.productName} payment received` },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `Invoice Number: ${MESSAGE.invoiceNumber}` },
      { test: 'include', expected: `Plan change: ${MESSAGE_FORMATTED.paymentProrated}` },
      { test: 'include', expected: `MasterCard card ending in 5309` },
      { test: 'include', expected: `Charged ${MESSAGE_FORMATTED.invoiceTotal} on 03/20/2020` },
      { test: 'include', expected: `Next Invoice: 04/19/2020` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionCancellationEmail', new Map([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been cancelled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionCancellation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionCancellation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionCancellation }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-cancellation', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-cancellation', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-cancellation', 'subscription-terms') },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'include', expected: `billing period, which is 04/19/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionReactivationEmail', new Map([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} subscription reactivated` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionReactivation') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionReactivation' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionReactivation }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-reactivation', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-reactivation', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-reactivation', 'subscription-terms') },
      { test: 'include', expected: `reactivating your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `be ${MESSAGE_FORMATTED.invoiceTotal} to the MasterCard card ending in ${MESSAGE.lastFour} on 04/19/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `reactivating your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `be ${MESSAGE_FORMATTED.invoiceTotal} to the MasterCard card ending in ${MESSAGE.lastFour} on 04/19/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionAccountDeletionEmail', new Map([
    ['subject', { test: 'equal', expected: `Your ${MESSAGE.productName} subscription has been cancelled` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionAccountDeletion') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionAccountDeletion' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionAccountDeletion }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-account-deletion', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-account-deletion', 'reactivate-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-account-deletion', 'subscription-terms') },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Your ${MESSAGE.productName} subscription has been cancelled` },
      { test: 'include', expected: `cancelled your ${MESSAGE.productName} subscription` },
      { test: 'include', expected: `final payment of ${MESSAGE_FORMATTED.invoiceTotal} was paid on 03/20/2020.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionPaymentFailedEmail', new Map([
    ['subject', { test: 'equal', expected: `${MESSAGE.productName} payment failed` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentFailed') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentFailed' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentFailed }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-payment-failed', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-payment-failed', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-payment-failed', 'subscription-terms') },
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `you’ll lose access to ${MESSAGE.productName}.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `latest payment for ${MESSAGE.productName}.` },
      { test: 'include', expected: `you’ll lose access to ${MESSAGE.productName}.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionPaymentExpiredEmail', new Map([
    ['subject', { test: 'equal', expected: `Credit card for ${MESSAGE.productName} expiring soon` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentExpired') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentExpired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-payment-expired', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-payment-expired', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-payment-expired', 'subscription-terms') },
      { test: 'include', expected: `for ${MESSAGE.productName} is about to expire.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `for ${MESSAGE.productName} is about to expire.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionUpgradeEmail', new Map([
    ['subject', { test: 'equal', expected: `You have upgraded to ${MESSAGE.productNameNew}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionUpgrade') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionUpgrade' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionUpgrade }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-upgrade', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-upgrade', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-upgrade', 'subscription-terms') },
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycle} to ${MESSAGE_FORMATTED.paymentAmountNew}.` },
      { test: 'include', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycle}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycle} to ${MESSAGE_FORMATTED.paymentAmountNew}.` },
      { test: 'include', expected: `one-time fee of ${MESSAGE_FORMATTED.paymentProrated} to reflect the higher charge for the remainder of this ${MESSAGE.productPaymentCycle}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['subscriptionDowngradeEmail', new Map([
    ['subject', { test: 'equal', expected: `You have switched to ${MESSAGE.productNameNew}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionDowngrade') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionDowngrade' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionDowngrade }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('subscriptionPrivacyUrl', 'subscription-downgrade', 'subscription-privacy') },
      { test: 'include', expected: configHref('subscriptionSettingsUrl', 'subscription-downgrade', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email') },
      { test: 'include', expected: configHref('subscriptionTermsUrl', 'subscription-downgrade', 'subscription-terms') },
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycle} to ${MESSAGE_FORMATTED.paymentAmountNew}.` },
      { test: 'include', expected: `one-time credit of ${MESSAGE_FORMATTED.paymentProrated} to reflect the lower charge for the remainder of this ${MESSAGE.productPaymentCycle}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `from ${MESSAGE.productNameOld} to ${MESSAGE.productNameNew}.` },
      { test: 'include', expected: `from ${MESSAGE_FORMATTED.paymentAmountOld} per ${MESSAGE.productPaymentCycle} to ${MESSAGE_FORMATTED.paymentAmountNew}.` },
      { test: 'include', expected: `one-time credit of ${MESSAGE_FORMATTED.paymentProrated} to reflect the lower charge for the remainder of this ${MESSAGE.productPaymentCycle}.` },
      { test: 'include', expected: `to use ${MESSAGE.productNameNew},` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
  ['lowRecoveryCodesEmail', new Map([
    ['subject', { test: 'equal', expected: '2 recovery codes remaining' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('lowRecoveryCodes') }],
      ['X-Template-Name', { test: 'equal', expected: 'lowRecoveryCodes' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.lowRecoveryCodes }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid') },
      { test: 'include', expected: configHref('privacyUrl', 'low-recovery-codes', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'low-recovery-codes', 'support') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Generate codes:\n${configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'low-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'low-recovery-codes', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['newDeviceLoginEmail', new Map([
    ['subject', { test: 'equal', expected: 'New sign-in to Mock Relier' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('newDeviceLogin') }],
      ['X-Template-Name', { test: 'equal', expected: 'newDeviceLogin' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.newDeviceLogin }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'new-device-signin', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'new-device-signin', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'new-device-signin', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'new-device-signin', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `change your password immediately at ${configUrl('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-device-signin', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'new-device-signin', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['passwordChangedEmail', new Map([
    ['subject', { test: 'equal', expected: 'Password updated' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordChanged') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordChanged' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordChanged }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: configHref('privacyUrl', 'password-changed-success', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'password-changed-success', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-changed-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-changed-success', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['passwordChangeRequiredEmail', new Map([
    ['subject', { test: 'equal', expected: 'Suspicious activity detected' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordChangeRequired') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordChangeRequired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordChangeRequired }],
    ])],
    ['html', [
      { test: 'include', expected: 'change your password as a precaution' },
      { test: 'include', expected: configHref('privacyUrl', 'password-change-required', 'privacy') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'change your password as a precaution' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-change-required', 'privacy')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['passwordResetAccountRecoveryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Password updated using recovery key' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordResetAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordResetAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordResetAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'password-reset-account-recovery-success', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'password-reset-account-recovery-success', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid') },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-reset-account-recovery-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-reset-account-recovery-success', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['passwordResetEmail', new Map([
    ['subject', { test: 'equal', expected: 'Password updated' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordReset') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordReset' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordReset }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: configHref('privacyUrl', 'password-reset-success', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'password-reset-success', 'support') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-reset-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-reset-success', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['passwordResetRequiredEmail', new Map([
    ['subject', { test: 'equal', expected: 'Suspicious activity detected' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('initiatePasswordResetUrl', 'password-reset-required', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordResetRequired') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordResetRequired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordResetRequired }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('initiatePasswordResetUrl', 'password-reset-required', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: configHref('passwordManagerInfoUrl', 'password-reset-required', 'password-info') },
      { test: 'include', expected: configHref('privacyUrl', 'password-reset-required', 'privacy') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-reset-required', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Learn how to see what passwords Firefox is storing for you.\n${configUrl('passwordManagerInfoUrl', 'password-reset-required', 'password-info')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-reset-required', 'privacy')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postAddAccountRecoveryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Account recovery key generated' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-recovery-generated', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-recovery-generated', 'support') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-recovery-generated', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-recovery-generated', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postAddTwoStepAuthenticationEmail', new Map([
    ['subject', { test: 'equal', expected: 'Two-step verification enabled' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-two-step-enabled', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-two-step-enabled', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-two-step-enabled', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-two-step-enabled', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postChangePrimaryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Primary email updated' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postChangePrimary') }],
      ['X-Template-Name', { test: 'equal', expected: 'postChangePrimary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postChangePrimary }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-email-changed', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-email-changed', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-email-changed', 'support') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-email-changed', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-email-changed', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-email-changed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postConsumeRecoveryCodeEmail', new Map([
    ['subject', { test: 'equal', expected: 'Recovery code used' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postConsumeRecoveryCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'postConsumeRecoveryCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postConsumeRecoveryCode }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-consume-recovery-code', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-consume-recovery-code', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-consume-recovery-code', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-consume-recovery-code', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postNewRecoveryCodesEmail', new Map([
    ['subject', { test: 'equal', expected: 'New recovery codes generated' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postNewRecoveryCodes') }],
      ['X-Template-Name', { test: 'equal', expected: 'postNewRecoveryCodes' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postNewRecoveryCodes }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-replace-recovery-codes', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-replace-recovery-codes', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-replace-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-replace-recovery-codes', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postRemoveAccountRecoveryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Account recovery key removed' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveAccountRecovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveAccountRecovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveAccountRecovery }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-recovery-removed', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-recovery-removed', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-recovery-removed', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-recovery-removed', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postRemoveSecondaryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Secondary email removed' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-email-removed', 'account-email-removed', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveSecondary') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveSecondary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveSecondary }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-email-removed', 'account-email-removed', 'email', 'uid') },
      { test: 'include', expected: configHref('privacyUrl', 'account-email-removed', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-email-removed', 'support') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-removed', 'account-email-removed', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-email-removed', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-email-removed', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postRemoveTwoStepAuthenticationEmail', new Map([
    ['subject', { test: 'equal', expected: 'Two-step verification is off' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-two-step-disabled', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-two-step-disabled', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-two-step-disabled', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-two-step-disabled', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postVerifyEmail', new Map([
    ['subject', { test: 'equal', expected: 'Account verified. Next, sync another device to finish setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'account-verified', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postVerify') }],
      ['X-Template-Name', { test: 'equal', expected: 'postVerify' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postVerify }],
    ])],
    ['html', [
      { test: 'include', expected: 'Firefox Account verified. You&#x27;re almost there.' },
      { test: 'include', expected: 'Next sync between your devices!' },
      { test: 'include', expected: 'Sync privately keeps your bookmarks, passwords and other Firefox data the same across all your devices.' },
      { test: 'include', expected: configHref('syncUrl', 'account-verified', 'connect-device') },
      { test: 'include', expected: config.smtp.androidUrl },
      { test: 'include', expected: config.smtp.iosUrl },
      { test: 'include', expected: 'another desktop device' },
      { test: 'include', expected: configHref('privacyUrl', 'account-verified', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-verified', 'support') },
      { test: 'include', expected: config.smtp.firefoxDesktopUrl },
    ]],
    ['text', [
      { test: 'include', expected: 'Firefox Account verified. You\'re almost there.' },
      { test: 'include', expected: 'Next sync between your devices!' },
      { test: 'include', expected: 'Sync privately keeps your bookmarks, passwords and other Firefox data the same across all your devices.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-verified', 'privacy')}` },
      { test: 'include', expected: `Have questions? Visit ${configUrl('supportUrl', 'account-verified', 'support')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['postVerifySecondaryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Secondary email added' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postVerifySecondary') }],
      ['X-Template-Name', { test: 'equal', expected: 'postVerifySecondary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postVerifySecondary }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid') },
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'account-email-verified', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'account-email-verified', 'support') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-email-verified', 'privacy')}` },
      { test: 'notInclude', expected: config.smtp.supportUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['recoveryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Reset your password' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('recovery') }],
      ['X-Template-Name', { test: 'equal', expected: 'recovery' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.recovery }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'forgot-password', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'forgot-password', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'forgot-password', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'forgot-password', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['unblockCodeEmail', new Map([
    ['subject', { test: 'equal', expected: 'Account authorization code' }],
    ['headers', new Map([
      ['X-Report-SignIn-Link', { test: 'equal', expected: configUrl('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('unblockCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'unblockCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.unblockCode }],
      ['X-Unblock-Code', { test: 'equal', expected: MESSAGE.unblockCode }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'new-unblock', 'privacy') },
      { test: 'include', expected: configHref('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: MESSAGE.unblockCode },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-unblock', 'privacy')}` },
      { test: 'include', expected: configUrl('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `If yes, here is the authorization code you need: ${MESSAGE.unblockCode}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verificationReminderFirstEmail', new Map([
    ['subject', { test: 'equal', expected: 'Reminder: Finish creating your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verificationReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'verificationReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verificationReminderFirst }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'first-verification-reminder', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'first-verification-reminder', 'support') },
      { test: 'include', expected: configHref('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'first-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'first-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verificationReminderSecondEmail', new Map([
    ['subject', { test: 'equal', expected: 'Final reminder: Activate your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verificationReminderSecond') }],
      ['X-Template-Name', { test: 'equal', expected: 'verificationReminderSecond' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verificationReminderSecond }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'second-verification-reminder', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'second-verification-reminder', 'support') },
      { test: 'include', expected: configHref('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid') },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'second-verification-reminder', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'second-verification-reminder', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verificationUrl', 'second-verification-reminder', 'confirm-email', 'code', 'reminder=second', 'uid')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifyEmail', new Map([
    ['subject', { test: 'equal', expected: 'Finish creating your account' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verify') }],
      ['X-Template-Name', { test: 'equal', expected: 'verify' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verify }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: 'Confirm your account and get the most out of Firefox everywhere you sign in starting with:' },
      { test: 'include', expected: configHref('privacyUrl', 'welcome', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'welcome', 'support') },
      { test: 'include', expected: configHref('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'Confirm your account and get the most out of Firefox everywhere you sign in.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `Confirm email:\n${configUrl('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifyLoginCodeEmail', new Map([
    ['subject', { test: 'equal', expected: 'Sign-in code for Mock Relier' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyLoginCode') }],
      ['X-Signin-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyLoginCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyLoginCode }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'new-signin-verify-code', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'new-signin-verify-code', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'new-signin-verify-code', 'support') },
      { test: 'include', expected: MESSAGE.code },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'new-signin-verify-code', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-signin-verify-code', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'new-signin-verify-code', 'support')}` },
      { test: 'include', expected: `If yes, here is the verification code: ${MESSAGE.code}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifyLoginEmail', new Map([
    ['subject', { test: 'equal', expected: 'Confirm new sign-in to Mock Relier' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyLogin') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyLogin' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyLogin }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'new-signin', 'privacy') },
      { test: 'include', expected: configHref('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-signin', 'privacy')}` },
      { test: 'include', expected: `Confirm sign-in\n${configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifyPrimaryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Confirm primary email' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifyPrimary') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyPrimary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyPrimary }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email') },
      { test: 'include', expected: configHref('privacyUrl', 'welcome-primary', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'welcome-primary', 'support') },
      { test: 'include', expected: configHref('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome-primary', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome-primary', 'support')}` },
      { test: 'include', expected: `Verify email: \n${configUrl('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifySecondaryEmail', new Map([
    ['subject', { test: 'equal', expected: 'Confirm secondary email' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifySecondaryEmailUrl', 'welcome-secondary', 'activate', 'code', 'uid', 'type=secondary', 'secondary_email_verified', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifySecondary') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifySecondary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifySecondary }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'welcome-secondary', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'welcome-secondary', 'support') },
      { test: 'include', expected: configHref('verifySecondaryEmailUrl', 'welcome-secondary', 'activate', 'code', 'uid', 'type=secondary', 'secondary_email_verified', 'service') },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: MESSAGE.primaryEmail },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome-secondary', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome-secondary', 'support')}` },
      { test: 'include', expected: `Verify email: \n${configUrl('verifySecondaryEmailUrl', 'welcome-secondary', 'activate', 'code', 'uid', 'type=secondary', 'secondary_email_verified', 'service')}` },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: MESSAGE.primaryEmail },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['verifyShortCodeEmail', new Map([
    ['subject', { test: 'equal', expected: `Verification code: ${MESSAGE.code}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verify') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyShortCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyShortCode }],
      ['X-Verify-Short-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: configHref('privacyUrl', 'welcome', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'welcome', 'support') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'If yes, use this verification code:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `If yes, use this verification code:\n${MESSAGE.code}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['cadReminderFirstEmail', new Map([
    ['subject', { test: 'equal', expected: 'Your Friendly Reminder: How To Complete Your Sync Setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'cad-reminder-first', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('cadReminderFirst') }],
      ['X-Template-Name', { test: 'equal', expected: 'cadReminderFirst' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.cadReminderFirst }],
    ])],
    ['html', [
      { test: 'include', expected: "Here&#x27;s your reminder to sync devices." },
      { test: 'include', expected: 'It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: configHref('syncUrl', 'cad-reminder-first', 'connect-device') },
      { test: 'include', expected: config.smtp.androidUrl },
      { test: 'include', expected: config.smtp.iosUrl },
      { test: 'include', expected: 'another device' },
      { test: 'include', expected: configHref('privacyUrl', 'cad-reminder-first', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'cad-reminder-first', 'support') },
      { test: 'notInclude', expected: config.smtp.firefoxDesktopUrl },
    ]],
    ['text', [
      { test: 'include', expected: "Here's your reminder to sync devices." },
      { test: 'include', expected: 'It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'cad-reminder-first', 'privacy')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
  ['cadReminderSecondEmail', new Map([
    ['subject', { test: 'equal', expected: 'Final Reminder: Complete Sync Setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'cad-reminder-second', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('cadReminderSecond') }],
      ['X-Template-Name', { test: 'equal', expected: 'cadReminderSecond' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.cadReminderSecond }],
    ])],
    ['html', [
      { test: 'include', expected: "Last reminder to sync devices!" },
      { test: 'include', expected: 'Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: configHref('syncUrl', 'cad-reminder-second', 'connect-device') },
      { test: 'include', expected: config.smtp.androidUrl },
      { test: 'include', expected: config.smtp.iosUrl },
      { test: 'include', expected: configHref('privacyUrl', 'cad-reminder-second', 'privacy') },
      { test: 'include', expected: configHref('supportUrl', 'cad-reminder-second', 'support') },
    ]],
    ['text', [
      { test: 'include', expected: "Last reminder to sync devices!" },
      { test: 'include', expected: 'Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'cad-reminder-second', 'privacy')}` },
      { test: 'include', expected: config.smtp.syncUrl },
      { test: 'notInclude', expected: config.smtp.androidUrl },
      { test: 'notInclude', expected: config.smtp.iosUrl },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],
]);

describe('lib/senders/email:', () => {
  let mockLog, mailer, localize, selectEmailServices, sendMail;

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
    selectEmailServices = mailer.selectEmailServices;
    sendMail = {
      mailer: mailer.mailer.sendMail,
      emailService: mailer.emailService.sendMail,
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
    if (mailer.selectEmailServices !== selectEmailServices) {
      mailer.selectEmailServices = selectEmailServices;
    }
    if (mailer.mailer.sendMail !== sendMail.mailer) {
      mailer.mailer.sendMail = sendMail.mailer;
    }
    if (mailer.emailService.sendMail !== sendMail.emailService) {
      mailer.emailService.sendMail = sendMail.emailService;
    }
  });

  it('mailer and emailService are not mocked', () => {
    assert.isObject(mailer.mailer);
    assert.isFunction(mailer.mailer.sendMail);
    assert.isObject(mailer.emailService);
    assert.isFunction(mailer.emailService.sendMail);
    assert.notEqual(mailer.mailer, mailer.emailService);
  });

  for (const [type, test] of TESTS) {
    it(`declarative test for ${type}`, async () => {
      mailer.mailer.sendMail = stubSendMail((message) => {
        COMMON_TESTS.forEach((assertions, property) => {
          applyAssertions(type, message, property, assertions);
        });

        test.forEach((assertions, property) => {
          applyAssertions(type, message, property, assertions);
        });
      });

      await mailer[type](MESSAGE);
    });
  }

  it('formats currency strings sanely', () => {
    const result = mailer._getLocalizedCurrencyString(
      123,
      'USD',
      'en-US;q=0.5,en;q=0.3,en-NZ'
    )
    assert.equal(result, 'US$1.23')
  })

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

  describe('mock sendMail method:', () => {
    beforeEach(() => {
      mailer.localize = () => ({ language: 'en' });
      sinon.stub(mailer.mailer, 'sendMail').callsFake((config, cb) => {
        cb(null, { resp: 'ok' });
      });
    });

    it('resolves sendMail status', () => {
      const message = {
        email: 'test@restmail.net',
        subject: 'subject',
        template: 'verifyLogin',
        uid: 'foo',
      };

      return mailer.send(message).then((status) => {
        assert.deepEqual(status, [{ resp: 'ok' }]);
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
        assert.equal(mockLog.info.callCount, 3);
        const emailEventLog = mockLog.info.getCalls()[2];
        assert.equal(emailEventLog.args[0], 'emailEvent');
        assert.equal(emailEventLog.args[1].domain, 'other');
        assert.equal(emailEventLog.args[1].flow_id, 'wibble');
        assert.equal(emailEventLog.args[1].template, 'verifyLogin');
        assert.equal(emailEventLog.args[1].type, 'sent');
        assert.equal(emailEventLog.args[1].locale, 'en');
        const mailerSend1 = mockLog.info.getCalls()[1];
        assert.equal(mailerSend1.args[0], 'mailer.send.1');
        assert.equal(mailerSend1.args[1].to, message.email);
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

  describe('sends request to the right mailer', () => {
    beforeEach(() => {
      sinon.stub(mailer.mailer, 'sendMail').callsFake((config, cb) => {
        cb(null, { resp: 'whatevs' });
      });
      sinon.stub(mailer.emailService, 'sendMail').callsFake((config, cb) => {
        cb(null, { resp: 'whatevs' });
      });
    });

    it('sends request to fxa-email-service when the email pattern is right', () => {
      const message = {
        email: 'emailservice.foo@restmail.net',
        subject: 'subject',
        template: 'verifyLogin',
        templateValues: {
          action: 'action',
          clientName: 'clientName',
          device: 'device',
          email: 'emailservice.foo@restmail.net',
          ip: 'ip',
          link: 'link',
          location: 'location',
          oneClickLink: 'oneClickLink',
          passwordChangeLink: 'passwordChangeLink',
          passwordChangeLinkAttributes: 'passwordChangeLinkAttributes',
          privacyUrl: 'privacyUrl',
          subject: 'subject',
          supportLinkAttributes: 'supportLinkAttributes',
          supportUrl: 'supportUrl',
          timestamp: 'timestamp',
        },
        uid: 'foo',
      };
      mailer.sesConfigurationSet = 'wibble';

      return mailer.send(message).then((response) => {
        assert(mailer.emailService.sendMail.calledOnce);
        assert(!mailer.mailer.sendMail.called);

        const args = mailer.emailService.sendMail.args[0];

        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'emailservice.foo@restmail.net');
        assert.equal(args[0].subject, 'subject');
        assert.equal(args[0].provider, 'ses');

        const headers = args[0].headers;

        assert.equal(headers['X-Template-Name'], 'verifyLogin');
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'ses');
        assert.equal(headers['X-Uid'], 'foo');

        const expectedSesMessageTags = sesMessageTagsHeaderValue(
          message.template,
          'fxa-email-service'
        );
        assert.equal(headers['X-SES-MESSAGE-TAGS'], expectedSesMessageTags);
        assert.equal(headers['X-SES-CONFIGURATION-SET'], 'wibble');

        assert.equal(typeof args[1], 'function');
      });
    });

    it("doesn't send request to fxa-email-service when the email pattern is not right", () => {
      const message = {
        email: 'foo@restmail.net',
        subject: 'subject',
        template: 'verifyLogin',
        templateValues: {
          action: 'action',
          clientName: 'clientName',
          device: 'device',
          email: 'emailservice.foo@restmail.net',
          ip: 'ip',
          link: 'link',
          location: 'location',
          oneClickLink: 'oneClickLink',
          passwordChangeLink: 'passwordChangeLink',
          passwordChangeLinkAttributes: 'passwordChangeLinkAttributes',
          privacyUrl: 'privacyUrl',
          subject: 'subject',
          supportLinkAttributes: 'supportLinkAttributes',
          supportUrl: 'supportUrl',
          timestamp: 'timestamp',
        },
        uid: 'foo',
      };

      return mailer.send(message).then((response) => {
        assert(!mailer.emailService.sendMail.called);
        assert(mailer.mailer.sendMail.calledOnce);
        const args = mailer.mailer.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@restmail.net');
        assert.equal(args[0].subject, 'subject');
        assert.equal(args[0].headers['X-Template-Name'], 'verifyLogin');
        assert.equal(args[0].headers['X-Uid'], 'foo');
        assert.equal(args[0].provider, undefined);
        assert.equal(typeof mailer.mailer.sendMail.args[0][1], 'function');
      });
    });

    it('sends request to fxa-email-service when selectEmailServices tells it to', () => {
      const message = {
        email: 'foo@example.com',
        subject: 'subject',
        template: 'verifyLogin',
        templateValues: {
          action: 'action',
          clientName: 'clientName',
          device: 'device',
          email: 'emailservice.foo@restmail.net',
          ip: 'ip',
          link: 'link',
          location: 'location',
          oneClickLink: 'oneClickLink',
          passwordChangeLink: 'passwordChangeLink',
          passwordChangeLinkAttributes: 'passwordChangeLinkAttributes',
          privacyUrl: 'privacyUrl',
          subject: 'subject',
          supportLinkAttributes: 'supportLinkAttributes',
          supportUrl: 'supportUrl',
          timestamp: 'timestamp',
        },
      };
      mailer.selectEmailServices = sinon.spy(() =>
        P.resolve([
          {
            emailAddresses: [message.email],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
            mailer: mailer.emailService,
          },
        ])
      );

      return mailer.send(message).then(() => {
        assert.equal(mailer.selectEmailServices.callCount, 1);

        let args = mailer.selectEmailServices.args[0];
        assert.equal(args.length, 1);
        assert.equal(args[0], message);

        assert.equal(mailer.emailService.sendMail.callCount, 1);
        assert.equal(mailer.mailer.sendMail.callCount, 0);

        args = mailer.emailService.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@example.com');
        assert.equal(args[0].provider, 'sendgrid');

        const headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'sendgrid');
      });
    });

    it('correctly handles multiple email addresses from selectEmailServices', () => {
      const message = {
        email: 'foo@example.com',
        ccEmails: ['bar@example.com', 'baz@example.com'],
        subject: 'subject',
        template: 'verifyLogin',
        templateValues: {
          action: 'action',
          clientName: 'clientName',
          device: 'device',
          email: 'emailservice.foo@restmail.net',
          ip: 'ip',
          link: 'link',
          location: 'location',
          oneClickLink: 'oneClickLink',
          passwordChangeLink: 'passwordChangeLink',
          passwordChangeLinkAttributes: 'passwordChangeLinkAttributes',
          privacyUrl: 'privacyUrl',
          subject: 'subject',
          supportLinkAttributes: 'supportLinkAttributes',
          supportUrl: 'supportUrl',
          timestamp: 'timestamp',
        },
      };
      mailer.selectEmailServices = sinon.spy(() =>
        P.resolve([
          {
            emailAddresses: [message.email, ...message.ccEmails],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
            mailer: mailer.mailer,
          },
        ])
      );

      return mailer.send(message).then(() => {
        assert.equal(mailer.selectEmailServices.callCount, 1);
        assert.equal(mailer.mailer.sendMail.callCount, 1);
        assert.equal(mailer.emailService.sendMail.callCount, 0);

        const args = mailer.mailer.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@example.com');
        assert.deepEqual(args[0].cc, ['bar@example.com', 'baz@example.com']);

        const headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-auth-server');
        assert.equal(headers['X-Email-Sender'], 'ses');
      });
    });

    it('correctly handles multiple services from selectEmailServices', () => {
      const message = {
        email: 'foo@example.com',
        ccEmails: ['bar@example.com', 'baz@example.com'],
        subject: 'subject',
        template: 'verifyLogin',
        templateValues: {
          action: 'action',
          clientName: 'clientName',
          device: 'device',
          email: 'emailservice.foo@restmail.net',
          ip: 'ip',
          link: 'link',
          location: 'location',
          oneClickLink: 'oneClickLink',
          passwordChangeLink: 'passwordChangeLink',
          passwordChangeLinkAttributes: 'passwordChangeLinkAttributes',
          privacyUrl: 'privacyUrl',
          subject: 'subject',
          supportLinkAttributes: 'supportLinkAttributes',
          supportUrl: 'supportUrl',
          timestamp: 'timestamp',
        },
      };
      mailer.selectEmailServices = sinon.spy(() =>
        P.resolve([
          {
            emailAddresses: [message.email],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
            mailer: mailer.emailService,
          },
          {
            emailAddresses: message.ccEmails.slice(0, 1),
            emailService: 'fxa-email-service',
            emailSender: 'ses',
            mailer: mailer.emailService,
          },
          {
            emailAddresses: message.ccEmails.slice(1),
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
            mailer: mailer.mailer,
          },
        ])
      );

      return mailer.send(message).then(() => {
        assert.equal(mailer.selectEmailServices.callCount, 1);
        assert.equal(mailer.emailService.sendMail.callCount, 2);
        assert.equal(mailer.mailer.sendMail.callCount, 1);

        let args = mailer.emailService.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@example.com');
        assert.equal(args[0].cc, undefined);
        assert.equal(args[0].provider, 'sendgrid');

        let headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'sendgrid');

        args = mailer.emailService.sendMail.args[1];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'bar@example.com');
        assert.equal(args[0].cc, undefined);
        assert.equal(args[0].provider, 'ses');

        headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'ses');

        args = mailer.mailer.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'baz@example.com');
        assert.equal(args[0].cc, undefined);
        assert.equal(args[0].provider, undefined);

        headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-auth-server');
        assert.equal(headers['X-Email-Sender'], 'ses');
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
      'verifySecondaryEmailUrl',
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

  it('mailer and emailService are both mocked', () => {
    assert.equal(mailer.mailer, 'wibble');
    assert.equal(mailer.emailService, 'wibble');
  });

  it('set properties on self from config correctly', () => {
    Object.entries(mailerConfig).forEach(([key, expected]) => {
      assert.equal(mailer[key], expected, `${key} was correct`);
    });
  });
});

describe('email translations', () => {
  let mockLog, mailer;
  const message = {
    email: 'a@b.com',
    uid: '123',
  };

  async function setupMailerWithTranslations(locale) {
    mockLog = mocks.mockLog();
    mailer = await setup(mockLog, config, {}, locale);
  }

  afterEach(() => mailer.stop());

  it('arabic emails are translated', async () => {
    await setupMailerWithTranslations('ar');
    mailer.mailer.sendMail = stubSendMail((emailConfig) => {
      assert.equal(
        emailConfig.headers['Content-Language'],
        'ar',
        'language header is correct'
      );
      // NOTE: translation might change, but we use the subject, we don't change that often.
      // TODO: switch back to testing the subject when translations have caught up
      assert.include(emailConfig.text, 'أُضيفَ البريد الثانوي');
      // assert.include(emailConfig.html, 'صِلْ جهاز آخر');
    });

    return mailer.postVerifySecondaryEmail(message);
  });

  it('russian emails are translated', async () => {
    await setupMailerWithTranslations('ru');
    mailer.mailer.sendMail = stubSendMail((emailConfig) => {
      assert.equal(
        emailConfig.headers['Content-Language'],
        'ru',
        'language header is correct'
      );
      assert.include(emailConfig.subject, 'Добавлена альтернативная эл. почта');
      // assert.include(emailConfig.html, 'Подсоединить другое устройство');
    });

    return mailer.postVerifySecondaryEmail(message);
  });
});

function sesMessageTagsHeaderValue(templateName, serviceName) {
  return `messageType=fxa-${templateName}, app=fxa, service=${
    serviceName || 'fxa-auth-server'
  }`;
}

function configHref(key, campaign, content, ...params) {
  return `href="${configUrl(key, campaign, content, ...params)}"`;
}

function configUrl(key, campaign, content, ...params) {
  let baseUri;
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
      value || MESSAGE[MESSAGE_PARAMS.get(key)] || ''
    );
  }

  [
    ['utm_medium', 'email'],
    ['utm_campaign', `fx-${campaign}`],
    ['utm_content', `fx-${content}`],
  ].forEach(([key, value]) => out.searchParams.append(key, value));

  return out.toString();
}

async function setup(log, config, mocks, locale = 'en', sender = null) {
  const [translator, templates] = await P.all([
    require(`${ROOT_DIR}/lib/senders/translator`)([locale], locale),
    require(`${ROOT_DIR}/lib/senders/templates`)(log),
  ]);
  const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, mocks)(
    log,
    config
  );
  return new Mailer(translator, templates, config.smtp, sender);
}

function stubSendMail(stub, status) {
  return (message, callback) => {
    try {
      stub(message);
      return callback(null, status);
    } catch (err) {
      return callback(err, status);
    }
  };
}

function applyAssertions(type, target, property, assertions) {
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
    assertions.forEach(({ test, expected }) => {
      it(`${test} - ${expected}`, () => {
        assert[test](target, expected, `${type}: ${property}`);
      });
    });
  });
}
