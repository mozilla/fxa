/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Translate `en` strings into a language suitable for the user.
// Translated strings are fetched from the server. The translation
// is chosen on the backend based on the user's `Accept-Language`
// headers.

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var Strings = require('lib/strings');
  var xhr = require('lib/xhr');

  var Translator = function () {
    this.translations = {};
  };

  Translator.prototype = {
    set: function (translations) {
      this.translations = translations;
    },

    // Fetches our JSON translation file
    fetch: function () {
      var self = this;

      return xhr.getJSON('/i18n/client.json')
          .then(function (data) {
            // Only update the translations if some came back
            // from the server. If the server sent no translations,
            // english strings will be served.
            if (data) {
              self.translations = data;
            }
          }, function () {
            // allow for 404's. `.get` will use the key for the translation
            // if a value is not found in the translations table. This means
            // English will be the fallback.
            self.translations = {};
          });
    },

    /**
     * Gets a translated value by key but returns the key if nothing is found.
     * Does string interpolation on %s and %(named)s.
     * @method get
     * @param {String} key
     * @param {String} context
     * @returns {String}
     */
    get: function (key, context) {
      var translation = this.translations[key];
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

      if (! translation) {
        translation = key;
      }

      return this.interpolate(translation, context);
    },

    interpolate: Strings.interpolate,

    /**
     * Return a helper function to be used by the template engine
     * to translate a string
     *
     * @param {string} [forceText] - text to translate
     * @param {object} [context] - context to pass to translator
     * @returns {function}
     */
    translateInTemplate: function (forceText, context) {
      var self = this;
      return function (templateText) {
        return self.get(forceText || templateText, context);
      };
    }

  };

  module.exports = Translator;
});
