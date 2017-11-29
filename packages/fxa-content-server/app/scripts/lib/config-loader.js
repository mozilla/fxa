/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// fetch config from the backend and provide some helper functions.

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const Errors = require('./errors');

  function ConfigLoader() {
  }

  ConfigLoader.prototype = {
    /**
     * Pass in a configuration to use. Useful for unit testing.
     *
     * @param {Object} config
     * @returns {undefined}
     */
    useConfig (config) {
      this._config = config;
    },

    fetch () {
      if (this._config) {
        return Promise.resolve(this._config);
      }

      return this._readConfigFromHTML()
        .then(this._parseHTMLConfig)
        .then((config) => {
          config.lang = $('html').attr('lang');
          return config;
        });
    },

    _readConfigFromHTML () {
      const configFromHTML =
        $('meta[name="fxa-content-server/config"]').attr('content');

      if (! configFromHTML) {
        return Promise.reject(ConfigLoader.Errors.toError('MISSING_CONFIG'));
      }

      return Promise.resolve(configFromHTML);
    },

    _parseHTMLConfig (configFromHTML) {
      let config;
      try {
        const serializedJSONConfig = decodeURIComponent(configFromHTML);
        config = JSON.parse(serializedJSONConfig);
      } catch (e) {
        return Promise.reject(ConfigLoader.Errors.toError('INVALID_CONFIG'));
      }

      return Promise.resolve(config);
    }
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
        message: t('Missing configuration')
      },
      INVALID_CONFIG: {
        errno: 1001,
        message: t('Invalid configuration')
      }
    },
    /*eslint-enable sorting/sort-object-props*/
    NAMESPACE: 'config'
  });

  module.exports = ConfigLoader;
});

