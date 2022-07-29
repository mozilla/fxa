/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Returns graphicId depending on whether the browser will supports
 * SVG Transform Origin or not.
 *
 * @mixin PairingGraphicsMixin
 */

import UserAgentMixin from '../../lib/user-agent-mixin';
import Constants from '../../lib/constants';
import UrlMixin from '../../lib/url-mixin';

export default {
  dependsOn: [UserAgentMixin, UrlMixin],

  /**
   * Returns graphicId 'bg-image-cad-hearts' if the
   * browser supports SVG Transform Origin, and 'bg-image-cad'
   * if it does not.
   *
   * @returns {String}
   */

  getGraphicsId() {
    const uap = this.getUserAgent();
    if (uap.supportsSvgTransformOrigin()) {
      return 'bg-image-cad-hearts';
    }
    return 'bg-image-cad';
  },

  /**
   * Returns true if the we believe the current entry points merits that we show the user
   * a QR code that can be used download firefox on a mobile device.
   */
  showDownloadFirefoxQrCode() {
    return (
      this.getSearchParam('entrypoint') === Constants.FIREFOX_MENU_ENTRYPOINT
    );
  },
};
