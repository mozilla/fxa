/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to create .json files out of .po files.
// .po files are expected to already be downloaded.

const path = require('path');

module.exports = function (grunt) {
  'use strict';

  grunt.config('po2json', {
    options: {
      format: 'raw',
      /*jshint camelcase: false*/
      output_filename: function (file) {

        /**
         * the files are stored in the locale subdirectory with a directory
         * structure of:
         * locale/
         *       <locale_name>/
         *                    LC_MESSAGES/
         *                               content-server.po
         *                               auth-server.po
         *
         * Each locale is stored in its own subdirectory in the output i18n
         * directory.
         *
         * content-server.po should have an output filename of messages.json
         */
        var matches = /^locale\/([^\/]+)\/LC_MESSAGES\/(.*)$/.exec(file);
        var locale = matches[1].replace(/-/g, '_');
        var filename = matches[2];
        if (filename === 'server.po') {
          filename = 'messages.json';
        } else {
          // get rid of the .po extension, replace with .json
          filename = path.basename(filename, '.po') + '.json';
        }
        grunt.log.writeln('locale: %s, filename: %s', locale, filename);
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
      src: ['locale/**/*.po'],
      dest: '<%= yeoman.app %>/i18n'
    },
    template: {
      src: ['locale/**/*.pot'],
      dest: '<%= yeoman.tmp %>/i18n'
    }
  });
};


