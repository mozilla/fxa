/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('jsonlint', {
    app: {
      src: [
        '{,<%= yeoman.app %>/**/}*.json',
        '!tsconfig.json',
        '!<%= yeoman.app %>/i18n/**',
        '!<%= yeoman.app %>/scripts/vendor/**',
        '!<%= yeoman.app %>/tests/**',
      ],
    },
    config: {
      src: ['.eslintrc'],
    },
    i18n: { src: ['<%= yeoman.app %>/i18n/**/*.json'] },
  });
};
