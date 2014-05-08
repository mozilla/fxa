/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to create .json files out of .po files.
// .po files are expected to already be downloaded.

const path = require('path');
const i18n = require('i18n-abide');

module.exports = function (grunt) {
  'use strict';

  grunt.config('po2json', {
    options: {
      format: 'raw',
      fuzzy: true,
      /*jshint camelcase: false*/
      output_filename: function (file) {

        /**
         * the files are stored in the locale subdirectory with a directory
         * structure of:
         * locale/
         *       <locale_name>/
         *                    LC_MESSAGES/
         *                               server.po
         *                               client.po
         *
         * Each locale is stored in its own subdirectory in the output i18n
         * directory.
         **/
        var matches = /^locale\/([^\/]+)\/LC_MESSAGES\/(.*)$/.exec(file);

        // In order to make sure the locale is in a form that i18n-abide expects
        // we convert it from locale to langauge back to locale.
        var locale = i18n.localeFrom(i18n.languageFrom(matches[1]));
        var filename = matches[2];
        if (filename === 'server.po') {
          filename = 'messages.json';
        } else {
          // get rid of the .po extension, replace with .json
          filename = path.basename(filename, '.po') + '.json';
        }
        return locale + '/' + filename;
      },
      output_transform: function (data) {
        // write the first translation only, ignore pluralization.
        var isArray = function (item) {
          return Object.prototype.toString.call(item) === '[object Array]';
        };

        var transformed = {};
        for (var msgid in data) {
          var translation = data[msgid];
          if (isArray(translation) && translation.length >= 2) {
            translation = translation[1];
          }

          transformed[msgid] = translation;
        }

        return transformed;
      }
    },
    all: {
      src: ['<%= yeoman.strings_dist %>/**/*.po'],
      dest: '<%= yeoman.app %>/i18n'
    },
    template: {
      src: ['<%= yeoman.strings_dist %>/**/*.pot'],
      dest: '<%= yeoman.tmp %>/i18n'
    }
  });
};


