/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* TODO: test translations with Fluent
 * NOTE: This file tests `email.js` and the MJML/EJS templates in `lib/senders/emails`.
 * Eventually we will retire `email.js` but as templates are being converted over to
 * the new stack, tests per template will be added, and then any other mailer tests
 * will be copied over.
 */

const ROOT_DIR = '../../..';

import { assert } from 'chai';
import mocks from '../../mocks';
import proxyquire from 'proxyquire';
import { URL } from 'url';

const config = require(`${ROOT_DIR}/config`).getProperties();
if (!config.smtp.sesConfigurationSet) {
  config.smtp.sesConfigurationSet = 'ses-config';
}

const TEMPLATE_VERSIONS = require(`${ROOT_DIR}/lib/senders/templates/_versions.json`);

const MESSAGE = {
  // Note: acceptLanguage is not just a single locale
  acceptLanguage: 'en;q=0.8,en-US;q=0.5,en;q=0.3"',
  appStoreLink: 'https://example.com/app-store',
  code: 'abc123',
  date: 'Wednesday, Apr 7, 2021',
  deviceId: 'foo',
  location: {
    city: 'Mountain View',
    country: 'USA',
    stateCode: 'CA',
  },
  email: 'b@c.com',
  flowBeginTime: Date.now(),
  flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  ip: '219.129.234.194',
  locations: [],
  numberRemaining: 2,
  primaryEmail: 'c@d.com',
  service: 'sync',
  time: '5:48:20 PM (PDT)',
  timeZone: 'America/Los_Angeles',
  tokenCode: 'abc123',
  type: 'secondary',
  uaBrowser: 'Firefox',
  uaBrowserVersion: '70.0a1',
  uaOS: 'Windows',
  uaOSVersion: '10',
  uid: 'uid',
  unblockCode: 'AS6334PK',
  productId: 'wibble',
  planId: 'plan-example',
  productName: 'Firefox Fortress',
  subscription: {
    productName: 'Cooking with Foxkeh',
    planId: 'plan-example',
    productId: 'wibble',
  },
  subscriptions: [
    { productName: 'Firefox Fortress' },
    { productName: 'Cooking with Foxkeh' },
  ],
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

interface Test {
  test: 'equal' | 'include' | 'notInclude' | any;
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
  ])],

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
      { test: 'include', expected: decodeUrl(configHref('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'low-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'low-recovery-codes', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Generate codes:\n${configUrl('accountRecoveryCodesUrl', 'low-recovery-codes', 'recovery-codes', 'low_recovery_codes=true', 'email', 'uid')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'low-recovery-codes', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'low-recovery-codes', 'support')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postVerifyEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Account verified. Next, sync another device to finish setup' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('syncUrl', 'account-verified', 'connect-device') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postVerify') }],
      ['X-Template-Name', { test: 'equal', expected: 'postVerify' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postVerify }],
    ])],
    ['html', [
      { test: 'include', expected: "Firefox Account verified. You’re almost there." },
      { test: 'include', expected: 'Next sync between your devices!' },
      { test: 'include', expected: 'Sync privately keeps your bookmarks, passwords and other Firefox data the same across all your devices.' },
      { test: 'include', expected: decodeUrl(configHref('syncUrl', 'account-verified', 'connect-device')) },
      { test: 'include', expected: decodeUrl(config.smtp.androidUrl) },
      { test: 'include', expected: decodeUrl(config.smtp.iosUrl) },
      { test: 'include', expected: 'another desktop device' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-verified', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-verified', 'support')) },
      { test: 'include', expected: decodeUrl(config.smtp.firefoxDesktopUrl) },
    ]],
    ['text', [
      { test: 'include', expected: 'Firefox Account verified. You’re almost there.' },
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
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'first-verification-reminder', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'first-verification-reminder', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'first-verification-reminder', 'confirm-email', 'code', 'reminder=first', 'uid')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
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
      { test: 'include', expected: 'Confirm your account and get the most out of Firefox everywhere you sign in starting with:' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verificationUrl', 'welcome', 'activate', 'uid', 'code', 'service')) },
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

  ['verifyShortCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Verification code: ${MESSAGE.code}` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verify') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifyShortCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifyShortCode }],
      ['X-Verify-Short-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'include', expected: 'If yes, use this verification code in your registration form:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-secondary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-secondary', 'support')) },
      { test: 'include', expected: 'Verify secondary email' },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account:` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: 'Use this verification code:' },
      { test: 'include', expected: `${MESSAGE.code}` },
      { test: 'include', expected: 'It expires in 5 minutes. Once verified, this address will begin receiving security notifications and confirmations.' },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['passwordResetEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Password updated' }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('passwordReset') }],
      ['X-Template-Name', { test: 'equal', expected: 'passwordReset' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.passwordReset }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-success', 'support')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-reset-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-reset-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-reset-success', 'support')}` },
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
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'new-device-signin', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-device-signin', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-device-signin', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'new-device-signin', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['verifySecondaryEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Confirm secondary email' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('verifySecondaryEmailUrl', 'welcome-secondary', 'activate', 'code', 'uid', 'type=secondary', 'secondary_email_verified', 'service') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('verifySecondary') }],
      ['X-Template-Name', { test: 'equal', expected: 'verifySecondary' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.verifySecondary }],
      ['X-Verify-Code', { test: 'equal', expected: MESSAGE.code }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-secondary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-secondary', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verifySecondaryEmailUrl', 'welcome-secondary', 'activate', 'code', 'uid', 'type=secondary', 'secondary_email_verified', 'service')) },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: MESSAGE.primaryEmail },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome-secondary', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome-secondary', 'support')}` },
      { test: 'include', expected: `Verify email:\n${configUrl('verifySecondaryEmailUrl', 'welcome-secondary', 'activate', 'code', 'uid', 'type=secondary', 'secondary_email_verified', 'service')}` },
      { test: 'include', expected: `A request to use ${MESSAGE.email} as a secondary email address has been made from the following Firefox Account` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: MESSAGE.primaryEmail },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-changed-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-changed-success', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: configUrl('initiatePasswordResetUrl', 'password-changed-success', 'reset-password', 'email', 'reset_password_confirm=false', 'email_to_hash_with=') },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-changed-success', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'password-changed-success', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-unblock', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: MESSAGE.unblockCode },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-unblock', 'privacy')}` },
      { test: 'include', expected: configUrl('reportSignInUrl', 'new-unblock', 'report', 'uid', 'unblockCode') },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `If yes, here is the authorization code you need: ${MESSAGE.unblockCode}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome-primary', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome-primary', 'support')) },
      { test: 'include', expected: decodeUrl(configHref('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'welcome-primary', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome-primary', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome-primary', 'support')}` },
      { test: 'include', expected: `Verify email:\n${configUrl('verifyPrimaryEmailUrl', 'welcome-primary', 'activate', 'code', 'uid', 'type=primary', 'primary_email_verified', 'service')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'welcome', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'welcome', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'include', expected: 'If yes, use this verification code in your registration form:' },
      { test: 'include', expected: MESSAGE.code },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'welcome', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'welcome', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'include', expected: `If yes, use this verification code in your registration form:\n${MESSAGE.code}` },
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
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'new-signin', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'new-signin', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'new-signin', 'privacy')}` },
      { test: 'include', expected: `Confirm sign-in\n${configUrl('verifyLoginUrl', 'new-signin', 'confirm-signin', 'code', 'uid', 'service')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'forgot-password', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'forgot-password', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'forgot-password', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'forgot-password', 'support')}` },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('createAccountRecoveryUrl', 'password-reset-account-recovery-success', 'create-recovery-key', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'password-reset-account-recovery-success', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-reset-account-recovery-success', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'password-reset-account-recovery-success', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-generated', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-generated', 'support')) },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `Manage account:\n${configUrl('accountSettingsUrl', 'account-recovery-generated', 'manage-account', 'email', 'uid')}` },
      { test: 'include', expected: `please change your password.\n${configUrl('initiatePasswordChangeUrl', 'account-recovery-generated', 'change-password', 'email')}` },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'account-recovery-generated', 'privacy')}` },
      { test: 'include', expected: `For more information, please visit ${configUrl('supportUrl', 'account-recovery-generated', 'support')}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-recovery-removed', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-recovery-removed', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-recovery-removed', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-recovery-removed', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['postRemoveTwoStepAuthenticationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Two-step verification is off' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postRemoveTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postRemoveTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postRemoveTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-two-step-disabled', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-two-step-disabled', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-two-step-disabled', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-two-step-disabled', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-email-verified', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-email-verified', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-email-verified', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-email-verified', 'support')) },
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

  ['postAddTwoStepAuthenticationEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Two-step authentication enabled' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postAddTwoStepAuthentication') }],
      ['X-Template-Name', { test: 'equal', expected: 'postAddTwoStepAuthentication' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postAddTwoStepAuthentication }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-two-step-enabled', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-two-step-enabled', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-two-step-enabled', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-two-step-enabled', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-email-changed', 'account-email-changed', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-email-changed', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-email-changed', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-email-changed', 'support')) },
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

  ['postConsumeRecoveryCodeEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: 'Recovery code used' }],
    ['headers', new Map([
      ['X-Link', { test: 'equal', expected: configUrl('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid') }],
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('postConsumeRecoveryCode') }],
      ['X-Template-Name', { test: 'equal', expected: 'postConsumeRecoveryCode' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.postConsumeRecoveryCode }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-consume-recovery-code', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-consume-recovery-code', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-consume-recovery-code', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-consume-recovery-code', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: decodeUrl(configHref('accountSettingsUrl', 'account-replace-recovery-codes', 'manage-account', 'email', 'uid')) },
      { test: 'include', expected: decodeUrl(configHref('initiatePasswordChangeUrl', 'account-replace-recovery-codes', 'change-password', 'email')) },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'account-replace-recovery-codes', 'privacy')) },
      { test: 'include', expected: decodeUrl(configHref('supportUrl', 'account-replace-recovery-codes', 'support')) },
      { test: 'include', expected: `IP address: ${MESSAGE.ip}` },
      { test: 'include', expected: `${MESSAGE.location.city}, ${MESSAGE.location.stateCode}, ${MESSAGE.location.country} (estimated)` },
      { test: 'include', expected: `${MESSAGE.uaBrowser} on ${MESSAGE.uaOS} ${MESSAGE.uaOSVersion}` },
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: `${MESSAGE.date}` },
      { test: 'include', expected: `${MESSAGE.time}` },
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
      { test: 'include', expected: 'change your password as a precaution' },
      { test: 'include', expected: decodeUrl(configHref('privacyUrl', 'password-change-required', 'privacy')) },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'change your password as a precaution' },
      { test: 'include', expected: `Mozilla Privacy Policy\n${configUrl('privacyUrl', 'password-change-required', 'privacy')}` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
  ])],

  ['subscriptionPaymentExpiredEmail', new Map<string, Test | any>([
    ['subject', { test: 'equal', expected: `Credit card for ${MESSAGE.productName} expiring soon` }],
    ['headers', new Map([
      ['X-SES-MESSAGE-TAGS', { test: 'equal', expected: sesMessageTagsHeaderValue('subscriptionPaymentExpired') }],
      ['X-Template-Name', { test: 'equal', expected: 'subscriptionPaymentExpired' }],
      ['X-Template-Version', { test: 'equal', expected: TEMPLATE_VERSIONS.subscriptionPaymentExpired }],
    ])],
    ['html', [
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-payment-expired', 'update-billing', 'plan_id', 'product_id', 'uid', 'email')) },
      // commented out during template conversion - this doesn't appear to actually existin rendered old templates but passes the test?
      // { test: 'include', expected: decodeUrl(configHref('subscriptionTermsUrl', 'subscription-payment-expired', 'subscription-terms')) },
      { test: 'include', expected: `for ${MESSAGE.productName} is about to expire.` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `for ${MESSAGE.productName} is about to expire.` },
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
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscriptions-payment-expired', 'update-billing', 'email', 'uid')) },
      { test: 'include', expected: 'using to make payments for the following subscriptions is about to expire.' },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: 'using to make payments for the following subscriptions is about to expire.' },
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
      { test: 'include', expected: decodeUrl(configHref('subscriptionSettingsUrl', 'subscription-reactivation', 'cancel-subscription', 'plan_id', 'product_id', 'uid', 'email')) },
      { test: 'include', expected: `reactivating your ${MESSAGE.productName} subscription` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]],
    ['text', [
      { test: 'include', expected: `reactivating your ${MESSAGE.productName} subscription` },
      { test: 'notInclude', expected: 'utm_source=email' },
    ]]
  ])],
];

describe('lib/senders/mjml-emails:', () => {
  type LocalizeFn = (message: Record<any, any>) => Promise<Record<any, string>>;
  type SelectEmailServicesFn = (message: Record<any, any>) => Promise<any>;

  let mockLog: Record<any, any>,
    mailer: Record<any, any>,
    localize: LocalizeFn,
    selectEmailServices: SelectEmailServicesFn,
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
  baseUri = config.smtp[key];

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
  const [translator, templates] = await Promise.all([
    require(`${ROOT_DIR}/lib/senders/translator`)([locale], locale),
    require(`${ROOT_DIR}/lib/senders/templates`)(log),
  ]);
  const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, mocks)(
    log,
    config,
    {
      check: () => Promise.resolve(),
    }
  );
  return new Mailer(translator, templates, config.smtp, sender);
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
