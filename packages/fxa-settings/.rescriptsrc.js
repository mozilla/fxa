/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper,
} = require('fxa-react/configs/rescripts');

function loadServerConfig(config) {
  const serverConfig = require('../fxa-content-server/server/lib/configuration');

  // CRA already uses the interpolate-html-plugin, so let's
  // add our server config replacement string to it.
  config.plugins.forEach((plugin) => {
    if (
      plugin.constructor &&
      plugin.constructor.name === 'InterpolateHtmlPlugin'
    ) {
      plugin.replacements['SERVER_CONFIG'] = encodeURIComponent(
        JSON.stringify(serverConfig)
      );
    }
  });

  return config;
}

module.exports = [
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper,
  loadServerConfig,
];
