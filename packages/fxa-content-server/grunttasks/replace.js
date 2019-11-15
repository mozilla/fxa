/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('replace', {
    // eslint-disable-next-line camelcase
    tos_pp: {
      overwrite: true,
      replacements: [
        {
          from: /{:\s.*?\s}/g,
          to: '',
        },
        {
          from: /^#\s.*?\n$/m,
          to: '',
        },
        {
          // sometimes provided legal docs have extra indent before links and headings
          // such as `    [`, this creates a <code> block when parsed by remarkable
          // to avoid that we remove the indent spaces

          // ref: https://github.com/mozilla/legal-docs/blob/master/firefox_privacy_notice/en-US.md
          from: /^ {4}/gm,
          to: '',
        },
      ],
      src: ['<%= yeoman.pp_md_src %>/*.md', '<%= yeoman.tos_md_src %>/*.md'],
    },
  });
};
