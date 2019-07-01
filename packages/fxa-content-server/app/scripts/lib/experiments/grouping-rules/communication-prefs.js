/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Decide if communication preferences are visible for the user.
 */

'use strict';

const BaseGroupingRule = require('./base');

const AVAILABLE_LANGUAGES = [
  'de',
  'en',
  'en-[a-z]{2}',
  'es',
  'es-[a-z]{2}',
  'fr',
  'hu',
  'id',
  'pl',
  'pt-br',
  'ru',
  'zh-tw',
];

const AVAILABLE_LANGUAGES_REGEX = arrayToRegex(AVAILABLE_LANGUAGES);

function normalizeLanguage(lang) {
  return lang.toLowerCase().replace(/_/g, '-');
}

function areCommunicationPrefsAvailable(lang, availableLanguages) {
  const normalizedLanguage = normalizeLanguage(lang);
  return availableLanguages.test(normalizedLanguage);
}

function arrayToRegex(array) {
  return new RegExp(`^(?:${array.join('|')})$`);
}

module.exports = class CommunicationPrefsGroupingRule extends BaseGroupingRule {
  constructor() {
    super();
    this.name = 'communicationPrefsVisible';
  }

  choose(subject = {}) {
    const { featureFlags, lang } = subject;
    let availableLanguages = AVAILABLE_LANGUAGES_REGEX;

    if (
      featureFlags &&
      Array.isArray(featureFlags.communicationPrefLanguages)
    ) {
      availableLanguages = arrayToRegex(
        featureFlags.communicationPrefLanguages
      );
    }

    if (!lang) {
      return false;
    }

    return areCommunicationPrefsAvailable(lang, availableLanguages);
  }
};
