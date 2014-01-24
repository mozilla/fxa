/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery'
],
function ($) {
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
      var translation = this.translations[key] || key;

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
