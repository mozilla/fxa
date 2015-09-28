/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('htmllint', {
    dist: {
      options: {
        'attr-name-style': 'dash',
        'attr-no-dup': true,
        'attr-no-unsafe-char': true,
        'attr-quote-style': 'quoted',
        'doctype-html5': true,
        'id-class-style': 'dash',
        'indent-style': 'spaces',
        'indent-width': 0,
        'tag-name-lowercase': true,
        'tag-name-match': true
      },
      src: ['<%= yeoman.page_template_dist %>/*/*.html']
    },
    l10n: {
      options: { htmllintrc: '.htmllintrc' },
      src: ['<%= yeoman.tmp %>/i18n/*/*.html']
    }
  });
};
