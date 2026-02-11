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
      fallback: {
        ...(customizedConfig.resolve.fallback || {}),
        ...webpack5Fallbacks,
      },
    },
    module: {
      ...customizedConfig.module,
      rules: [
        {
          oneOf: customizedConfig.module.rules[0]['oneOf'].map((x) => {
            if (x.test && x.test.test && x.test.test('.scss')) {
              return {
                ...x,
                include: [path.resolve('../src')],
              };
            }

            return x;
          }),
        },
      ],
    },
  };
};

module.exports = includeSrcForSvgs;
