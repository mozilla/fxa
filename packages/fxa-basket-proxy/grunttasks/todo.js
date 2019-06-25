/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('todo', {
    options: {
      marks: [
        {
          name: 'FIX',
          pattern: /FIXME/,
          color: 'red',
        },
        {
          name: 'TODO',
          pattern: /TODO/,
          color: 'yellow',
        },
        {
          name: 'NOTE',
          pattern: /NOTE/,
          color: 'blue',
        },
        {
          name: 'XXX',
          pattern: /XXX/,
          color: 'yellow',
        },
        {
          name: 'HACK',
          pattern: /HACK/,
          color: 'red',
        },
      ],
    },
    app: {
      files: {
        src: [
          '<%= eslint.files %>',
          // ignore this file, lest we get oodles of false positives.
          '!grunttasks/todo.js',
        ],
      },
    },
  });
};
