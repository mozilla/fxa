/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Single source of truth for resolving the on-disk static asset directories.
// Previously the `path.join(__dirname, '..', ...)` traversal was duplicated
// (with different `..` depths) across fxa-content-server.js, beta-settings.js,
// and the WAICT manifest route - fragile, since moving any of those files or
// changing the dist layout silently broke resolution.

'use strict';
const path = require('path');

// This file lives in server/lib; two levels up is the package root, which is
// what `static_directory` (default `dist`) is configured relative to.
const PACKAGE_ROOT = path.join(__dirname, '..', '..');

/**
 * Absolute path to the directory static files are served from.
 *
 * @param {Object} config convict config
 * @returns {String}
 */
function staticDirectory(config) {
  return path.join(PACKAGE_ROOT, config.get('static_directory'));
}

/**
 * Absolute path to the served fxa-settings build under the static directory.
 *
 * @param {Object} config convict config
 * @returns {String}
 */
function settingsStaticDirectory(config) {
  return path.join(
    staticDirectory(config),
    'settings',
    config.get('static_settings_directory')
  );
}

module.exports = {
  staticDirectory,
  settingsStaticDirectory,
};
