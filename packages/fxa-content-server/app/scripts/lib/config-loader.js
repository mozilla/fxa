/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// fetch config from the backend and provide some helper functions.

import _ from 'underscore';
import Constants from './constants';
import Errors from './errors';

function ConfigLoader() {}

ConfigLoader.prototype = {
  /**
   * Pass in a configuration to use. Useful for unit testing.
   *
   * @param {Object} config
   * @returns {undefined}
   */
  useConfig(config) {
    this._config = config;
  },

  fetch() {
    if (this._config) {
      return Promise.resolve(this._config);
    }

    return this._readConfigFromHTML()
      .then(this._parseHTMLConfig)
      .then(config => {
        config.lang = document.querySelector('html').getAttribute('lang');
        this._setWebpackPublicPath(config.webpackPublicPath);
        return config;
      });
  },

  _readConfigFromHTML() {
    const element = document.querySelector(
      'meta[name="fxa-content-server/config"]'
    );
    const configFromHTML = element && element.getAttribute('content');

    if (!configFromHTML) {
      return Promise.reject(ConfigLoader.Errors.toError('MISSING_CONFIG'));
    }

    return Promise.resolve(configFromHTML);
  },

  _parseHTMLConfig(configFromHTML) {
    let config;
    try {
      const serializedJSONConfig = decodeURIComponent(configFromHTML);
      config = JSON.parse(serializedJSONConfig);

      const element = document.querySelector('meta[name="fxa-feature-flags"]');
      const serializedFeatureFlags = decodeURIComponent(
        element ? element.getAttribute('content') : ''
      );
      config.featureFlags = JSON.parse(serializedFeatureFlags);
    } catch (e) {
      return Promise.reject(ConfigLoader.Errors.toError('INVALID_CONFIG'));
    }

    return Promise.resolve(config);
  },

  /**
   * Support "On The Fly" configuration for WebPack imports and other features
   *
   * Ref: https://webpack.js.org/guides/public-path/#on-the-fly
   *
   * Be aware that if you use ES6 module imports in your entry file the
   * __webpack_public_path__ assignment will be done after the imports.
   *  In such cases, you'll have to move the public path assignment to
   *  its own dedicated module and then import it on top of the app.js.
   *
   * @param {String} webpackPublicPath
   * @private
   */
  _setWebpackPublicPath(webpackPublicPath = Constants.DEFAULT_BUNDLE_PATH) {
    /*eslint-disable camelcase*/
    __webpack_public_path__ = webpackPublicPath; //eslint-disable-line no-undef
    /*eslint-enable camelcase*/
  },
};

const t = msg => msg;

ConfigLoader.Errors = _.extend({}, Errors, {
  /*eslint-disable sorting/sort-object-props*/
  ERRORS: {
    /*
     Removed in #4147 because config values are no longer
     loaded using an XHR request, rather they are loaded
     from the DOM.

    SERVICE_UNAVAILABLE: {
      errno: 998,
      message: t('System unavailable, try again soon')
    },
    UNEXPECTED_ERROR: {
      errno: 999,
      message: t('Unexpected error')
    },
    */
    MISSING_CONFIG: {
      errno: 1000,
      message: t('Missing configuration'),
    },
    INVALID_CONFIG: {
      errno: 1001,
      message: t('Invalid configuration'),
    },
  },
  /*eslint-enable sorting/sort-object-props*/
  NAMESPACE: 'config',
});

export default ConfigLoader;
