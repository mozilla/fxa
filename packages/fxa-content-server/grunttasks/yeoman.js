/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('yeoman', {
    app: 'app',
    dist: 'dist',
    server: 'fxa-auth-server',
    page_template_src: 'server/templates/pages/src',
    page_template_dist: 'server/templates/pages/dist',
    strings_src: 'app/bower_components/fxa-content-server-l10n/locale',
    strings_dist: 'locale',
    tests: 'tests',
    tmp: '.tmp'
  });
};
