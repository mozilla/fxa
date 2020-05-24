/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// meta grunt task to run other .po lint scripts.

// This task verifies the values in the `app/i18n/**/*.json` files contain key
// values and all the required properties from the .POT files. This should fail
// the build/task if the locale JSON file values aren't string values or if
// required properties from the .POT files are missing.
//
// NOTE: It won't complain if you add extra keys to the JSON files.
//
// The task does the following actions:
//
// 0. Runs each of the /app/i18n/**/.json files through JSONLint.
//
// 1. Converts the `/locale/templates/LC_MESSAGES/{client,server}.pot` files to
// `/.tmp/i18n/templates/{client,server}.pot.json` (via the existing po2json task).
//
// 2. Converts the `{client,server}.pot.json` files to z-schema happy schemas
// (via the new localeschema Grunt task).
//
// 3. Lints the `/app/i18n/**/{client,server}.json` files against the proper
// schemas created in step 2 (via the new zschema task and grunt-z-schema module).

module.exports = function (grunt) {
  grunt.registerTask('polint', [
    'jsonlint:i18n',
    'po2json:template',
    'localeschema',
    'zschema',
  ]);
};
