/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'lodash';
import Backbone from 'backbone';

const t = msg => msg;

// Values sent as part of Zendesk support tickets. They also act as look up keys
// for translated strings used in the UI.
const TOPICS = [
  'Firefox Account',
  'Firefox Private Network Android App',
  'Firefox Private Network Windows App',
  'Firefox Private Network IOS App',
  'Firefox Private Network Browser Extension',
  'Other',
];

// Translated strings for the drop down options.
const TRANSLATED_TOPICS = [
  t('Firefox Account'),
  t('Firefox Private Network Android App'),
  t('Firefox Private Network Windows App'),
  t('Firefox Private Network IOS App'),
  t('Firefox Private Network Browser Extension'),
  t('Other'),
];

// Lowercase translated strings used in the successful submission modal.
const LOWERED_TOPICS = TRANSLATED_TOPICS.map(x => x.toLocaleLowerCase());

const topicOptions = _.zipWith(
  TOPICS,
  TRANSLATED_TOPICS,
  LOWERED_TOPICS,
  (topic, translated, lowered) => ({ topic, translated, lowered })
);

// Values sent as part of Zendesk support tickets. They also act as look up keys
// for translated strings used in the UI.
const ISSUES = [
  'Payment & billing',
  'Account issues',
  'Technical issues',
  'Provide feedback / request features',
  'Not listed',
];

// Translated strings for the drop down options.
const TRANSLATED_ISSUES = [
  t('Payment & billing'),
  t('Account issues'),
  t('Technical issues'),
  t('Provide feedback / request features'),
  t('Not listed'),
];

// Lowercase translated strings used in the successful submission modal.
const LOWERED_ISSUES = TRANSLATED_ISSUES.map(x => x.toLocaleLowerCase());

const issueOptions = _.zipWith(
  ISSUES,
  TRANSLATED_ISSUES,
  LOWERED_ISSUES,
  (issue, translated, lowered) => ({ issue, translated, lowered })
);

const SupportForm = Backbone.Model.extend({
  validate: function(attrs) {
    if (
      attrs.message !== '' &&
      attrs.productName &&
      attrs.topic !== '' &&
      attrs.issue !== ''
    ) {
      return;
    }

    // This is not an error message used anywhere. It's just that Backbone wants
    // a string to indicate an invalid state.
    return 'Missing required field.';
  },

  topicOptions,

  issueOptions,

  getTranslatedTopic: function(topic) {
    const selected = topicOptions.find(t => t.topic === topic);
    return selected ? selected.translated : topic;
  },

  getLoweredTopic: function(topic) {
    const selected = topicOptions.find(t => t.topic === topic);
    return selected ? selected.lowered : topic;
  },

  getTranslatedIssue: function(issue) {
    const selected = issueOptions.find(i => i.issue === issue);
    return selected ? selected.translated : issue;
  },

  getLoweredIssue: function(issue) {
    const selected = issueOptions.find(i => i.issue === issue);
    return selected ? selected.lowered : issue;
  },
});

export default SupportForm;
