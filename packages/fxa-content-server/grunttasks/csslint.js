/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('csslint', {
    strict: {
      options: {
        'box-model': 0,
        'compatible-vendor-prefixes': 0,
        'errors': 0,
        'ids': 0,
        'import': 2,
        'important': 1,
        'qualified-headings': 0,
        'unique-headings': 0,
        'universal-selector': 0,
        'zero-units': 0
      },
      src: ['app/styles/**/*.css']
    }

    // options: {
    // },
    // styles: {
    //   src: [
    //     '<%= yeoman.app %>/styles/{,*/}*.js'
    //   ]
    // }
  });
};
