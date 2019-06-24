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

export default {
  dependsOn: [UserAgentMixin],

  /**
   * Returns graphicId 'graphic-connect-another-device-hearts' if the
   * browser supports SVG Transform Origin, and 'graphic-connect-another-device'
   * if it does not.
   *
   * @returns {String}
   */

  getGraphicsId() {
    const uap = this.getUserAgent();
    if (uap.supportsSvgTransformOrigin()) {
      return 'graphic-connect-another-device-hearts';
    }
    return 'graphic-connect-another-device';
  },
};
