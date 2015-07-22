/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('rev', {
    dist: {
      files: {
        src: [
          '<%= yeoman.dist %>/bower_components/**/*.js',
          '!<%= yeoman.dist %>/bower_components/jquery-ui/**/*.js',
          '!<%= yeoman.dist %>/bower_components/fxa-password-strength-checker/**/*.js',
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/images/apple_app_store_button/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= yeoman.dist %>/images/google_play_store_button/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/fonts/{,*/}*.{woff,svg,ofl,eot,ttf}'
        ]
      }
    }
  });
};
