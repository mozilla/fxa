/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  var TEMP_DIR = '.tmp';
  var TEMPLATE_ROOT = 'server/templates';
  var TOS_PP_REPO_ROOT = 'app/bower_components/tos-pp';

  grunt.config('yeoman', {
    app: 'app',
    dist: 'dist',
    server: 'fxa-auth-server',
    page_template_src: TEMPLATE_ROOT + '/pages/src',
    page_template_dist: TEMPLATE_ROOT + '/pages/dist',
    strings_src: 'app/bower_components/fxa-content-server-l10n/locale',
    strings_dist: 'locale',
    tests: 'tests',
    tmp: TEMP_DIR,
    // Translated TOS/PP agreements.
    tos_pp_repo_dest: TOS_PP_REPO_ROOT,
    tos_md_src: TOS_PP_REPO_ROOT + '/firefox_online_services_ToS/',
    tos_html_dest: TEMPLATE_ROOT + '/terms',
    pp_md_src: TOS_PP_REPO_ROOT + '/firefox_online_services_PrivacyNotice/',
    pp_html_dest: TEMPLATE_ROOT + '/privacy'
  });
};
