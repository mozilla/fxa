/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('todo', {
    options: {
      marks: [{
        name: 'FIX',
        pattern: /FIXME/,
        color: 'red'
      },
      {
        name: 'TODO',
        pattern: /TODO/,
        color: 'yellow'
      },
      {
        name: 'NOTE',
        pattern: /NOTE/,
        color: 'blue'
      }, {
        name: 'XXX',
        pattern: /XXX/,
        color: 'yellow'
      }, {
        name: 'HACK',
        pattern: /HACK/,
        color: 'red'
      }]
    },
    app: {
      files: {
        src: [
          '<%= yeoman.app %>/**/*.{js,css,scss,html}',
          '!<%= yeoman.app %>/bower_components/**',
          '!<%= yeoman.app %>/scripts/vendor/**',
          'grunttasks/*.js',
          'scripts/*.js',
          'server/**/*.{js,css,html}',
          '<%= yeoman.tests %>/**/*.js',

          // This one is triggering some locale false positives.
          '!server/templates/pages/dist/**',

          // ignore this file, lest we get oodles of false positives.
          '!grunttasks/todo.js'
        ]
      }
    }
  });
};
