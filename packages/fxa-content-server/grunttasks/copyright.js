/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('copyright', {
    app: {
      options: {
        pattern: /This Source Code Form is subject to the terms of the Mozilla Public/,
      },
      src: [
        '{,<%= yeoman.app %>/**/,grunttasks/**/,scripts/**/,server/**/,tests/**/}*.js',
        '!<%= yeoman.app %>/scripts/vendor/**',
      ],
    },
  });
};
