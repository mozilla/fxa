/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'jquery'
],
function (_, $) {
  var Translator = function (language) {
    this.language = language;
    this.translations = {};
  };

  Translator.prototype = {
    set: function (translations) {
      this.translations = translations;
    },

    // Fetches our JSON translation file
    fetch: function (done) {
      $.ajax({ dataType: 'json', url: '/i18n/' + this.language.replace(/-/, '_') + '/messages.json' })
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
       *    "translated 0 items",
       *    "translated 1 item",
       *    "translted multiple items"
       *  ]
       * }
       */
      if (_.isArray(translation)) {
        translation = translation[1];
      }

      if (! translation) {
        translation = key;
      }

      return this.interpolate(translation, context);
    },

    /**
     * Replace instances of %s and %(name)s with their corresponding values in
     * the context
     * @method interpolate
     */
    interpolate: function (string, context) {
      if (! context) {
        context = [];
      }

      var interpolated = string.replace(/\%s/g, function (match) {
        // boot out non arrays and arrays with not enough items.
        if (! (context.shift && context.length > 0)) {
          return match;
        }
        return context.shift();
      });

      interpolated = interpolated.replace(/\%\(([a-zA-Z]+)\)s/g, function (match, name) {
        return name in context ? context[name] : match;
      });

      return interpolated;
    }
  };

  return Translator;
});
