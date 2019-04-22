/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Cocktail = require('cocktail');
const FormView = require('../form');
const SettingsPanelMixin = require('../mixins/settings-panel-mixin');
const Template = require('templates/settings/subscription.mustache');

// FIXME: should be from configuration:
const allowedLanguages = ['en-US'];

const View = FormView.extend({
  template: Template,
  className: 'subscription',
  viewName: 'settings.subscription',

  initialize (options = {}) {
    this._paymentUrl = options.config.paymentUrl;
  },

  beforeRender () {
    if (! this.supportSubscription()) {
      this.remove();
    }
  },

  setInitialContext (context) {
    context.set('paymentUrl', this._paymentUrl);
  },

  supportSubscription () {
    // FIXME: if the user is a paying user, then this should always return true
    const browserLanguages = navigator.languages || [];
    for (const lang of browserLanguages) {
      if (allowedLanguages.includes(lang)) {
        return true;
      }
    }
    return false;
  },

});

Cocktail.mixin(View, SettingsPanelMixin);

module.exports = View;
