/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { resolve } = require('path');

const additionalJSImports = {
  'fxa-react': resolve(__dirname, '../'),
  'fxa-shared': resolve(__dirname, '../../fxa-shared'),
};

const customizeWebpackConfig = ({ config, mode }) => {
  // TypeScript loading
  // https://bit.ly/fxa-storybook-ts
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  });

  // SCSS loading
  config.module.rules.push({
    test: /\.s[ac]ss$/i,
    use: ['style-loader', 'css-loader', 'sass-loader'],
  });

  // CSS loading
  // Our various projects have differing CSS loading implementations;
  // this aims to provide cross-project support
  const cssRuleIndex = config.module.rules.findIndex(({ test }) =>
    test.test('.css')
  );
  const cssLoader = {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  };
  if (cssRuleIndex > -1) {
    config.module.rules[cssRuleIndex] = cssLoader;
  } else {
    config.module.rules.push(cssLoader);
  }

  // SVG loading
  // Our various projects have differing SVG loading implementations;
  // this aims to provide cross-project support
  let svgLoader;
  const svgRule = config.module.rules.find(({ test }) => test.test('.svg'));
  if (svgRule) {
    svgLoader = {
      loader: svgRule.loader,
      options: svgRule.options || svgRule.query,
    };
  } else {
    svgLoader = {
      loader: require.resolve('file-loader'),
      options: { name: 'static/media/[name].[hash:8].[ext]' },
    };
  }
  config.module.rules.unshift({
    test: /\.svg$/,
    use: ['@svgr/webpack', svgLoader],
  });

  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf)$/,
    loader: require.resolve('file-loader'),
  });

  config.resolve.extensions.push('.ts', '.tsx', '.svg', '.scss', '.css');
  config.module.rules = [{ oneOf: config.module.rules }];
  config.resolve.alias = Object.assign(
    config.resolve.alias,
    additionalJSImports
  );

  return config;
};

module.exports = {
  customizeWebpackConfig,
};
