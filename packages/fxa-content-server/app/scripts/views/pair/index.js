/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormView from '../form';
import Cocktail from 'cocktail';
import FlowEventsMixin from '../mixins/flow-events-mixin';
import Template from '../../templates/pair/index.mustache';
import UserAgentMixin from '../../lib/user-agent-mixin';
import PairingGraphicsMixin from '../mixins/pairing-graphics-mixin';
import PairingTotpMixin from './pairing-totp-mixin';
import { MARKETING_ID_AUTUMN_2016, SYNC_SERVICE } from '../../lib/constants';
import SyncAuthMixin from '../mixins/sync-auth-mixin';
import MarketingMixin from '../mixins/marketing-mixin';

class PairIndexView extends FormView {
  template = Template;

  events = {
    ...FormView.prototype.events,
    'click #pair-not-now': 'pairNotNowHandler',
    'focus #pair-tab-have-firefox': 'showHaveFirefox',
    'focus #pair-tab-download-firefox': 'showDownloadFirefox',
    'keydown #pair-tab-have-firefox': 'handleKeyDownOnTab1',
    'keydown #pair-tab-download-firefox': 'handleKeyDownOnTab2',
  };

  submit() {
    this.metrics.flush();
    return this.broker.openPairPreferences();
  }

  beforeRender() {
    const uap = this.getUserAgent();
    const isFirefoxDesktop = uap.isFirefoxDesktop();

    if (!isFirefoxDesktop || !this.broker.hasCapability('supportsPairing')) {
      // other browsers show an unsupported screen or if no capability to pair
      return this.replaceCurrentPage('pair/unsupported');
    }

    // If we reach this point that means we are in Firefox Desktop
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      // if we are not logged into Sync then we offer to connect
      return this.replaceCurrentPage('connect_another_device', {
        forceView: true,
      });
    }

    if (!account.get('verified') || !account.get('sessionToken')) {
      // if account is not verified or missing sessionToken then offer to sign in or confirm
      return this.navigateAway(this.getEscapedSyncUrl('signin', 'fxa:pair'));
    }
  }

  setInitialContext(context) {
    // Check the entrypoint. If we aren't in a entrypoint=fxa_app_menu context, then don't show QR code.
    const graphicId = this.getGraphicsId();
    const showQrCode = this.showDownloadFirefoxQrCode();

    context.set({
      graphicId,
      showQrCode,
    });
  }

  pairNotNowHandler() {
    this.metrics.logEvent('screen.pair.notnow.engage');
    return true;
  }

  showHaveFirefox() {
    // show "have Firefox"
    this.$('#pair-tab-have-firefox').attr('aria-selected', true);
    this.$('#pair-tab-have-firefox').addClass('tab-selected');
    this.$('#pair-panel-have-firefox').show();

    // hide "download Firefox"
    this.$('#pair-tab-download-firefox').removeClass('tab-selected');
    this.$('#pair-tab-download-firefox').attr('aria-selected', false);
    this.$('#pair-panel-download-firefox').hide();
  }

  showDownloadFirefox() {
    // hide 'have Firefox'
    this.$('#pair-tab-have-firefox').attr('aria-selected', false);
    this.$('#pair-tab-have-firefox').removeClass('tab-selected');
    this.$('#pair-panel-have-firefox').hide();

    // show 'download Firefox'
    this.$('#pair-tab-download-firefox').attr('aria-selected', true);
    this.$('#pair-tab-download-firefox').addClass('tab-selected');
    this.$('#pair-panel-download-firefox').show();
  }

  // Automate tab shifting with arrow keys
  handleKeyDownOnTab1(e) {
    if (document.dir === 'ltr') {
      if (e.key === 'ArrowRight') {
        this.$('#pair-tab-download-firefox').focus();
      }
    } else if (document.dir === 'rtl') {
      if (e.key === 'ArrowLeft') {
        this.$('#pair-tab-download-firefox').focus();
      }
    }
  }

  handleKeyDownOnTab2(e) {
    if (document.dir === 'ltr') {
      if (e.key === 'ArrowLeft') {
        this.$('#pair-tab-have-firefox').focus();
      }
    } else if (document.dir === 'rtl') {
      if (e.key === 'ArrowRight') {
        this.$('#pair-tab-have-firefox').focus();
      }
    }
  }
}

Cocktail.mixin(
  PairIndexView,
  FlowEventsMixin,
  PairingGraphicsMixin,
  PairingTotpMixin(),
  UserAgentMixin,
  SyncAuthMixin,
  MarketingMixin({
    marketingId: MARKETING_ID_AUTUMN_2016,
    service: SYNC_SERVICE,
    useAndroidPairingApp: true,
  })
);

export default PairIndexView;
