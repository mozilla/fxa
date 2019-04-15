/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable */
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HappyPack = require('happypack');
const path = require('path');
const config = require('./server/lib/configuration').getProperties();

const ENV = config.env;
const webpackConfig = {
  mode: ENV,
  context: path.resolve(__dirname, 'app/scripts'),
  entry: {
    app: './app.js',
    appDependencies: [
      'lib/jquery',
      'backbone',
      'canvasToBlob',
      'cocktail-lib',
      'duration',
      'es6-promise',
      'jquery',
      'mailcheck',
      'js-md5',
      'modal',
      'raven',
      'speed-trap',
      'ua-parser-js',
      'uuid',
      'vat',
      'webrtc',
      'styles/main.scss'
    ],
    head: './head/boot.js'
  },

  output: {
    crossOriginLoading: 'anonymous',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist', config.jsResourcePath),
    publicPath: `/${config.jsResourcePath}/`
  },

  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve(__dirname, 'app/scripts'),
      path.resolve(__dirname, 'app/scripts/templates'),
      path.resolve(__dirname, 'app'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ],
    alias: {
      canvasToBlob: path.resolve(__dirname, 'node_modules/blueimp-canvas-to-blob/js/canvas-to-blob'),
      'cocktail-lib': path.resolve(__dirname, 'node_modules/backbone.cocktail/Cocktail'),
      cocktail: path.resolve(__dirname, 'app/scripts/lib/cocktail'),
      draggable: path.resolve(__dirname, 'node_modules/jquery-ui/ui/widgets/draggable'),
      duration: path.resolve(__dirname, 'node_modules/duration-js/duration'),
      'es6-promise': path.resolve(__dirname, 'node_modules/es6-promise/dist/es6-promise'),
      fxaClient: 'fxa-js-client/client/FxAccountClient',
      fxaCryptoDeriver: path.resolve(__dirname, 'node_modules/fxa-crypto-relier/dist/fxa-crypto-relier/fxa-crypto-deriver'),
      fxaPairingChannel: path.resolve(__dirname, 'node_modules/fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js'),
      'base32-decode': path.resolve(__dirname, 'node_modules/base32-decode/index'),
      // jwcrypto is used by the main app and only contains DSA
      // jwcrypto.rs is used by the unit tests to unbundle and verify
      // assertions, which require RSA.
      jwcrypto: path.resolve(__dirname, 'app/scripts/vendor/jwcrypto/jwcrypto.ds'),
      'jwcrypto.rs': path.resolve(__dirname, 'app/scripts/vendor/jwcrypto/jwcrypto.rs'),
      mailcheck: path.resolve(__dirname, 'node_modules/mailcheck/src/mailcheck'),
      'js-md5': path.resolve(__dirname, 'node_modules/js-md5/src/md5'),
      mocha: 'mocha/mocha',
      modal: path.resolve(__dirname, 'node_modules/jquery-modal/jquery.modal'),
      raven: path.resolve(__dirname, 'node_modules/raven-js/dist/raven'),
      sinon: path.resolve(__dirname, 'node_modules/sinon/pkg/sinon'),
      'touch-punch': path.resolve(__dirname, 'node_modules/jquery-ui-touch-punch-amd/jquery.ui.touch-punch'),
      'ua-parser-js': path.resolve(__dirname, 'node_modules/ua-parser-js/src/ua-parser'),
      uuid: path.resolve(__dirname, 'node_modules/node-uuid/uuid'),
      vat: path.resolve(__dirname, 'node_modules/node-vat/vat'),
      webrtc: path.resolve(__dirname, 'node_modules/webrtc-adapter-test/adapter')
    }
  },

  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        },
          {
            loader: 'expose-loader',
            options: '$'
          }],
      },
      {
        test: require.resolve('mocha'),
        use: [{
          loader: 'expose-loader',
          options: 'mocha'
        }],
      },
      {
        test: /\.mustache$/,
        loader: 'fxa-mustache-loader'
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'app', 'scripts'),
          path.resolve(__dirname, 'app', 'tests')
        ],
        exclude: [
          path.resolve(__dirname, 'app', 'scripts', 'vendor'),
          path.resolve(__dirname, 'app', 'scripts', 'templates')
        ],
        use: {
          loader: 'happypack/loader',
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].css',
              outputPath: '../../app/styles',
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          },
        ]
      }
    ]
  },
  optimization: {
    splitChunks: { // CommonsChunkPlugin()
      cacheGroups: {
        appDependencies: {
          test: /[\\/]node_modules[\\/]/,
          name: 'appDependencies',
          chunks: 'initial'
        }
      }
    },
  },
  plugins: ([
    new HappyPack({
      loaders: [{
        path: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: ['babel-preset-es2015'],
          plugins: ['babel-plugin-syntax-dynamic-import', 'transform-class-properties']
        }
      }],
      threads: 4,
      debug: false
    }),
    // dynamically loaded routes cause the .md file to be read and a
    // warning to be displayed on the console. Just ignore them.
    new webpack.IgnorePlugin(/\.md$/)
  ]),

  stats: { colors: true },

  node: {
    crypto: 'empty'
  },

  // See https://webpack.js.org/configuration/devtool/ to
  // configure source maps to personal preferences.
  devtool: 'source-map'
};

if (ENV === 'development') {
  Object.assign(webpackConfig.entry, {
    test: '../tests/webpack.js',
    testDependencies: [
      'jquery',
      'chai',
      'jquery-simulate',
      'mocha',
      'sinon',
    ]
  });
} else {
  Object.assign(webpackConfig.optimization, {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            unsafe_comps: true,
            properties: true,
            keep_fargs: false,
            pure_getters: true,
            collapse_vars: true,
            unsafe: true,
            warnings: false,
            sequences: true,
            dead_code: true,
            drop_debugger: true,
            comparisons: true,
            conditionals: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            hoist_funs: true,
            if_return: true,
            join_vars: true,
            drop_console: true
          },
        },
        sourceMap: true,
        cache: true,
        parallel: true
      }),
    ]
  });
}

module.exports = webpackConfig;
