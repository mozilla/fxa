/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import { MARKETING_ID_AUTUMN_2016, SYNC_SERVICE } from '../../lib/constants';
import GleanMetrics from '../../lib/glean';
import UserAgentMixin from '../../lib/user-agent-mixin';
import FormNeedsMobile from '../../models/pairing/form-needs-mobile';
import Template from '../../templates/pair/index.mustache';
import FormView from '../form';
import FlowEventsMixin from '../mixins/flow-events-mixin';
import MarketingMixin from '../mixins/marketing-mixin';
import PairingGraphicsMixin from '../mixins/pairing-graphics-mixin';
import SyncAuthMixin from '../mixins/sync-auth-mixin';
import PairingTotpMixin from './pairing-totp-mixin';

const GLEAN_EVENT_REASON_HAS_MOBILE = 'has mobile';
const GLEAN_EVENT_REASON_NO_MOBILE = 'does not have mobile';

class PairIndexView extends FormView {
  template = Template;

  events = {
    ...FormView.prototype.events,
    'click #get-fx-mobile': 'downloadLinkEngagement',
    'click #pair-not-now': 'pairNotNowHandler',
    'click #choice-pair-not-now': 'choicePairNotNowHandler',
    'click #set-needs-mobile': 'setNeedsMobile',
    'click #back-btn': 'handleBackButton',
    'click .input-radio': 'handleRadioEngage',
  };
  model = new FormNeedsMobile();

  submit() {
    if (this.model.get('needsMobileConfirmed')) {
      GleanMetrics.cadFirefox.syncDeviceSubmit();
    }
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
    const graphicId = this.getGraphicsId();
    const needsMobileConfirmed = this.model.get('needsMobileConfirmed');

    if (needsMobileConfirmed) {
      GleanMetrics.cadFirefox.view();
    } else {
      GleanMetrics.cadFirefox.choiceView();
    }

    context.set({
      graphicId,
      needsMobileConfirmed,
      showSuccessMessage: this.showSuccessMessage(),
    });
  }

  async setNeedsMobile() {
    const needsMobileConfirmed =
      this.getElementValue('input[id="needs-mobile"]:checked') === 'on';
    this.model.set('needsMobileConfirmed', needsMobileConfirmed);

    GleanMetrics.cadFirefox.choiceSubmit({
      reason: needsMobileConfirmed
        ? GLEAN_EVENT_REASON_NO_MOBILE
        : GLEAN_EVENT_REASON_HAS_MOBILE,
    });

    if (needsMobileConfirmed) {
      await this.render();
      // For screen readers/keyboard users, to avoid rereading the Moz logo and CAD header
      this.$('#pair-header-mobile').focus();
    } else {
      this.submit();
    }
  }

  async handleBackButton() {
    this.model.set('needsMobileConfirmed', false);
    await this.render();
    // For screen readers/keyboard users, to avoid needing to re-enter web content and
    // avoid rereading the Moz logo and CAD header
    this.$('#pair-header').focus();
  }

  handleRadioEngage() {
    this.$('#set-needs-mobile').removeAttr('disabled');
    const reason =
      this.getElementValue('input[id="needs-mobile"]:checked') === 'on'
        ? GLEAN_EVENT_REASON_NO_MOBILE
        : GLEAN_EVENT_REASON_HAS_MOBILE;

    GleanMetrics.cadFirefox.choiceEngage({ reason });
  }

  downloadLinkEngagement() {
    this.metrics.logEvent('screen.pair.downloadlink.engage');
  }

  pairNotNowHandler() {
    this.metrics.logEvent('screen.pair.notnow.engage');
    GleanMetrics.cadFirefox.notnowSubmit();
    return true;
  }

  // When user is offered a choice to select if they do or do not have Firefox for mobile
  // to start connecting another device but click the "Not Now" button and cancel out of the flow
  choicePairNotNowHandler() {
    GleanMetrics.cadFirefox.choiceNotnowSubmit();
    return true;
  }

  showSuccessMessage() {
    return (
      !this.model.get('needsMobileConfirmed') &&
      (!!this.model.get('showSuccessMessage') ||
        !!this.getSearchParam('showSuccessMessage'))
    );
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
