/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import zipWith from 'lodash/zipWith';
import Backbone from 'backbone';

const t = (msg) => msg;

// Values sent as part of Zendesk support tickets. They also act as look up keys
// for translated strings used in the UI.
const TOPICS = [
  'Payment & billing',
  'Account issues',
  'Technical issues',
  'Provide feedback / request features',
  'Not listed',
];

// Lowercase translated strings used in the successful submission modal.
const LOWERED_TOPICS = [
  t('payment & billing'),
  t('account issues'),
  t('technical issues'),
  t('provide feedback / request features'),
  t('not listed'),
];

const PRODUCT_TAGS = {
  'Mozilla VPN': 'firefox-private-network-vpn',
  'Firefox Relay': 'relay',
  'Firefox Account': 'firefox_accounts',
  'Firefox Private Network': 'firefox-private-netowrk',
  Other: 'product_other',
};

const CATEGORY_TAGS = {
  'Payment & billing': 'payment',
  'Account issues': 'accounts',
  'Technical issues': 'technical',
  'Provide feedback / request features': 'feedback',
  'Not listed': 'not_listed',
};

const topicOptions = zipWith(TOPICS, LOWERED_TOPICS, (topic, lowered) => ({
  topic,
  lowered,
}));

const SupportForm = Backbone.Model.extend({
  validate: function (attrs) {
    if (attrs.message !== '' && attrs.productName && attrs.topic !== '') {
      return;
    }

    // This is not an error message used anywhere. It's just that Backbone wants
    // a string to indicate an invalid state.
    return 'Missing required field.';
  },

  topicOptions,

  getLoweredTopic: function (topic) {
    const selected = topicOptions.find((t) => t.topic === topic);
    return selected ? selected.lowered : topic;
  },
  getProductTag: function (product) {
    return PRODUCT_TAGS[product] || '';
  },
  getCategoryTag: function (category) {
    return CATEGORY_TAGS[category] || '';
  },
});

export default SupportForm;
