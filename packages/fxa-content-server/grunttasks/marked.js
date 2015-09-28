/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto');
var path = require('path');
var i18n = require('i18n-abide');
var marked = require('marked');

var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
  // Avoid invalid characters in the heading ID by hashing the text
  var digest = crypto.createHash('md5').update(text).digest('hex');

  var h = '<h' + level + ' id="h' + level + digest + '">' + text + '</h' + level + '>';
  return h;
};

module.exports = function (grunt) {
  // convert localized TOS/PP agreements from markdown to html partials.

  function rename(destPath, destFile) {
    // Normalize the filenames to use the locale name.
    var lang = destFile.replace('.md', '');
    return path.join(destPath, i18n.localeFrom(lang) + '.html');
  }

  grunt.config('marked', {
    options: {
      breaks: true,
      gfm: true,
      renderer: renderer,
      sanitize: false
    },
    tos_pp: { //eslint-disable-line camelcase
      files: [
        {
          cwd: '<%= yeoman.pp_md_src %>',
          dest: '<%= yeoman.pp_html_dest %>',
          expand: true,
          rename: rename,
          src: ['**/*.md']
        },
        {
          cwd: '<%= yeoman.tos_md_src %>',
          dest: '<%= yeoman.tos_html_dest %>',
          expand: true,
          rename: rename,
          src: ['**/*.md']
        }
      ]
    }
  });
};
