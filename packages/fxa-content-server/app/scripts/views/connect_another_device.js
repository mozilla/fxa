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
import Template from 'templates/connect_another_device.mustache';
import Constants from '../lib/constants';
import GleanMetrics from '../lib/glean';
import UserAgentMixin from '../lib/user-agent-mixin';
import FormView from './form';
import MarketingSnippet from './marketing_snippet';
import ConnectAnotherDeviceMixin from './mixins/connect-another-device-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import HasModalChildViewMixin from './mixins/has-modal-child-view-mixin';
import MarketingMixin from './mixins/marketing-mixin';
import PairingGraphicsMixin from './mixins/pairing-graphics-mixin';
import SyncAuthMixin from './mixins/sync-auth-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';
import UnsupportedPairTemplate from '../templates/partial/unsupported-pair.mustache';

const entrypoints = Object.keys(Constants)
  .filter((k) => k.endsWith('_ENTRYPOINT'))
  .map((k) => Constants[k]);
const isValidEntrypoint = (entrypoint) => entrypoints.includes(entrypoint);
const getEntrypoint = (entrypoint) =>
  isValidEntrypoint(entrypoint)
    ? entrypoint
    : Constants.FIREFOX_MENU_ENTRYPOINT;

const ConnectAnotherDeviceView = FormView.extend({
  template: Template,

  events: {
    'click #cad-not-now': 'notNowLinkHandler',
    'click #sync-firefox-devices': 'connectAnotherDeviceLinkHandler',
  },

  beforeRender() {
    // To avoid to redirection loops the forceView property might be set
    if (this.model.get('forceView')) {
      return;
    }

    if (this.isEligibleForPairing()) {
      return this.replaceCurrentPageWithPairScreen();
    }

    // Some RPs specify a `redirect_to` query param, check to see if this should
    // be automatically navigated via the `redirect_immediately` param. Note that
    // the user is redirected to `settings` page because it performs extra validation
    // on whether the url is allowed to be redirected to.
    if (this.getSearchParam('redirect_immediately') === 'true') {
      this.navigate('/settings');
    }

    // If users are signed in on desktop and access this page, redirect them
    if (this._isSignedIn() && !this.getUserAgent().isMobile()) {
      this.navigate('/pair');
    }
  },

  afterRender() {
    const options = {
      marketingId: Constants.MARKETING_ID_AUTUMN_2016,
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
  },

  afterVisible() {
    this._logViewMetrics();

    return FormView.prototype.afterVisible.bind(this)();
  },

  getAccount() {
    if (!this.model.get('account')) {
      this.model.set('account', this.user.getSignedInAccount());
    }

    return this.model.get('account');
  },

  /**
   * Log view related metrics.
   *
   * @private
   */
  _logViewMetrics() {
    GleanMetrics.cad.view();
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
  },

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

    const entrypoint = getEntrypoint(this.getSearchParam('entrypoint'));
    const pairingUrl = `/pair?entrypoint=${entrypoint}`;

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
      pairingUrl,
      isMobile: this.getUserAgent().isMobile(),
      showSuccessMessage,
      unsupportedPairHtml: this.renderTemplate(UnsupportedPairTemplate),
    });
  },

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
  },

  /**
   * Check if the current user can sign in.
   *
   * @returns {Boolean}
   * @private
   */
  _canSignIn() {
    // Only users that are not signed in can do so.
    return !this._isSignedIn() && this.isSyncAuthSupported();
  },

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
  },

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
      utm_source: Constants.UTM_SOURCE_EMAIL,
    });
  },

  ENTRYPOINT: 'fxa:connect_another_device',

  notNowLinkHandler() {
    this.logEvent('cad.notnow.engage');
    GleanMetrics.cad.startbrowsingSubmit();
    return true;
  },

  connectAnotherDeviceLinkHandler() {
    GleanMetrics.cad.submit();
    return true;
  },
});

Cocktail.mixin(
  ConnectAnotherDeviceView,
  ConnectAnotherDeviceMixin,
  FlowEventsMixin,
  HasModalChildViewMixin,
  PairingGraphicsMixin,
  MarketingMixin({
    // The marketing area is manually created to which badges are displayed.
    autocreate: false,
    // This screen is only shown to Sync users. The service is always Sync,
    // even if not specified on the URL. This makes manual testing slightly
    // easier where sometimes ?service=sync is forgotten. See #4948.
    service: Constants.SYNC_SERVICE,
  }),
  SyncAuthMixin,
  UserAgentMixin,
  VerificationReasonMixin
);

export default ConnectAnotherDeviceView;
