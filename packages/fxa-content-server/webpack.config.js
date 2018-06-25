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
      'fxaCheckbox',
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
      fxaCheckbox: path.resolve(__dirname, 'node_modules/fxa-checkbox/checkbox'),
      fxaClient: 'fxa-js-client/client/FxAccountClient',
      fxaCryptoDeriver: path.resolve(__dirname, 'node_modules/fxa-crypto-relier/dist/fxa-crypto-relier/fxa-crypto-deriver'),
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
        test: /\.mustache$/,
        loader: 'fxa-mustache-loader'
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'app', 'scripts')
        ],
        exclude: [
          path.resolve(__dirname, 'app', 'scripts', 'vendor'),
          path.resolve(__dirname, 'app', 'scripts', 'templates')
        ],
        use: {
          loader: 'happypack/loader',
        }
      }
    ]
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
    new webpack.NamedChunksPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      chunks: ["app", "test", "testDependencies"],
      name: "appDependencies",
      minChunks: Infinity,
    }),
  ]).concat(ENV === 'production' ? [
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
  ] : []).concat(ENV === 'development' ? [
    new webpack.optimize.CommonsChunkPlugin({
      chunks: ["test"],
      name: "testDependencies",
      minChunks: Infinity,
    })
  ]: []),

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
      'chai',
      'jquery-simulate',
      'mocha',
      'sinon',
    ]
  });
}

module.exports = webpackConfig;
