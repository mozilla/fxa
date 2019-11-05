/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Decide if communication preferences are visible for the user.
 */

'use strict';

const BaseGroupingRule = require('./base');

// If only the language, not the region, is specified, then all regions
// will be considered a match. For instance, 'de' will match 'de', 'de-de',
// 'de-at', etc. #2217
const AVAILABLE_LANGUAGES = ['de', 'en', 'es', 'fr', 'hu', 'id', 'pl', 'ru'];

// If the region is specified, other regions will not match. For instance,
// 'pt-br' will not match 'pt' or 'pt-pt'. #2217
const AVAILABLE_REGIONS = ['pt-br', 'zh-tw'];

const AVAILABLE_LANGUAGES_REGEX = generateRegex(
  AVAILABLE_LANGUAGES,
  AVAILABLE_REGIONS
);

function generateRegex(langs, regions) {
  const combined = langs.map(x => `${x}|${x}-[a-z]{2}`).concat(regions);
  return arrayToRegex(combined);
}

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

    if (! lang) {
      return false;
    }

    return areCommunicationPrefsAvailable(lang, availableLanguages);
  }
};
