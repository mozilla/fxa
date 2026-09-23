/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const devServer = require('./webpackDevServer.config');

const appDirectory = path.resolve(__dirname, '..');
// The app imports from sibling packages and from libs, so both trees must go
// through babel-loader, not just src.
const allPackages = path.resolve(appDirectory, '..');
const allLibs = path.resolve(appDirectory, '../../libs');

const isProduction = process.env.NODE_ENV === 'production';
// The admin server can serve the bundle from another origin, so the public path
// comes from PUBLIC_URL. webpack needs a trailing slash.
const publicPath = `${(process.env.PUBLIC_URL || '/').replace(/\/$/, '')}/`;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  context: appDirectory,
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(appDirectory, 'build'),
    publicPath,
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(appDirectory, 'tsconfig.json'),
      }),
    ],
    // Shared code references node built-ins that the browser bundle never runs.
    fallback: { fs: false, path: false },
  },
  module: {
    rules: [
      {
        // An SVG is both a URL (default import) and a component (ReactComponent
        // named import). file-loader gives the URL, SVGR gives the component.
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: require.resolve('@svgr/webpack'),
            options: {
              prettier: false,
              svgo: false,
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: require.resolve('file-loader'),
            options: { name: 'static/media/[name].[hash:8].[ext]' },
          },
        ],
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [allPackages, allLibs],
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {
          // Many components use JSX without importing React.
          presets: [
            [
              require.resolve('babel-preset-react-app'),
              { runtime: 'automatic' },
            ],
          ],
          plugins: isProduction ? [] : [require.resolve('react-refresh/babel')],
          cacheDirectory: true,
          cacheCompression: false,
        },
      },
      {
        test: /\.css$/,
        use: [
          isProduction
            ? MiniCssExtractPlugin.loader
            : require.resolve('style-loader'),
          // build-css already runs the stylesheet through postcss.
          require.resolve('css-loader'),
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', globOptions: { ignore: ['**/index.html'] } },
      ],
    }),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
      }),
    !isProduction && new ReactRefreshWebpackPlugin({ overlay: false }),
  ].filter(Boolean),
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  performance: false,
  devServer: devServer(publicPath),
};
