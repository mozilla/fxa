/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'lodash';
import Backbone from 'backbone';

const t = msg => msg;

// Values sent as part of Zendesk support tickets. They also act as look up keys
// for translated strings used in the UI.
const TOPICS = [
  'General inquiries',
  'Payment & billing',
  'Connection issues',
  'Getting started',
  'Account issues',
  'Firefox Private Network Android App',
  'Firefox Private Network Windows App',
];

// Translated strings for the drop down options.
const TRANSLATED_TOPICS = [
  t('General inquiries'),
  t('Payment & billing'),
  t('Connection issues'),
  t('Getting started'),
  t('Account issues'),
  t('Firefox Private Network Android App'),
  t('Firefox Private Network Windows App'),
];

// Lowercase translated strings used in the successful submission modal.
const LOWERED_TOPICS = TRANSLATED_TOPICS.map(x => x.toLocaleLowerCase());

const topicOptions = _.zipWith(
  TOPICS,
  TRANSLATED_TOPICS,
  LOWERED_TOPICS,
  (topic, translated, lowered) => ({ topic, translated, lowered })
);

const SupportForm = Backbone.Model.extend({
  validate: function(attrs) {
    if (attrs.message !== '' && attrs.productName && attrs.topic !== '') {
      return;
    }

    // This is not an error message used anywhere. It's just that Backbone wants
    // a string to indicate an invalid state.
    return 'Missing required field.';
  },

  topicOptions,

  getTranslatedTopic: function(topic) {
    const selected = topicOptions.find(t => t.topic === topic);
    return selected ? selected.translated : topic;
  },

  getLoweredTopic: function(topic) {
    const selected = topicOptions.find(t => t.topic === topic);
    return selected ? selected.lowered : topic;
  },
});

export default SupportForm;
