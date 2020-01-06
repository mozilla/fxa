/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FormView from '../form';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/totp_secret.mustache';

const View = FormView.extend({
  template: Template,
  className: 'recovery-codes',
  viewName: 'settings.two-step-authentication.secret',

  beforeRender() {
    if (!this.model.get('secret')) {
      this.navigate('settings/two_step_authentication');
    }
  },

  submit() {
    this.closePanel();
  },

  setInitialContext(context) {
    context.set({
      secret: this.model.get('secret'),
    });
  },
});

Cocktail.mixin(View, ModalSettingsPanelMixin);

export default View;
