/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormView from '../form';
import Cocktail from 'cocktail';
import Template from '../../templates/pair/index.mustache';
import UserAgentMixin from '../../lib/user-agent-mixin';
import { DOWNLOAD_LINK_PAIRING_APP } from '../../lib/constants';

class PairIndexView extends FormView {
  template = Template;

  submit () {
    return this.broker.openPairPreferences();
  }

  beforeRender () {
    const uap = this.getUserAgent();
    const isFirefoxDesktop = uap.isFirefoxDesktop();

    if (! isFirefoxDesktop) {
      // other browsers show an unsupported screen
      return this.replaceCurrentPage('pair/unsupported');
    }

    // If we reach this point that means we are in Firefox Desktop
    if (! this.broker.get('browserSignedInAccount')) {
      // if we are not logged into Sync then we offer to sign in
      return this.replaceCurrentPage('connect_another_device');
    }

    if (! this.broker.hasCapability('supportsPairing')) {
      return this.replaceCurrentPage('pair/unsupported');
    }
  }

  setInitialContext (context) {
    const uap = this.getUserAgent();
    const graphicId = uap.supportsSvgTransformOrigin() ? 'graphic-connect-another-device-hearts' : 'graphic-connect-another-device';

    context.set({
      downloadAppLink: DOWNLOAD_LINK_PAIRING_APP,
      graphicId,
    });

  }
}

Cocktail.mixin(
  PairIndexView,
  UserAgentMixin,
);

export default PairIndexView;
