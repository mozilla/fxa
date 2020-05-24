/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AvatarMixin from '../mixins/avatar-mixin';
import Cocktail from 'cocktail';
import BaseView from '../base';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import React from 'react';
import ReactDOM from 'react-dom';
import Translator from '../../lib/translator';

const translator = new Translator();

/* Using local translator instead of view's translator
 * because View does not have access to React components. */

const t = (msg) => translator.get(msg);

function DisplayName(props) {
  return (
    <div id="display-name" className="settings-unit">
      <div className="settings-unit-stub">
        <DisplayNameComponent />
        <ChangeorAddButtonComponent displayName={props.displayName} />
      </div>
      <div className="settings-unit-details">
        <div className="error" />
        <DisplayNameFormComponent
          account={props.account}
          submit={props.submit}
          displayName={props.displayName}
        />
      </div>
    </div>
  );
}
export function DisplayNameComponent() {
  return (
    <header className="settings-unit-summary">
      <h2 className="settings-unit-title">{t('Display name')}</h2>
    </header>
  );
}
export function ChangeorAddButtonComponent(props) {
  const displayName = props.displayName;
  if (displayName) {
    return (
      <button
        className="settings-button secondary-button settings-unit-toggle"
        data-href="settings/display_name"
      >
        <span className="change-button">{t('Change…')}</span>
      </button>
    );
  } else {
    return (
      <button
        className="settings-button primary-button settings-unit-toggle"
        data-href="settings/display_name"
      >
        <span className="add-button">{t('Add…')}</span>
      </button>
    );
  }
}
export class DisplayNameFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const accountDisplayName = props.account.get('displayName') || '';
    const propsDisplayName = props.displayName || '';
    this.state = {
      disableChangeButton: propsDisplayName === accountDisplayName,
      displayName: accountDisplayName,
    };
  }

  handleChange = (event) => {
    this.setState(
      {
        displayName: event.target.value,
      },
      () => {
        /* isValid(): function that set the state for disableChangeButton.
         * Whenever the value in the input box changes, the function is called
         * to check whether the change button should be disabled or not. */

        this.isValid();
      }
    );
  };

  componentDidUpdate() {
    this._input.focus();
  }

  isValid() {
    const propsDisplayName = this.props.displayName || '';
    this.setState({
      disableChangeButton: propsDisplayName === this.state.displayName,
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ disableChangeButton: 1 }, () => {
      this.props.submit(this.state.displayName);
    });
  };

  render() {
    return (
      <form noValidate onSubmit={this.handleSubmit}>
        <p>
          {t(
            'Choose the name you would like to appear in Firefox and when managing your account.'
          )}
        </p>
        <div className="input-row">
          <input
            type="text"
            className="text display-name"
            placeholder={t('Display name')}
            value={this.state.displayName}
            onChange={this.handleChange}
            ref={(input) => (this._input = input)}
            autoComplete="off"
          />
        </div>
        <div className="button-row">
          <button
            type="submit"
            id="submit_display"
            className="settings-button primary-button"
            disabled={this.state.disableChangeButton}
          >
            {t('Change')}
          </button>
          <button className="settings-button secondary-button cancel">
            {t('Cancel')}
          </button>
        </div>
      </form>
    );
  }
}

/* BaseView template is used to satisfy the expectations of container view.
 * The onProfileUpdate function calls the render each time the profile is updated.
 * The render function further renders the DisplayName component in the DOM.
 * The form for the Display Name is handled by DisplayNameFormComponent. Whenever
 * the Change button is clicked, it submits the form. The submit function
 * of the BaseView is passed as a props in that React class and is called
 * there by the handleSubmit property of forms in React. */

const View = BaseView.extend({
  template: () => '<div />',
  className: 'display-name',

  onProfileUpdate() {
    this.render();
  },

  openPanel() {
    // force a re-render so that the input element is focused.
    return this.render();
  },

  submit(displayName) {
    const start = Date.now();
    const account = this.getSignedInAccount();
    displayName = displayName.trim();
    return account.postDisplayName(displayName).then(() => {
      this.logViewEvent('success');
      this.updateDisplayName(displayName);
      this.displaySuccess(t('Display name updated'));
      this.logFlowEvent(`timing.displayName.change.${Date.now() - start}`);
      this.navigate('settings');
    });
  },

  render() {
    var account = this.getSignedInAccount();
    return Promise.all([translator.fetch(), account.fetchProfile()]).then(
      () => {
        ReactDOM.render(
          <DisplayName
            account={account}
            submit={(displayName) => this.submit(displayName)}
            displayName={account.get('displayName')}
          />,
          this.$el.get(0)
        );
        return true;
      }
    );
  },
});

Cocktail.mixin(View, AvatarMixin, SettingsPanelMixin);

export default View;
