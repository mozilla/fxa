/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The Sync relier.
 */

import _ from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import CountryTelephoneInfo from '../../lib/country-telephone-info';
import Relier from './relier';
import Vat from '../../lib/vat';

const t = msg => msg;
const AllowedCountries = Object.keys(CountryTelephoneInfo);

/*eslint-disable camelcase*/
const QUERY_PARAMETER_SCHEMA = {
  // context is not available when verifying.
  context: Vat.string().min(1),
  country: Vat.string().valid(...AllowedCountries),
  service: Vat.string(),
  // signin code, from an SMS. Note, this is *not* validated
  // because users that open the verification link with an
  // invalid signinCode should still be able to sign in.
  // The error will be logged and the signinCode ignored.
  signin: Vat.string()
    .empty('')
    .renameTo('signinCode'),
};
/*eslint-enable camelcase*/

export default Relier.extend({
  defaults: _.extend({}, Relier.prototype.defaults, {
    action: undefined,
    name: 'browser',
    doNotSync: false,
    multiService: false,
    signinCode: undefined,
    tokenCode: false,
  }),

  initialize(attributes, options = {}) {
    this._translator = options.translator;

    Relier.prototype.initialize.call(this, attributes, options);
  },

  fetch() {
    return Relier.prototype.fetch.call(this).then(() => {
      this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);

      if (this.get('service')) {
        this.set('serviceName', t('Firefox Sync'));
      } else {
        // if no service provided, then we are just signing into the browser
        this.set('serviceName', t('Firefox'));
      }
    });
  },

  isSync() {
    return true;
  },

  shouldOfferToSync(viewName) {
    return this.get('service') !== 'sync' && viewName !== 'force-auth';
  },

  /**
   * Desktop clients will always want keys so they can sync.
   *
   * @returns {Boolean}
   */
  wantsKeys() {
    return true;
  },
});
