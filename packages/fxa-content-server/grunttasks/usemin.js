/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('useminPrepare', {
    client_rendered: {
      //eslint-disable-line camelcase
      dest: '<%= yeoman.dist %>',
      src: [
        '<%= yeoman.app %>/{,*/}*.html',
        '!<%= yeoman.app %>/tests/{,*/}*.html',
      ],
      type: 'html',
    },
    server_rendered: {
      //eslint-disable-line camelcase
      dest: '<%= yeoman.dist %>',
      options: {
        // root must be specified or else useminPrepare uses the template
        // directory as the root from where to search for assets.
        root: '<%= yeoman.app %>',
        type: 'html',
      },
      src: [
        // Use the already generated locale specific pages as the source.
        '<%= yeoman.page_template_dist %>/{,*/}*.html',
        '!<%= yeoman.page_template_dist %>/{,*/}mocha.html',
      ],
    },
  });

  grunt.config('usemin', {
    css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
    html: [
      '<%= yeoman.dist %>/{,*/}*.html',
      '<%= yeoman.page_template_dist %>/{,*/}*.html',
      '!<%= yeoman.page_template_dist %>/{,*/}mocha.html',
    ],
    options: { assetsDirs: ['<%= yeoman.dist %>'] },
  });
};
