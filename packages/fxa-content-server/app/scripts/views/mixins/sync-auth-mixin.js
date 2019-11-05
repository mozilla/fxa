/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Determine whether the user can sign in to Sync in the
 * current tab, and if so, which URL should be used to do so.
 */

import _ from 'underscore';
import Constants from '../../lib/constants';
import Url from '../../lib/url';
import UserAgentMixin from '../../lib/user-agent-mixin';

export default {
  dependsOn: [UserAgentMixin],

  /**
   * Does the browser support WebChannels?
   *
   * @returns {Boolean}
   * @private
   */
  _hasWebChannelSupport() {
    const uap = this.getUserAgent();
    const browserVersion = uap.browser.version;

    // WebChannels were introduced in Fx Desktop 40 and Fennec 43.
    return (
      (uap.isFirefoxDesktop() && browserVersion >= 40) ||
      (uap.isFirefoxAndroid() && browserVersion >= 43)
    );
  },

  /**
   * Check whether the current environment supports sign in for Sync.
   *
   * @returns {Boolean}
   */
  isSyncAuthSupported() {
    return !! this._hasWebChannelSupport();
  },

  /**
   * Return the context that can be used to sign up/in
   * to Sync. Assumes the context is only used if the user
   * can actually sign in to Sync.
   *
   * @returns {String}
   */
  _getSyncContext() {
    const uap = this.getUserAgent();
    if (uap.isFirefoxAndroid()) {
      return Constants.FX_FENNEC_V1_CONTEXT;
    } else if (uap.isFirefoxDesktop()) {
      // desktop_v3 is safe for all desktop versions that can
      // use WebChannels. The only difference between v2 and v3
      // was the Sync Preferences button, which has since
      // been disabled.
      return Constants.FX_DESKTOP_V3_CONTEXT;
    }
  },

  /**
   * Get an escaped Sync URL for `pathname`.
   *
   * @param {String} pathname target pathname
   * @param {String} entrypoint entrypoint for metrics
   * @param {Object} [extraQueryParams={}] Extra query parameters
   * @returns {String}
   */
  getEscapedSyncUrl(pathname, entrypoint, extraQueryParams = {}) {
    const origin = this.window.location.origin;
    const relier = this.relier;

    const params = _.extend(
      {
        context: this._getSyncContext(),
        entrypoint: entrypoint,
        service: Constants.SYNC_SERVICE,
        /* eslint-disable camelcase */
        utm_campaign: relier.get('utmCampaign'),
        utm_content: relier.get('utmContent'),
        utm_medium: relier.get('utmMedium'),
        utm_source: relier.get('utmSource'),
        utm_term: relier.get('utmTerm'),
        /* eslint-enable camelcase */
      },
      extraQueryParams
    );
    // Url.objToSearchString escapes each of the
    // query parameters.
    const escapedSearchString = Url.objToSearchString(params);

    return `${origin}/${pathname}${escapedSearchString}`;
  },
};
