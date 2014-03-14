/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'jquery',
  'lib/strings'
],
function (_, $, Strings) {

  var bestLanguage = function (language, supportedLanguages, defaultLanguage) {
    var lower = supportedLanguages.map(function(l) {
      return l.toLowerCase();
    });

    if (lower.indexOf(language.toLowerCase()) !== -1) {
      return language;
    } else if (lower.indexOf(language.split('-')[0].toLowerCase()) !== -1) {
      return language.split('-')[0];
    }
    return defaultLanguage;
  };

  var Translator = function (language, supportedLanguages, defaultLanguage) {
    this.language = bestLanguage(language, supportedLanguages, defaultLanguage);
    this.translations = {};
  };

  Translator.prototype = {
    set: function (translations) {
      this.translations = translations;
    },



    // Fetches our JSON translation file
    fetch: function (done) {
      $.ajax({ dataType: 'json', url: '/i18n/' + this.language.replace(/-/, '_') + '/client.json' })
        .done(function (data) {
          this.translations = data;
        }.bind(this))
        .always(done);
    },

    /**
     * Gets a translated value by key but returns the key if nothing is found.
     * Does string interpolation on %s and %(named)s.
     * @method get
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

    interpolate: Strings.interpolate
  };

  return Translator;
});
