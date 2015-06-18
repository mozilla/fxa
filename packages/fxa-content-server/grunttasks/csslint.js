/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('csslint', {
    strict: {
      options: {
        'adjoining-classes': 0,
        'box-model': 0,
        'box-sizing': 0,
        'compatible-vendor-prefixes': 0,
        'duplicate-background-images': 0,
        'errors': 0,
        'ids': 0,
        'import': 2,
        'important': 0,
        'outline-none': 0,
        'overqualified-elements': 0,
        'qualified-headings': 0,
        'regex-selectors': 0,
        'unique-headings': 0,
        'universal-selector': 0,
        'unqualified-attributes': 0,
        'zero-units': 0
      },
      src: ['<%= yeoman.app %>/styles/**/*.css']
    }
  });
};
