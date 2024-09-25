/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FormView from '../form';
import Template from '../../templates/pair/unsupported.mustache';
import GleanMetrics from '../../lib/glean';
import UserAgentMixin from '../../lib/user-agent-mixin';
import UrlMixin from 'lib/url-mixin';
import UnsupportedPairTemplate from '../../templates/partial/unsupported-pair.mustache';

class PairUnsupportedView extends FormView {
  template = Template;

  events = {
    ...FormView.prototype.events,
    'click #download-firefox': 'downloadFirefoxEngage',
  };

  downloadFirefoxEngage() {
    GleanMetrics.cadRedirectDesktop.download();
  }

  setInitialContext(context) {
    const uap = this.getUserAgent();
    const isFirefox = uap.isFirefox();
    const isMobile = uap.isMobile();
    // Assume the user is on non-Firefox desktop in this case.
    const isDesktopNonFirefox = !isFirefox && !isMobile;
    const hashParams = this.getHashParams(['channel_id, channel_key']);
    const isSystemCameraUrl =
      hashParams.channel_id && hashParams.channel_key && isMobile;

    // Links taken from buttons in /settings
    const escapedMobileDownloadLink = uap.isIos()
      ? 'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fitunes.apple.com%2Fus%2Fapp%2Ffirefox-private-safe-browser%2Fid989804926'
      : 'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mozilla.firefox';

    if (isDesktopNonFirefox) {
      GleanMetrics.cadRedirectDesktop.view();
    } else if (isSystemCameraUrl) {
      GleanMetrics.cadMobilePairUseAppView.view();
    } else if (isMobile) {
      GleanMetrics.cadRedirectMobile.view();
    } else {
      GleanMetrics.cadRedirectDesktop.defaultView();
    }

    context.set({
      isDesktopNonFirefox,
      isFirefox,
      isMobile,
      isSystemCameraUrl,
      escapedMobileDownloadLink,
      showCADHeader: !(isMobile && !isSystemCameraUrl),
      unsupportedPairHtml: this.renderTemplate(UnsupportedPairTemplate),
    });
  }
}

Cocktail.mixin(PairUnsupportedView, UserAgentMixin, UrlMixin);

export default PairUnsupportedView;
