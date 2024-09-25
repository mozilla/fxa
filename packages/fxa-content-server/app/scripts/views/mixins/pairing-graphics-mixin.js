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
import UrlMixin from '../../lib/url-mixin';

export default {
  dependsOn: [UserAgentMixin, UrlMixin],

  getGraphicsId() {
    const uap = this.getUserAgent();
    if (uap.supportsSvgTransformOrigin()) {
      return 'bg-image-triple-device-hearts';
    }
    return 'bg-image-cad';
  },
};
