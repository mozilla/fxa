/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AvatarMixin from '../mixins/avatar-mixin';
import Cocktail from 'cocktail';
import DisableFormMixin from '../mixins/disable-form-mixin';
import BaseView from '../base';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/display_name.mustache';
// eslint-disable-next-line
import React from 'react';
import ReactDOM from 'react-dom';

const t = msg => msg;

function DisplayName(props){
  return(
    <div id="display-name" class="settings-unit">
  <div class="settings-unit-stub">
    < DisplayNameComponent />
    < ChangeorAddButtonComponent displayName={props.displayName}/>
    </div>
    <div class="settings-unit-details">
    <div class="error" />
    < DisplayNameFormComponent displayName={props.displayName}/>
    </div>
    </div>
    );
}
function DisplayNameComponent() {
  return (
    <header class="settings-unit-summary">
      <h2 class="settings-unit-title">Display name</h2>
    </header>

  );
}
function ChangeorAddButtonComponent(props) {
  const displayName = props.displayName;
  if(displayName!=""){
    return (
      <button class="settings-button secondary-button settings-unit-toggle" data-href="settings/display_name">
    <span class="change-button">Change…</span>
    </button>
    );
  }
  else{
    <button class="settings-button primary-button settings-unit-toggle" data-href="settings/display_name">
      <span class="add-button">Add…</span>
      </button>
  }
}
function DisplayNameFormComponent(props) {
  return (
    <form noValidate>
      <p>
        Choose the name you would like to appear in Firefox and when managing your account.
      </p>
      <div class="input-row">
        <input type="text" class="text display-name" placeholder="Display name" defaultValue={props.displayName} autoFocus  autoComplete="off"/>
      </div>
      <div class="button-row">
        <button type="submit" class="settings-button primary-button">Change</button>
        <button class="settings-button secondary-button cancel">Cancel</button>
      </div>
      </form>

  );
}

const View = BaseView.extend({
  template: () => '<div />',//Template,
  className: 'display-name',
  viewName: 'settings.display-name',

  onProfileUpdate () {
    this.render();
  },

  setInitialContext (context) {
    context.set('displayName', this._displayName);
  },

  beforeRender () {
    var account = this.getSignedInAccount();
    return account.fetchProfile()
      .then(() => {
        this.user.setAccount(account);
        this._displayName = account.get('displayName');
      });
  },

  afterVisible () {
    ReactDOM.render(
      <DisplayName displayName={this._displayName}/>,
      this.$el.get(0)
    );
  },

  isValidStart () {
    // if no display name set then we still do not want to activate the change button
    var accountDisplayName = this.getSignedInAccount().get('displayName') || '';
    var displayName = this.getElementValue('input.display-name').trim();

    return accountDisplayName !== displayName;
  },

  submit () {
    const start = Date.now();
    const account = this.getSignedInAccount();
    const displayName = this.getElementValue('input.display-name').trim();

    return account.postDisplayName(displayName)
      .then(() => {
        this.logViewEvent('success');
        this.updateDisplayName(displayName);
        this.displaySuccess(t('Display name updated'));
        this.logFlowEvent(`timing.displayName.change.${Date.now() - start}`);
        this.navigate('settings');
      });
  }
});

Cocktail.mixin(
  View,
  AvatarMixin,
  // DisableFormMixin,
  SettingsPanelMixin,
);

export default View;
