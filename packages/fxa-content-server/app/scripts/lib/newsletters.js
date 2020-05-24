/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const t = (msg) => msg;

/**
 * Map of newsletter info.
 *
 * `label` is the label shown to the user. This needs to be translated
 * before being rendered to the DOM.
 * `slug` is the id passed to Basket
 */

export default {
  CONSUMER_BETA: {
    label: t('Test new Firefox products'),
    slug: 'test-pilot',
  },
  FIREFOX_ACCOUNTS_JOURNEY: {
    label: t('Get the latest news about Mozilla and Firefox'),
    slug: 'firefox-accounts-journey',
  },
  HEALTHY_INTERNET: {
    label: t('Take action to keep the internet healthy'),
    slug: 'take-action-for-the-internet',
  },
  ONLINE_SAFETY: {
    label: t('Be safer and smarter online'),
    slug: 'knowledge-is-power',
  },
};
