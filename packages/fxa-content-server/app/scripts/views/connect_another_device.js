/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * If the user verifies their email in an instance of Firefox
 * that other than the one they used to sign up, suggest
 * that they sign in. If the user verifies in a non-Firefox
 * browser, they are nudged to install Firefox for Android or iOS.
 */
import Cocktail from 'cocktail';
import ConnectAnotherDeviceMixin from './mixins/connect-another-device-mixin';
import ExperimentMixin from './mixins/experiment-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import HasModalChildViewMixin from './mixins/has-modal-child-view-mixin';
import PairingGraphicsMixin from './mixins/pairing-graphics-mixin';
import {
  MARKETING_ID_AUTUMN_2016,
  SYNC_SERVICE,
  UTM_SOURCE_EMAIL,
} from '../lib/constants';
import MarketingMixin from './mixins/marketing-mixin';
import MarketingSnippet from './marketing_snippet';
import SyncAuthMixin from './mixins/sync-auth-mixin';
import Template from 'templates/connect_another_device.mustache';
import UserAgentMixin from '../lib/user-agent-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';

class ConnectAnotherDeviceView extends FormView {
  template = Template;

  beforeRender() {
    // If the user is eligible for post verify add secondary email experiment, navigate to
    // those views.
    if (this.isEligibleForSecondaryEmailAfterSignup()) {
      return this.replaceCurrentPage(
        'post_verify/secondary_email/add_secondary_email'
      );
    }

    const account = this.getAccount();
    // If the user is eligible for SMS, send them to the SMS screen.
    // This allows the browser to link directly to /connect_another_device
    // and we handle sending users to the correct place.
    // See https://github.com/mozilla/fxa-content-server/issues/5737 and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1418466
    return this.getEligibleSmsCountry(account).then(country => {
      if (country) {
        return this.replaceCurrentPageWithSmsScreen(
          account,
          country,
          this._showSuccessMessage()
        );
      }
    });
  }

  afterRender() {
    const options = {
      marketingId: MARKETING_ID_AUTUMN_2016,
    };

    // If the user signed up and verified in Firefox for Android or is using Firefox iOS,
    // show marketing material for both mobile OSs.
    if (
      (this._isSignedIn() && this.getUserAgent().isFirefoxAndroid()) ||
      this.getUserAgent().isFirefoxIos()
    ) {
      options.which = MarketingSnippet.WHICH.BOTH;
    }

    return this.createMarketingSnippet(options);
  }

  afterVisible() {
    this._logViewMetrics();

    return super.afterVisible();
  }

  getAccount() {
    if (!this.model.get('account')) {
      this.model.set('account', this.user.getSignedInAccount());
    }

    return this.model.get('account');
  }

  /**
   * Log view related metrics.
   *
   * @private
   */
  _logViewMetrics() {
    const isSignedIn = this._isSignedIn();
    this.logFlowEvent(`signedin.${isSignedIn}`);

    const {
      canSignIn,
      isFirefoxAndroid,
      isFirefoxDesktop,
      isFirefoxIos,
      isOther,
      isOtherAndroid,
      isOtherIos,
    } = this.getContext();

    // connectMethod is used for metrics to log how the current user is
    // being nudged to connect another device.
    let connectMethod;
    if (canSignIn) {
      this.logFlowEvent('signin.eligible');

      if (isFirefoxAndroid) {
        connectMethod = 'signin_from.fx_android';
      } else if (isFirefoxDesktop) {
        connectMethod = 'signin_from.fx_desktop';
      }
    } else {
      this.logFlowEvent('signin.ineligible');

      if (isFirefoxIos) {
        connectMethod = 'signin_from.fx_ios';
      } else if (isFirefoxAndroid) {
        connectMethod = 'install_from.fx_android';
      } else if (isFirefoxDesktop) {
        connectMethod = 'install_from.fx_desktop';
      } else if (isOtherAndroid) {
        connectMethod = 'install_from.other_android';
      } else if (isOtherIos) {
        connectMethod = 'install_from.other_ios';
      } else if (isOther) {
        connectMethod = 'install_from.other';
      }
    }

    if (connectMethod) {
      this.logFlowEvent(connectMethod);
    }
  }

  setInitialContext(context) {
    const isSignedIn = this._isSignedIn();
    const canSignIn = this._canSignIn();
    const email = this.getAccount().get('email');
    const escapedSignInUrl = this._getEscapedSignInUrl(email);

    const uap = this.getUserAgent();
    const graphicId = this.getGraphicsId();
    const isAndroid = uap.isAndroid();
    const isFirefoxAndroid = uap.isFirefoxAndroid();
    const isFirefoxDesktop = uap.isFirefoxDesktop();
    const isFirefoxIos = uap.isFirefoxIos();
    const isIos = uap.isIos();
    const isOtherAndroid = isAndroid && !isFirefoxAndroid;
    const isOtherIos = isIos && !isFirefoxIos;
    const isOther = !isAndroid && !isIos && !isFirefoxDesktop;
    const isSignIn = this.isSignIn();
    const isSignUp = this.isSignUp();
    const showSuccessMessage = this._showSuccessMessage();

    context.set({
      canSignIn,
      email,
      escapedSignInUrl,
      graphicId,
      isFirefoxAndroid,
      isFirefoxDesktop,
      isFirefoxIos,
      isOther,
      isOtherAndroid,
      isOtherIos,
      isSignedIn,
      isSignIn,
      isSignUp,
      showSuccessMessage,
    });
  }

  /**
   * Check if the current user is already signed in.
   *
   * @returns {Boolean}
   * @private
   */
  _isSignedIn() {
    // If a user verifies at CWTS, the browser will not have yet received
    // the fxaccounts:login message, and the fxaccounts:fxa_status request on
    // startup will return `signedInUser: null`, resulting in us believing no
    // user is signed in. Users that aren't signed in are asked to sign in.
    // Whoops.
    // Fortunately, we can guess that the user *will* be signed in
    // if we know the user is verifying in the same browser. Some data
    // is written in CWTS to let us know the user is verifying in the same
    // browser. If this is the case, assume the user is signed in.
    // See #5554
    return (
      this.user.isSignedInAccount(this.getAccount()) ||
      this.broker.get('isVerificationSameBrowser')
    );
  }

  /**
   * Check if the current user can sign in.
   *
   * @returns {Boolean}
   * @private
   */
  _canSignIn() {
    // Only users that are not signed in can do so.
    return !this._isSignedIn() && this.isSyncAuthSupported();
  }

  /**
   * Check whether to render the success message at the top of the view.
   * This enables Firefox code to link directly to this view without a
   * misleading status message being displayed. When navigating internally,
   * the connect-another-device-mixin ensures it gets set to true.
   *
   * @returns {Boolean}
   * @private
   */
  _showSuccessMessage() {
    return (
      !!this.model.get('showSuccessMessage') ||
      !!this.getSearchParam('showSuccessMessage')
    );
  }

  /**
   * Get an escaped sign in URL.
   *
   * @param {String} email - users email address, used to
   *  pre-fill the signin page.
   * @returns {String}
   * @private
   */
  _getEscapedSignInUrl(email) {
    return this.getEscapedSyncUrl('', ConnectAnotherDeviceView.ENTRYPOINT, {
      action: 'email',
      email,
      // Users will only reach this view from a verification email, so we can
      // hard-code an appropriate utm_source. The utm_source can't be set on
      // the originating link because we don't want to clobber the existing
      // utm_source for that flow. Related issues:
      //
      //   * https://github.com/mozilla/fxa-content-server/issues/6258
      //   * https://github.com/mozilla/fxa-auth-server/issues/2496
      //
      //eslint-disable-next-line camelcase
      utm_source: UTM_SOURCE_EMAIL,
    });
  }

  static get ENTRYPOINT() {
    return 'fxa:connect_another_device';
  }
}

Cocktail.mixin(
  ConnectAnotherDeviceView,
  ConnectAnotherDeviceMixin,
  ExperimentMixin,
  FlowEventsMixin,
  HasModalChildViewMixin,
  PairingGraphicsMixin,
  MarketingMixin({
    // The marketing area is manually created to which badges are displayed.
    autocreate: false,
    // This screen is only shown to Sync users. The service is always Sync,
    // even if not specified on the URL. This makes manual testing slightly
    // easier where sometimes ?service=sync is forgotten. See #4948.
    service: SYNC_SERVICE,
  }),
  SyncAuthMixin,
  UserAgentMixin,
  VerificationReasonMixin
);

export default ConnectAnotherDeviceView;
