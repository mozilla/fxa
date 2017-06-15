/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Decide if communication preferences are visible for the user.
 */

define((require, exports, module) => {
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
    'zh-tw'
  ];

  const availableLocalesRegExpStr = `^(${AVAILABLE_LANGUAGES.join('|')})$`;
  const availableLocalesRegExp = new RegExp(availableLocalesRegExpStr);

  function normalizeLanguage(lang) {
    return lang.toLowerCase().replace(/_/g, '-');
  }

  function areCommunicationPrefsAvailable(lang) {
    const normalizedLanguage = normalizeLanguage(lang);
    return availableLocalesRegExp.test(normalizedLanguage);
  }

  module.exports = class CommunicationPrefsGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'communicationPrefsVisible';
      this.availableLanguages = AVAILABLE_LANGUAGES;
    }

    choose (subject = {}) {
      if (! subject.lang) {
        return false;
      }

      return areCommunicationPrefsAvailable(subject.lang);
    }
  };
});
