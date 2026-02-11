/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  const TEMP_DIR = '.tmp';
  const TEMPLATE_ROOT = 'server/templates';

  grunt.config('yeoman', {
    /*eslint-disable camelcase */
    app: 'app',
    dist: 'dist',
    es5: '.es5',
    page_template_dist: TEMPLATE_ROOT + '/pages/dist',
    page_template_src: TEMPLATE_ROOT + '/pages/src',
    server: 'server',
    strings_dist: 'locale',
    strings_src: '../../external/l10n/locale',
    tests: 'tests',
    tmp: TEMP_DIR,
  });
};
