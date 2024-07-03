/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FormView from '../form';
import Template from '../../templates/pair/unsupported.mustache';
import GleanMetrics from '../../lib/glean';
import UserAgentMixin from '../../lib/user-agent-mixin';

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
    // Assume the user is on non-Firefox desktop in this case.
    const isDesktopNonFirefox =
      !uap.isFirefox() && !uap.isAndroid() && !uap.isIos();

    if (isDesktopNonFirefox) {
      GleanMetrics.cadRedirectDesktop.view();
    } else {
      GleanMetrics.cadMobilePairUseAppView.view();
    }
    context.set({
      isDesktopNonFirefox,
    });
  }
}

Cocktail.mixin(PairUnsupportedView, UserAgentMixin);

export default PairUnsupportedView;
