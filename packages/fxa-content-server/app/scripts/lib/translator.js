/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Translate `en` strings into a language suitable for the user.
// Translated strings are fetched from the server. The translation
// is chosen on the backend based on the user's `Accept-Language`
// headers.

import $ from 'jquery';
import _ from 'underscore';
import Strings from './strings';
import xhr from './xhr';

/**
 * @param {Object} options - translator options
 * @param {Boolean} [options.forceEnglish] - force English translations, used in tests.
 * @param {Object} [options.xhr=xhr] XHR module to use.
 * @constructor
 */
const Translator = function(options = {}) {
  if (options.forceEnglish) {
    this._forceEnglish = true;
  }

  this._xhr = options.xhr || xhr;
};

Translator.prototype = {
  // In dev mode, translations are requested in `fetch`.
  // In prod mode, __translations__ will be replaced with the actual translations.
  // `__translations__` is used in hopes that it's a slight bit less likely
  // than `translations` to be used in another module, a collision would
  // bork the build.
  // DO NOT EDIT BELOW HERE W/O CHECKING LOCALIZED BUILDS
  __translations__: {},
  // DO NOT EDIT ABOVE HERE W/O CHECKING LOCALIZED BUILDS

  fetch() {
    // fetch translations for dev mode. In prod, __translations__: {}
    // is replaced with translations as part of the build step.
    return new Promise((resolve, reject) => {
      if (this._forceEnglish || Object.keys(this.__translations__).length) {
        resolve();
      } else {
        this._xhr.getJSON('/i18n/client.json').then(translations => {
          this.__translations__ = translations;
          resolve();
        }, reject);
      }
    });
  },

  set(translations) {
    this.__translations__ = translations;
  },

  /**
   * Gets a translated value by key but returns the key if nothing is found.
   * Does string interpolation on %s and %(named)s.
   * @method get
   * @param {String} stringToTranslate
   * @param {Object} [context={}]
   * @returns {String}
   */
  get(stringToTranslate, context = {}) {
    const translations = this.__translations__;
    let translation;

    if (context.msgctxt) {
      const stringWithContextPrefix = `${context.msgctxt}\u0004${stringToTranslate}`;
      // If a translation exists with a context prefix, use that. If no translation exists
      // with the context prefix, try to find a string without the context prefix.
      translation =
        translations[stringWithContextPrefix] ||
        translations[stringToTranslate];
    } else {
      translation = translations[stringToTranslate];
    }

    /**
     * See http://www.lehman.cuny.edu/cgi-bin/man-cgi?msgfmt+1
     * and
     * https://github.com/mikeedwards/po2json/blob/62e17c999a8e95923ffa24fcd5972fc48a3d3ddf/test/fixtures/pl.json#L23-L27
     *
     * the .json files appear to be in the format
     * non-pluralized:
     * {
     *  "msgid": [null, "translated string"]
     * }
     * pluralized:
     * {
     *  "msgid": [
     *    "untranslated_string_plural",
     *    "translated - 0 items",
     *    "translated - 1 item",
     *    "translated - n items"
     *  ]
     * }
     */
    if (_.isArray(translation) && translation.length >= 2) {
      translation = translation[1];
    }

    translation = $.trim(translation);

    if (!translation) {
      translation = stringToTranslate;
    }

    return this.interpolate(translation, context);
  },

  interpolate: Strings.interpolate,

  /**
   * Return a helper function to be used by the template engine
   * to translate a string
   *
   * @param {String} [forceText] - text to translate
   * @param {Object} [context] - context to pass to translator
   * @returns {Function}
   */
  translateInTemplate(forceText, context) {
    return templateText => {
      return this.get(forceText || templateText, context);
    };
  },
};

export default Translator;
