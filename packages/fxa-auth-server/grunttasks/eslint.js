/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function(grunt) {
  grunt.config('eslint', {
    app: {
      src: [
        '{,bin/,config/,grunttasks/,lib/**/,scripts/**/,test/**/}*.js',
        '{fxa-oauth-server/bin/**/,fxa-oauth-server/lib/**/,fxa-oauth-server/test/**/,fxa-oauth-server/scripts/**/}*.js',
      ],
    },
  });
  grunt.registerTask('quicklint', 'lint the modified files', 'newer:eslint');
};
