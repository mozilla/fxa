/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const config = require('./server/lib/configuration').getProperties();
const CopyPlugin = require('copy-webpack-plugin');

const ENV = config.env;
const webpackConfig = {
  mode: ENV,
  context: path.resolve(__dirname, 'app/scripts'),
  entry: {
    app: './app.js',
    appDependencies: [
      'lib/jquery',
      'backbone',
      'chosen-js',
      'cocktail-lib',
      'duration',
      'es6-promise',
      'jquery',
      'js-md5',
      'modal',
      'speed-trap',
      'ua-parser-js',
      'uuid',
      'vat',
      'styles/main.scss',
    ],
    head: './head/boot.js',
  },

  output: {
    crossOriginLoading: 'anonymous',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist', config.jsResourcePath),
    publicPath: `/${config.jsResourcePath}/`,
  },

  resolve: {
    extensions: ['.ts', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'app/scripts'),
      path.resolve(__dirname, 'app/scripts/templates'),
      path.resolve(__dirname, 'app'),
      path.resolve(__dirname, '.tscompiled/scripts'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ],
    alias: {
      '@fxa-components': path.resolve(__dirname, '..', 'fxa-components'),
      '@fxa-shared': path.resolve(__dirname, '..', 'fxa-shared'),
      'asmcrypto.js': path.resolve(
        __dirname,
        'node_modules/asmcrypto.js/asmcrypto.min.js'
      ),
      'chosen-js': path.resolve(
        __dirname,
        'node_modules/chosen-js/public/chosen.jquery'
      ),
      'cocktail-lib': path.resolve(
        __dirname,
        'node_modules/backbone.cocktail/Cocktail'
      ),
      cocktail: path.resolve(__dirname, 'app/scripts/lib/cocktail'),
      draggable: path.resolve(
        __dirname,
        'node_modules/jquery-ui/ui/widgets/draggable'
      ),
      duration: path.resolve(__dirname, 'node_modules/duration-js/duration'),
      'es6-promise': path.resolve(
        __dirname,
        'node_modules/es6-promise/dist/es6-promise'
      ),
      'fast-text-encoding': path.resolve(
        __dirname,
        'node_modules/fast-text-encoding'
      ),
      fxaCryptoDeriver: path.resolve(
        __dirname,
        'node_modules/fxa-crypto-relier/dist/fxa-crypto-relier/fxa-crypto-deriver'
      ),
      fxaPairingChannel: path.resolve(
        __dirname,
        'node_modules/fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js'
      ),
      'base32-decode': path.resolve(
        __dirname,
        'node_modules/base32-decode/index'
      ),
      'js-md5': path.resolve(__dirname, 'node_modules/js-md5/src/md5'),
      mocha: 'mocha/mocha',
      modal: path.resolve(__dirname, 'node_modules/jquery-modal/jquery.modal'),
      sinon: path.resolve(__dirname, 'node_modules/sinon/pkg/sinon'),
      'touch-punch': path.resolve(
        __dirname,
        'node_modules/jquery-ui-touch-punch-amd/jquery.ui.touch-punch'
      ),
      'ua-parser-js': path.resolve(
        __dirname,
        'node_modules/ua-parser-js/src/ua-parser'
      ),
      uuid: path.resolve(__dirname, 'node_modules/node-uuid/uuid'),
      vat: path.resolve(__dirname, 'node_modules/node-vat/vat'),
      '@dannycoates/webcrypto-liner': path.resolve(
        __dirname,
        'node_modules/@dannycoates/webcrypto-liner/build/shim.js'
      ),
    },
  },

  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery',
          },
          {
            loader: 'expose-loader',
            options: '$',
          },
        ],
      },
      {
        test: require.resolve('mocha'),
        use: [
          {
            loader: 'expose-loader',
            options: 'mocha',
          },
        ],
      },
      {
        test: /\.mustache$/,
        loader: ['cache-loader', 'fxa-mustache-loader'],
      },
      {
        test: /\.tsx?$/,
        loader: ['cache-loader', 'awesome-typescript-loader'],
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'app', 'scripts'),
          path.resolve(__dirname, 'app', 'tests'),
        ],
        exclude: [
          path.resolve(__dirname, 'app', 'scripts', 'vendor'),
          path.resolve(__dirname, 'app', 'scripts', 'templates'),
          path.resolve(__dirname, 'node_modules'),
        ],
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'thread-loader',
            options: {
              workers: 4,
            },
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-react', {}],
                '@babel/preset-env',
                '@babel/preset-typescript',
              ],
              plugins: [
                '@babel/syntax-dynamic-import',
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].css',
              outputPath: '../../app/styles',
            },
          },
          {
            loader: 'extract-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      // CommonsChunkPlugin()
      cacheGroups: {
        appDependencies: {
          test: /[\\/]node_modules[\\/]/,
          name: 'appDependencies',
          chunks: 'initial',
        },
      },
    },
  },
  plugins: [
    // dynamically loaded routes cause the .md file to be read and a
    // warning to be displayed on the console. Just ignore them.
    new webpack.IgnorePlugin(/\.md$/),
    new CopyPlugin([
      {
        context: path.resolve(__dirname, '../fxa-settings/build'),
        from: '**',
        to: '../beta/settings',
      },
    ]),
  ],

  stats: { colors: true },

  node: {
    crypto: 'empty',
  },

  devtool: config.sourceMapType,
};

if (ENV === 'development') {
  Object.assign(webpackConfig.entry, {
    test: '../tests/webpack.js',
    testDependencies: ['jquery', 'chai', 'jquery-simulate', 'mocha', 'sinon'],
  });
}

module.exports = webpackConfig;
