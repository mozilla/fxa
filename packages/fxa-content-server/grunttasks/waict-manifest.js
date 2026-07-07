/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Generate the WAICT integrity manifest from the built artifacts.

'use strict';
const fs = require('fs');
const path = require('path');
const {
  pickSettingsDirectory,
  buildManifest,
} = require('../server/lib/waict-manifest-builder');

module.exports = function (grunt) {
  /**
   * Determine which fxa-settings build under dist/settings is actually served
   * at /settings. Content-server serves `static_settings_directory` (default
   * `prod`), but a given build only emits one env (e.g. a dev build produces
   * dist/settings/dev). Honor the env var if set, otherwise use the single
   * built directory, warning if it can't be uniquely resolved.
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

    if (envDirs.length !== 1) {
      grunt.log.error(
        'waict-manifest: could not uniquely resolve the served settings dir ' +
          '(found ' +
          envDirs.length +
          '); defaulting to prod. Settings scripts may be omitted from the ' +
          'manifest if that is not the served env.'
      );
    }

    return pickSettingsDirectory(envDirs, undefined, 'prod');
  }

  grunt.registerTask(
    'generate-waict-manifest',
    'Generate the WAICT integrity manifest of served script hashes',
    function () {
      const dist = grunt.config.get('yeoman.dist');
      const settingsDirectory = resolveSettingsDirectory(dist);

      // Hints emitted by the fxa-settings build (scripts/build.js), carried in
      // by copy:settings. `baseUrl` is the origin settings scripts are served
      // from (CDN for stage/prod, '' for same-origin dev); `assets` declares
      // cache-busted public/ scripts by basename so their volatile ?v= URL is
      // handled per its mode. Contract shared with waict-manifest-builder.js.
      const { baseUrl: settingsBaseUrl, assets: publicAssets } = (function () {
        const sidecar = path.join(
          dist,
          'settings',
          settingsDirectory,
          'waict-public-assets.json'
        );
        try {
          const parsed = JSON.parse(fs.readFileSync(sidecar, 'utf8'));
          // New shape is { baseUrl, assets }; tolerate an older flat map.
          if (parsed && parsed.assets) {
            return { baseUrl: parsed.baseUrl || '', assets: parsed.assets };
          }
          return { baseUrl: '', assets: parsed || {} };
        } catch (e) {
          return { baseUrl: '', assets: {} };
        }
      })();

      const files = grunt.file
        .expand({ cwd: dist }, '**/*.js')
        .map((relative) => relative.split(path.sep).join('/'));

      const { manifest, count } = buildManifest({
        files,
        readBytes: (distRelative) =>
          grunt.file.read(path.join(dist, distRelative), { encoding: null }),
        settingsDirectory,
        settingsBaseUrl,
        publicAssets,
        warn: (msg) => grunt.log.error(msg),
      });

      const dest = path.join(dist, 'waict-manifest.json');
      grunt.file.write(dest, JSON.stringify(manifest, null, 2));
      grunt.log.writeln(
        'Wrote WAICT manifest with ' +
          count +
          ' script hashes (' +
          manifest.any_hashes.length +
          ' url-agnostic) to ' +
          dest
      );
    }
  );
};
