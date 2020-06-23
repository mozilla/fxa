/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/get_started.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';
import { MOZ_ORG_SYNC_GET_STARTED_LINK } from '../../../lib/constants';

class GetStarted extends FormView {
  template = Template;
  viewName = 'get-started';
  settingReminder = false;

  events = assign(this.events, {
    'click #maybe-later-link': preventDefaultThen('clickMaybeLater'),
  });

  submit() {
    return this.navigate('/post_verify/cad_qr/ready_to_scan');
  }

  clickMaybeLater() {
    if (this.settingReminder) {
      return;
    }

    this.settingReminder = true;
    const account = this.getSignedInAccount();
    return account
      .createCadReminder()
      .then(() => {
        this.navigateAway(MOZ_ORG_SYNC_GET_STARTED_LINK);
      })
      .catch(() => {
        this.settingReminder = false;
      });
  }
}

Cocktail.mixin(GetStarted, FlowEventsMixin);

export default GetStarted;
