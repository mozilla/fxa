/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// task to take care of generating connect-fonts CSS and copying font files.

// Locale specific font css are created `app/styles/fonts/<locale>.css`
// fonts care copied from npm packages into app/fonts

module.exports = function (grunt) {
  'use strict';

  var path = require('path');
  var i18n = require('i18n-abide');

  var fontPacks = [
    'connect-fonts-clearsans',
    'connect-fonts-firasans'
  ];

  var fontNamesNeeded = [
    'clearsans-regular',
    'firasans-regular',
    'firasans-light'
  ];

  grunt.task.renameTask('connect_fonts', 'do_connect_fonts');

  grunt.task.registerTask('connect_fonts',
      'configure connect fonts based on the currently selected config',
      function () {
        // server config is not available on startup and is set in the
        // selectconfig task. configure_connect_fonts should be run after
        // selectconfig and before connect_fonts.
        var fontsDisabled = grunt.config.get('server.i18n.fonts.unsupportedLanguages');
        var supportedLanguages = grunt.config.get('server.i18n.supportedLanguages')
                                  .filter(function (lang) {
                                    return fontsDisabled.indexOf(lang) === -1;
                                  });

        grunt.config('do_connect_fonts', {
          dist: {
            options: {
              fontPacks: fontPacks,
              fontNames: fontNamesNeeded,
              // languages will be configured in configure_connect_fonts
              languages: supportedLanguages,
              dest: '<%= yeoman.app %>/styles/fonts',
              destFileName: function (root, language) {
                // items on disk are stored by locale, not language.
                return path.join(root, i18n.localeFrom(language) + '.css');
              }
            }
          }
        });

        grunt.task.run(['do_connect_fonts']);
      });

  grunt.config('connect_fonts_copy', {
    dist: {
      options: {
        fontPacks: fontPacks,
        dest: '<%= yeoman.app %>/fonts'
      }
    }
  });
};
