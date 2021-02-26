/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { dirname } = require('path');

module.exports = function (grunt) {
  const TEMP_DIR = '.tmp';
  const TEMPLATE_ROOT = 'server/templates';
  const LEGAL_DOCS_ROOT = dirname(require.resolve('legal-docs/package.json'));

  grunt.config('yeoman', {
    /*eslint-disable camelcase */
    app: 'app',
    dist: 'dist',
    es5: '.es5',
    page_template_dist: TEMPLATE_ROOT + '/pages/dist',
    page_template_src: TEMPLATE_ROOT + '/pages/src',
    pp_html_dest: TEMPLATE_ROOT + '/pages/dist/privacy',
    pp_md_src: LEGAL_DOCS_ROOT,
    server: 'server',
    strings_dist: 'locale',
    strings_src: 'fxa-content-server-l10n/locale',
    tests: 'tests',
    tmp: TEMP_DIR,
    tos_html_dest: TEMPLATE_ROOT + '/pages/dist/terms',
    tos_md_src: LEGAL_DOCS_ROOT,
    // Translated TOS/PP agreements.
    tos_pp_repo_dest: LEGAL_DOCS_ROOT,
  });
};
