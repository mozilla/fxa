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
      'jquery',
      'js-md5',
      'modal',
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
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      'process/browser': require.resolve('process/browser'),
      zlib: require.resolve('browserify-zlib'),
    },
    modules: [
      path.resolve(__dirname, 'app/scripts'),
      path.resolve(__dirname, 'app/scripts/templates'),
      path.resolve(__dirname, 'app'),
      path.resolve(__dirname, '.tscompiled/scripts'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ],
    alias: {
      'asmcrypto.js': require.resolve('asmcrypto.js/asmcrypto.min.js'),
      'chosen-js': require.resolve('chosen-js/public/chosen.jquery'),
      'cocktail-lib': require.resolve('backbone.cocktail/Cocktail'),
      cocktail: require.resolve('./app/scripts/lib/cocktail'),
      draggable: require.resolve('jquery-ui/ui/widgets/draggable'),
      duration: require.resolve('duration-js/duration'),
      'fast-text-encoding': require.resolve('fast-text-encoding'),
      fxaCryptoDeriver: path.resolve(
        __dirname,
        '../../dist/libs/vendored/crypto-relier/src/lib/deriver/index.js'
      ),
      fxaPairingChannel: require.resolve(
        'fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js'
      ),
      'base32-decode': require.resolve('base32-decode/index'),
      'js-md5': require.resolve('js-md5/src/md5'),
      mocha: 'mocha/mocha',
      modal: require.resolve('jquery-modal/jquery.modal'),
      sinon: require.resolve('sinon/pkg/sinon'),
      'touch-punch': require.resolve(
        'jquery-ui-touch-punch-amd/jquery.ui.touch-punch'
      ),
      'ua-parser-js': require.resolve('ua-parser-js/src/ua-parser'),
      uuid: require.resolve('node-uuid/uuid'),
      vat: require.resolve('node-vat/vat'),
      'fxa-auth-client/browser': require.resolve('fxa-auth-client/browser'),
    },
  },

  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: {
              exposes: {
                globalName: 'jQuery',
                override: true,
              },
            },
          },
          {
            loader: 'expose-loader',
            options: {
              exposes: {
                globalName: '$',
                override: true,
              },
            },
          },
        ],
      },
      {
        test: require.resolve('mocha'),
        use: [
          {
            loader: 'expose-loader',
            options: {
              exposes: 'mocha',
            },
          },
        ],
      },
      {
        test: /\.mustache$/,
        use: [{ loader: 'cache-loader' }, { loader: 'fxa-mustache-loader' }],
      },
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'cache-loader' },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'app', 'scripts'),
          path.resolve(__dirname, 'app', 'tests'),
        ],
        exclude: [
          path.resolve(__dirname, 'app', 'scripts', 'templates'),
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '..', '..', 'node_modules'),
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
              babelrc: false,
              cacheDirectory: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      firefox: '60',
                      edge: '16',
                    },
                    corejs: 3,
                    include: [
                      // these are all for edge - setting the target isn't enough
                      '@babel/plugin-transform-classes',
                      '@babel/plugin-transform-destructuring',
                      '@babel/plugin-transform-spread',
                      '@babel/plugin-proposal-object-rest-spread',
                    ],
                    useBuiltIns: 'entry',
                  },
                ],
                ['@babel/preset-react', {}],
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
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/inline',
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
            loader: 'sass-loader',
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },

  plugins: [
    // dynamically loaded routes cause the .md file to be read and a
    // warning to be displayed on the console. Just ignore them.
    new webpack.IgnorePlugin({ resourceRegExp: /\.md$/ }),
    new CopyPlugin({
      patterns: [
        {
          context: path.resolve(__dirname, '../fxa-settings/build'),
          from: '**',
          to: '../settings',
        },
      ],
    }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],

  stats: { colors: true },

  devtool: config.sourceMapType,
};

if (ENV === 'development') {
  Object.assign(webpackConfig.entry, {
    test: '../tests/webpack.js',
    testDependencies: ['jquery', 'chai', 'jquery-simulate', 'mocha', 'sinon'],
  });
}

if (ENV === 'production') {
  webpackConfig.cache = {
    type: 'filesystem',
  };
}

module.exports = webpackConfig;
