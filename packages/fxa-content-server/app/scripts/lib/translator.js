/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery'
],
function($) {
  var Translator = function(language) {
    this.language = language;
    this.translations = {};
  };

  Translator.prototype = {
    // Fetches our JSON translation file
    fetch: function(done) {
      $.ajax({ dataType: 'json', url: '/i18n/' + this.language.replace(/-/, '_') + '/messages.json' })
        .done(function(data) {
          this.translations = data;
        }.bind(this))
        .always(done);
    },

    // Gets a translated value by key but returns the key if nothing is found
    get: function(key) {
      return this.translations[key] || key;
    }
  };

  return Translator;
});
