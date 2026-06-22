/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Generate the WAICT integrity manifest from the built artifacts. The manifest
// maps every first-party script's served URL to the SHA-256 hash of its bytes.
//
// This must run at the very end of the build (after `copy:settings`) so that
// `dist` contains both the content-server bundles and the copied fxa-settings
// bundles - WAICT report mode covers the whole origin's scripts.
//
// See https://github.com/waict-wg/waict-integrity-spec.

'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = function (grunt) {
  // Frontend unit-test bundles are only emitted in development and are not
  // part of any shipped page.
  const TEST_BUNDLE = /\/(test|testDependencies)\.bundle(\.|\b)/;

  /**
   * Determine which fxa-settings build under dist/settings is actually served
   * at /settings. Content-server serves `static_settings_directory` (default
   * `prod`), but a given build only emits one env (e.g. a dev build produces
   * dist/settings/dev). Honor the env var if set, otherwise use the single
   * built directory, falling back to the server config default.
   *
   * @param {String} dist absolute path to the dist directory
   * @returns {String}
   */
  function resolveSettingsDirectory(dist) {
    if (process.env.STATIC_SETTINGS_DIRECTORY) {
      return process.env.STATIC_SETTINGS_DIRECTORY;
    }

    let envDirs = [];
    try {
      const settingsRoot = path.join(dist, 'settings');
      envDirs = fs
        .readdirSync(settingsRoot)
        .filter((entry) =>
          fs.statSync(path.join(settingsRoot, entry)).isDirectory()
        );
    } catch (e) {
      // No dist/settings directory; nothing to resolve.
    }

    return envDirs.length === 1 ? envDirs[0] : 'prod';
  }

  /**
   * Map a dist-relative path to the URL the browser requests it from, or
   * return null if the file is not served.
   *
   * @param {String} distRelative forward-slash path relative to dist
   * @param {String} settingsDirectory the served fxa-settings env directory
   * @returns {String|null}
   */
  function toServedUrl(distRelative, settingsDirectory) {
    if (distRelative.indexOf('settings/') === 0) {
      // settings/<env>/<rest> -> /settings/<rest>, but only for the served env.
      const withoutPrefix = distRelative.slice('settings/'.length);
      const slash = withoutPrefix.indexOf('/');
      if (slash === -1) {
        return null;
      }
      const env = withoutPrefix.slice(0, slash);
      if (env !== settingsDirectory) {
        return null;
      }
      return '/settings/' + withoutPrefix.slice(slash + 1);
    }

    return '/' + distRelative;
  }

  grunt.registerTask(
    'waict-manifest',
    'Generate the WAICT integrity manifest of served script hashes',
    function () {
      const dist = grunt.config.get('yeoman.dist');
      const settingsDirectory = resolveSettingsDirectory(dist);
      const hashes = {};
      let count = 0;

      grunt.file
        .expand({ cwd: dist }, '**/*.js')
        .forEach(function (relative) {
          const distRelative = relative.split(path.sep).join('/');
          if (TEST_BUNDLE.test('/' + distRelative)) {
            return;
          }

          const servedUrl = toServedUrl(distRelative, settingsDirectory);
          if (!servedUrl) {
            return;
          }

          const bytes = grunt.file.read(path.join(dist, relative), {
            encoding: null,
          });
          // WAICT v1 always uses SHA-256, base64-encoded (matching SRI's
          // `sha256-<base64>` convention but without the algorithm prefix).
          hashes[servedUrl] = crypto
            .createHash('sha256')
            .update(bytes)
            .digest('base64');
          count++;
        });

      const manifest = { hashes };
      const dest = path.join(dist, 'waict-manifest.json');
      grunt.file.write(dest, JSON.stringify(manifest, null, 2));
      grunt.log.writeln(
        'Wrote WAICT manifest with ' + count + ' script hashes to ' + dest
      );
    }
  );
};
