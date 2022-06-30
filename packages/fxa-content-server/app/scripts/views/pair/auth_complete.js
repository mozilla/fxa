/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import DeviceBeingPairedMixin from './device-being-paired-mixin';
import PairingGraphicsMixin from '../mixins/pairing-graphics-mixin';
import Template from '../../templates/pair/auth_complete.mustache';
import { assign } from 'underscore';
import preventDefaultThen from '../decorators/prevent_default_then';
import WebChannel from '../../lib/channels/web';
import Constants from '../../lib/constants';
import FormView from '../form';

class PairAuthCompleteView extends FormView {
  template = Template;

  events = assign(this.events, {
    'click #open-firefox-view': preventDefaultThen('openFirefoxView'),
  });

  initialize(options) {
    super.initialize(options);
    this._notificationChannel = this.createWebchannel();
  }
  
  createWebchannel() {
    const channel = new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
    channel.initialize({
      window: this.window,
    });

    return channel;
  }
  
  beforeRender() {
    return this.invokeBrokerMethod('afterPairAuthComplete');
  }

  setInitialContext(context) {
    const deviceContext = assign({}, this.broker.get('remoteMetaData'));
    const graphicId = this.getGraphicsId();

    context.set({ 
      graphicId,
      deviceFamily: deviceContext.family,
      deviceOS: deviceContext.OS,
      hasFirefoxViewSupport: this._hasFirefoxViewSupport()
    });
  }

  openFirefoxView() {
    const channel = this._notificationChannel;
    return channel.send(channel.COMMANDS.FIREFOX_VIEW, {
      // TODO: What is the correct entrypoint value?
      entryPoint: "preferences"
    });
  }

  _hasFirefoxViewSupport() {
    const uap = this.getUserAgent();
    const browserVersion = uap.browser.version;

    // Currently, only supported in FF Nightly
    // For local testing, override this to true
    return uap.isFirefoxDesktop() && browserVersion >= 104;
  }
}

Cocktail.mixin(
  PairAuthCompleteView,
  DeviceBeingPairedMixin(),
  PairingGraphicsMixin,
);

export default PairAuthCompleteView;
