/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('rev', {
    // These files contain no references to other files and are
    // revved first.
    no_children: {
      //eslint-disable-line camelcase
      files: {
        src: [
          '<%= yeoman.dist %>/scripts/vendor/**/*.js',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/images/apple_app_store_button/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/images/google_play_store_button/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/images/recovery_key/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/fonts/{,*/}*.{woff,woff2,eot,ttf,svg}',
        ],
      },
    },
    // These files contain references to other files and must be
    // revved after internal URLs have been updated or else
    // different revs of the file with different contents
    // can have the same name because the rev was created before
    // internal URLs were updated.
    with_children: {
      //eslint-disable-line camelcase
      files: {
        src: [
          // CSS has references to images and fonts
          '<%= yeoman.dist %>/styles/**/*.css',
        ],
      },
    },
  });
};
