/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Plan } from '../types';
import { PlanConfigurationDtoT } from '../../dto/auth/payments/plan-configuration';

export const PLAN: Plan = {
  plan_id: 'plan_8675309',
  plan_name: '',
  product_id: 'prod_8675309',
  product_name: 'Example product',
  currency: 'usd',
  amount: 599,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  plan_metadata: null,
  product_metadata: null,
};

export const PLAN_WITH_METADATA: Plan = {
  ...PLAN,
  plan_name: 'The Plan',
  plan_metadata: {
    productSet: 'foo',
    productOrder: '2',
    webIconURL: 'https://example.org/webicon.png',
    webIconBackground: '#ffffff',
    upgradeCTA: 'upgradeCTA',
    'product:termsOfServiceURL': 'https://example.org/en-US/terms',
    'product:privacyNoticeURL': 'https://example.org/en-US/privacy',
    'product:termsOfServiceDownloadURL':
      'https://example.org/en-US/terms/download',
    'product:privacyNoticeDownloadURL':
      'https://example.org/en-US/privacy/download',
    'product:ignoreme': 'Unknown name here',
    'product:name': 'Name override!!',
    'product:subtitle': 'Great Full-device VPN',
    'product:details:3': 'Baz Connects 5 devices with one subscription',
    'product:details:1': 'Foo Device-level encryption',
    'product:details:2': 'Bar Servers in 30+ countries',
    'product:details:4': 'Quux Available for Windows, iOS and Android',
    'product:successActionButtonLabel': 'Do something else',
    'product:subtitle:xx-pirate': 'VPN fer yer full-device',
    'product:foobar:9:xx-pirate': 'what even is this',
    'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android",
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:termsOfServiceURL:xx-pirate':
      'https://example.org/xx-pirate/terms',
    'product:privacyNoticeURL:xx-pirate':
      'https://example.org/xx-pirate/privacy',
    'product:termsOfServiceDownloadURL:xx-pirate':
      'https://example.org/xx-pirate/terms/download',
    'product:privacyNoticeDownloadURL:xx-pirate':
      'https://example.org/xx-pirate/privacy/download',
    'product:successActionButtonLabel:xx-pirate': 'Yarr...',
    'product:subtitle:xx-partial': 'Partial localization',
    'product:termsOfServiceURL:xx-partial':
      'https://example.org/xx-partial/terms',
  },
  product_metadata: {
    productSet: 'bar',
    productOrder: '20',
    webIconURL: 'https://example.org/webicon2.png',
    webIconBackground: '#ffff00',
    upgradeCTA: 'upgradeCTA2',
    'product:termsOfServiceURL': 'https://example.org/en-US/terms2',
    'product:privacyNoticeURL': 'https://example.org/en-US/privacy2',
    'product:termsOfServiceDownloadURL':
      'https://example.org/en-US/terms/download2',
    'product:privacyNoticeDownloadURL':
      'https://example.org/en-US/privacy/download2',
    'product:ignoreme': 'Unknown name here 2',
    'product:name': 'Name override!!',
    'product:subtitle': 'Best Full-device VPN',
    'product:details:3': 'Bar Connects 5 devices with one subscription',
    'product:details:1': 'Bar Device-level encryption',
    'product:details:2': 'Baz Servers in 30+ countries',
    'product:details:4': 'Foo Available for Windows, iOS and Android',
    'product:successActionButtonLabel': 'Do something else maybe',
    'product:subtitle:xx-pirate': 'VPN fer yer full-device arr',
    'product:foobar:9:xx-pirate': 'what even arrs this',
    'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android arr",
    'product:details:1:xx-pirate': 'Device-level encryption arr matey',
    'product:details:3:xx-pirate':
      "Connects 5 devices wit' one subscription arr",
    'product:details:2:xx-pirate': 'Servers is 30+ countries arr',
    'product:termsOfServiceURL:xx-pirate':
      'https://example.org/xx-pirate/terms2',
    'product:privacyNoticeURL:xx-pirate':
      'https://example.org/xx-pirate/privacy2',
    'product:termsOfServiceDownloadURL:xx-pirate':
      'https://example.org/xx-pirate/terms/download2',
    'product:privacyNoticeDownloadURL:xx-pirate':
      'https://example.org/xx-pirate/privacy/download2',
    'product:successActionButtonLabel:xx-pirate': 'Yarr matey...',
    'product:subtitle:xx-partial': 'Partial localization2',
    'product:termsOfServiceURL:xx-partial':
      'https://example.org/xx-partial/terms2',
  },
};

export const CONFIGURATION_URLS = {
  successActionButton: 'https://download',
  privacyNotice: 'https://privacynotice',
  termsOfService: 'httsp://termsofservice',
  termsOfServiceDownload: 'https://termsofservicedownload',
  webIcon: 'https://webicon',
};

export const CONFIGURATION_UI_CONTENT = {
  successActionButtonLabel: 'Success Label',
  subtitle: 'VPN Subtitle',
  details: ['Detail line 1', 'Detail line 2', 'Detail line 3'],
  upgradeCTA: 'Upgrade',
};

export const LOCALE_CONFIGURATION_NONE = {
  urls: CONFIGURATION_URLS,
  uiContent: CONFIGURATION_UI_CONTENT,
  support: {},
};

export const LOCALE_CONFIGURATION_FR = {
  urls: {
    successActionButton: 'https://download/fr',
    privacyNotice: 'https://privacynotice/fr',
    termsOfService: 'httsp://termsofservice/fr',
    termsOfServiceDownload: 'https://termsofservicedownload/fr',
    webIcon: 'https://webicon/fr',
  },
  uiContent: {
    successActionButtonLabel: 'Success Label - FR',
    subtitle: 'VPN Subtitle - FR',
    details: ['Detail line 1 - FR', 'Detail line 2 - FR', 'Detail line 3 - FR'],
    upgradeCTA: 'Upgrade - FR',
  },
  support: {},
};

const LOCALE_CONFIGURATION_ENUS = {
  urls: {
    successActionButton: 'https://download/enUS',
    privacyNotice: 'https://privacynotice/enUS',
    termsOfService: 'httsp://termsofservice/enUS',
    termsOfServiceDownload: 'https://termsofservicedownload/enUS',
    webIcon: 'https://webicon/enUS',
  },
  uiContent: {
    successActionButtonLabel: 'Success Label - enUS',
    subtitle: 'VPN Subtitle - enUS',
    details: [
      'Detail line 1 - enUS',
      'Detail line 2 - enUS',
      'Detail line 3 - enUS',
    ],
    upgradeCTA: 'Upgrade - enUS',
  },
  support: {},
};

export const CONFIGURATION: PlanConfigurationDtoT = {
  ...LOCALE_CONFIGURATION_NONE,
  locales: {
    fr: LOCALE_CONFIGURATION_FR,
    enUS: LOCALE_CONFIGURATION_ENUS,
  },
  styles: {
    webIconBackground: 'webbackgroundfr',
  },
  productSet: ['Set 1'],
  productOrder: 1,
};

export const PLAN_WITH_CONFIGURATION: Plan = {
  ...PLAN,
  plan_name: 'Plan Name',
  plan_metadata: {},
  product_metadata: {},
  configuration: CONFIGURATION,
};
