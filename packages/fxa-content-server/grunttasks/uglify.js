/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to uglify all the js.

module.exports = function (grunt) {
  var banner =
    '/*! <%= pkg.name %>@<%= pkg.version %> -- <%= grunt.template.today() %>\n' +
    ' *\n' +
    ' * Git sha: <%= githash.main.hash %>\n' +
    ' *\n' +
    ' * This Source Code Form is subject to the terms of the Mozilla Public\n' +
    ' * License, v. 2.0. If a copy of the MPL was not distributed with this\n' +
    ' * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n' +
    ' *\n' +
    ' * For more information, see https://github.com/mozilla/fxa-content-server/\n' +
    ' */\n';

  /**
   * Uglify all of the scripts in the dist directory
   */
  grunt.config('uglify', {
    dist: {
      files: [{
        cwd: '<%= yeoman.tmp %>/scripts',
        dest: '<%= yeoman.dist %>/scripts',
        expand: true,
        src: ['**/*.js']
      }]
    },
    options: {
      banner: banner,
      sourceMap: true
    }
  });
};
