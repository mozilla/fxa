/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The Sync for Sync relier. In addition to the fields available on
 * `Relier`, provides the following:
 *
 * - context
 * - migration
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const AllowedCountries = Object.keys(require('lib/country-telephone-info'));
  const Relier = require('models/reliers/relier');
  const Vat = require('lib/vat');

  const t = (msg) => msg;

  /*eslint-disable camelcase*/
  const QUERY_PARAMETER_SCHEMA = {
    // context is not available when verifying.
    context: Vat.string().min(1),
    country: Vat.string().valid(...AllowedCountries),
    customizeSync: Vat.boolean()
  };
  /*eslint-enable camelcase*/

  module.exports = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      customizeSync: false
    }),

    initialize (attributes, options = {}) {
      this._translator = options.translator;

      Relier.prototype.initialize.call(this, attributes, options);
    },

    fetch () {
      return Relier.prototype.fetch.call(this)
        .then(() => {
          this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);

          if (this.get('service')) {
            this.set('serviceName', t('Firefox Sync'));
          }
        });
    },

    isSync () {
      return true;
    },

    /**
     * Desktop clients will always want keys so they can sync.
     *
     * @returns {Boolean}
     */
    wantsKeys () {
      return true;
    },

    /**
     * Check if the relier wants to force the customize sync checkbox on
     *
     * @returns {Boolean}
     */
    isCustomizeSyncChecked () {
      return !! this.get('customizeSync');
    }
  });
});
