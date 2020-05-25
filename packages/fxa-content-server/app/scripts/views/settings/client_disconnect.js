/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FormView from '../form';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import preventDefaultThen from '../decorators/prevent_default_then';
import SignedOutNotificationMixin from '../mixins/signed-out-notification-mixin';
import Template from 'templates/settings/client_disconnect.mustache';

const t = (msg) => msg;

const REASON_HELP = {
  lost: t(
    "We're sorry to hear about this. You should change your Firefox Account password, and look for " +
      'information from your device manufacturer about erasing your data remotely.'
  ),
  suspicious: t(
    "We're sorry to hear about this. If this was a device you really don't trust, you should " +
      'change your Firefox Account password, and change any passwords saved in Firefox.'
  ),
};

var View = FormView.extend({
  template: Template,
  className: 'clients-disconnect',
  viewName: 'settings.clients.disconnect',

  events: {
    click: '_returnToClientListAfterDisconnect',
    'click .cancel-disconnect': preventDefaultThen('_returnToClientList'),
    'click button[type=submit]': '_returnToConnectAnotherDevice',
  },

  initialize() {
    // user is presented with an option to disconnect device
    this.hasDisconnected = false;
    this.on('modal-cancel', () => this._returnToClientList());
  },

  beforeRender() {
    // receive the device collection and the item to delete
    // if deleted the collection will be automatically updated in the settings panel.
    const clients = this.model.get('clients');
    const clientId = this.model.get('clientId');
    if (!clients || !clientId) {
      return this._returnToClientList();
    }

    this.client = clients.get(clientId);
  },

  setInitialContext(context) {
    context.set({
      hasDisconnected: this.hasDisconnected,
      reasonHelp: this.reasonHelp,
    });

    if (!this.hasDisconnected) {
      context.set('deviceName', this.client.get('name'));
    }
  },

  /**
   * Called on option select.
   * If first option is selected then form is disabled using the logic in FormView.
   * If the client was disconnected then the user can press the 'Got it' button to close the modal.
   *
   * @returns {Boolean}
   */
  isValidStart() {
    if (this.hasDisconnected) {
      return true;
    }
    return this.$('input[name=disconnect-reasons]:checked').length > 0;
  },

  submit() {
    const start = Date.now();
    const client = this.client;
    const selectedValue = this.$(
      'input[name=disconnect-reasons]:checked'
    ).val();
    this.logViewEvent('submit.' + selectedValue);

    return this.user
      .destroyAccountAttachedClient(this.user.getSignedInAccount(), client)
      .then(() => {
        this.logFlowEvent(`timing.clients.disconnect.${Date.now() - start}`);
        // user has disconnect the device
        this.hasDisconnected = true;
        this.reasonHelp = REASON_HELP[selectedValue];
        if (client.get('isCurrentSession')) {
          // if disconnected the current device, the user is automatically signed out
          this.navigateToSignIn();
        } else if (this.reasonHelp) {
          // if we can provide help for this disconnect reason
          this.render();
        } else {
          // close the modal if no reason help
          this._returnToClientListAfterDisconnect();
        }
      });
  },

  /**
   * Navigates to the client list if device was disconnected.
   */
  _returnToClientListAfterDisconnect() {
    if (this.hasDisconnected) {
      this._returnToClientList();
    }
  },

  _returnToClientList() {
    this.navigate('settings/clients');
  },
});

Cocktail.mixin(View, ModalSettingsPanelMixin, SignedOutNotificationMixin);

export default View;
