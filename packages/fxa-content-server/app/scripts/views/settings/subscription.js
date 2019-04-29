/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Cocktail from 'cocktail';
import FormView from '../form';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/subscription.mustache';

const View = FormView.extend({
  template: Template,
  className: 'subscription',
  viewName: 'settings.subscription',

  events: {
    'click button': 'submit',
  },

  submit () {
    return this.invokeBrokerMethod('redirectToPayments', this.getSignedInAccount());
  }
});

Cocktail.mixin(View, SettingsPanelMixin);

export default View;
