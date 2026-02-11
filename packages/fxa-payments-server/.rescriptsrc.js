/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  permitAdditionalJSImports,
  suppressRuntimeErrorOverlay,
  configureDevServerCompression,
  setModuleNameMapper,
} = require('fxa-react/configs/rescripts');
const tsconfigBase = require('../../tsconfig.base.json')

module.exports = {
  webpack: permitAdditionalJSImports,
  devServer: (config) => {
    let newConfig = suppressRuntimeErrorOverlay(config);
    newConfig = configureDevServerCompression(newConfig);
    return newConfig;
  },
  jest: setModuleNameMapper(tsconfigBase),
};
