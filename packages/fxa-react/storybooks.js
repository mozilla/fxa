const { resolve } = require('path');

const additionalJSImports = {
  'fxa-react': __dirname,
  'fxa-shared': resolve(__dirname, '../fxa-shared'),
};

const customizeWebpackConfig = ({ config, mode }) => {
  // https://storybook.js.org/docs/configurations/typescript-config/#setting-up-typescript-to-work-with-storybook-1
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  });
  config.resolve.extensions.push('.ts', '.tsx');

  config.module.rules.push({
    test: /\.s[ac]ss$/i,
    use: [
      // Creates `style` nodes from JS strings
      'style-loader',
      // Translates CSS into CommonJS
      'css-loader',
      // Compiles Sass to CSS
      'sass-loader',
    ],
  });
  config.resolve.extensions.push('.scss', '.css');

  config.resolve.alias = Object.assign(
    config.resolve.alias,
    additionalJSImports
  );

  return config;
};

module.exports = {
  customizeWebpackConfig,
};
