/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const customizeWebpackConfig =
  require('fxa-react/configs/storybooks').customizeWebpackConfig;

const webpack5Fallbacks = {
  stream: false,
  timers: false,
  http: false,
  https: false,
  zlib: false,
};

const includeSrcForSvgs = ({ config }) => {
  const customizedConfig = customizeWebpackConfig({ config });

  return {
    ...customizedConfig,
    resolve: {
      ...customizedConfig.resolve,
      alias: {
        ...(customizedConfig.resolve.alias || {}),
        // nock is Node.js-only; test-utils.tsx imports it at the top level
        // but stories only use pure utilities (deepCopy, wait) from that file.
        nock: path.resolve(__dirname, 'nock-stub.js'),
      },
      fallback: {
        ...(customizedConfig.resolve.fallback || {}),
        ...webpack5Fallbacks,
      },
    },
  };
};

module.exports = includeSrcForSvgs;
