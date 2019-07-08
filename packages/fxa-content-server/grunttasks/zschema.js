/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('zschema', {
    locales: {
      files: {
        '<%= yeoman.tmp %>/i18n/schemas/client-schema.json': [
          '<%= yeoman.app %>/i18n/**/client.json',
        ],
        '<%= yeoman.tmp %>/i18n/schemas/server-schema.json': [
          '<%= yeoman.app %>/i18n/**/server.json',
        ],
      },
    },
    options: { noExtraKeywords: true },
  });
};
