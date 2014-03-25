/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const i18n = require('i18n-abide');

// percentage of strings that must be translated for a supported locale
const threshold = 90;

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('l10n-supported-locales', ['l10n-create-json', 'l10n-locale-counts']);

  var getCount = function (src) {
    var clientJson = require(path.resolve(src, 'client.json'));
    var messagesJson = require(path.resolve(src, 'messages.json'));
    var count = 0;

    Object.keys(clientJson).forEach(function (key) {
      if (clientJson[key] !== '') {
        count++;
      }
    });
    Object.keys(messagesJson).forEach(function (key) {
      if (messagesJson[key] !== '') {
        count++;
      }
    });

    return count;
  };

  grunt.config('l10n-locale-counts', {
    app: {
      files: [
        {
          expand: true,
          src: [
            '<%= yeoman.app %>/i18n/*'
          ]
        }
      ]
    }
  });

  grunt.registerMultiTask('l10n-locale-counts', 'Print the list of locales we should enable in production.', function () {
    var goodLocales = [];
    var templateDir = path.join(__dirname, '..', grunt.config().yeoman.tmp, 'i18n', 'templates');
    var templateClient = require(path.join(templateDir, 'client.pot.json'));
    var templateServer = require(path.join(templateDir, 'server.pot.json'));
    var totalStrings = Object.keys(templateClient).length + Object.keys(templateServer).length;

    this.files.forEach(function (file) {
      var src = file.src[0];
      var locale = path.basename(src);

      var count = getCount(src, locale);
      if (count / totalStrings * 100 >= threshold) {
        grunt.verbose.writeln(locale, count, '/', totalStrings);
        goodLocales.push(i18n.languageFrom(locale));
      }
    });

    grunt.log.write(JSON.stringify(goodLocales, null, '  '));
  });

};

