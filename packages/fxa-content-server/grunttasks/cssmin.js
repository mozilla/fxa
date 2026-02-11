/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('cssmin', {
    // This task is pre-configured if you do not wish to use Usemin
    // blocks for your CSS. By default, the Usemin block from your
    // `index.html` will take care of minification, e.g.
    //
    //     <!-- build:css({.tmp,app}) styles/main.css -->
    //
    // dist: {
    //     files: {
    //         '<%= yeoman.dist %>/styles/main.css': [
    //             '.tmp/styles/{,*/}*.css',
    //             '<%= yeoman.app %>/styles/{,*/}*.css'
    //         ]
    //     }
    // }
  });
};
