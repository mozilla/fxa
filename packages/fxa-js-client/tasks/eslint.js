/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('eslint', {
    app: {
      eslintrc: '.eslintrc',
      src: ['Gruntfile.js', 'tasks/*.js', 'config/**/*.js', 'node/**/*.js'],
    },
    client: {
      options: { eslintrc: '.eslintrc' },
      src: ['client/*.js', 'client/lib/**/*'],
    },
    test: {
      options: {
        eslintrc: '.eslintrc',
      },
      src: ['tests/**/*.js', '!tests/addons/sinon.js'],
    },
  });
};
