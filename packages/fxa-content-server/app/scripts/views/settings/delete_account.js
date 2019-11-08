/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from '../form';
import PasswordMixin from '../mixins/password-mixin';
import ServiceMixin from '../mixins/settings-panel-mixin';
import Session from '../../lib/session';
import SettingsPanelMixin from '../mixins/service-mixin';
import Template from 'templates/settings/delete_account.mustache';
import AttachedClients from '../../models/attached-clients';
import { CLIENT_TYPE_WEB_SESSION } from '../../lib/constants';

const t = msg => msg;

const LOADING_INDICATOR_BUTTON = '.settings-button.settings-unit-loading';
const DELETE_ACCOUNT_BUTTON = '.delete-account-button';
const UNIT_DETAILS = '.settings-unit-details';
const CHECKBOXES = '.delete-account-checkbox';

var View = FormView.extend({
  template: Template,
  className: 'delete-account',
  viewName: 'settings.delete-account',

  initialize(options) {
    this._attachedClients = options.attachedClients;
    if (!this._attachedClients) {
      this._attachedClients = new AttachedClients([], {
        notifier: options.notifier,
      });
    }
    this._activeSubscriptions = [] || options.activeSubscriptions;
    this._uniqueBrowserNames = [];
    this._hasTwoColumnProductList = false;
    this._hideProductContainer = false;
  },

  setInitialContext(context) {
    context.set({
      email: this.getSignedInAccount().get('email'),
      clients: this._attachedClients.toJSON(),
      isPanelOpen: this.isPanelOpen(),
      subscriptions: this._activeSubscriptions,
      uniqueBrowserNames: this._uniqueBrowserNames,
      hasTwoColumnProductList: this._hasTwoColumnProductList,
      hideProductContainer: this._hideProductContainer,
    });
  },

  events: {
    'click .delete-account-checkbox': '_toggleEnableSubmit',
  },

  openPanel() {
    this.logViewEvent('open');
    this.$el.find(UNIT_DETAILS).hide();
    this.$el.find(LOADING_INDICATOR_BUTTON).show();

    return Promise.all([
      this._fetchAttachedClients(),
      this._fetchActiveSubscriptions(),
    ])
      .then(() => {
        this._uniqueBrowserNames = this._setuniqueBrowserNames();

        const numberOfProducts = this._getNumberOfProducts();
        if (numberOfProducts === 0) {
          this._hideProductContainer = true;
        } else {
          this._hasTwoColumnProductList = numberOfProducts >= 4;
        }
      })
      .catch(err => {
        this.model.set('error', err);
        this.logError(err);
        this._hideProductContainer = true;
      })
      .finally(() => this.render());
  },

  _fetchActiveSubscriptions() {
    const account = this.getSignedInAccount();
    const start = Date.now();
    return account.settingsData().then(({ subscriptions = [] } = {}) => {
      this.logFlowEvent(`timing.settings.fetch.${Date.now() - start}`);
      this._activeSubscriptions = subscriptions.filter(
        subscription => subscription.status === 'active'
      );
    });
  },

  _fetchAttachedClients() {
    const start = Date.now();
    return this._attachedClients.fetchClients(this.user).then(() => {
      this.logFlowEvent(`timing.clients.fetch.${Date.now() - start}`);
    });
  },

  _setuniqueBrowserNames() {
    // filter clients for `webSession` clientTypes with unique
    // `userAgent`, replace numeric versioning with 'browser'.
    // Ref https://github.com/mozilla/fxa/issues/2019
    return [
      ...new Set(
        this._attachedClients
          .toJSON()
          .filter(
            client =>
              client.clientType &&
              client.clientType === CLIENT_TYPE_WEB_SESSION &&
              client.userAgent
          )
          .map(({ userAgent }) => userAgent.replace(/[0-9]+/g, 'browser'))
      ),
    ].map(userAgent => ({
      name: userAgent,
    }));
  },

  _getNumberOfProducts() {
    let numberOfProducts = this._uniqueBrowserNames.length;
    for (const client of this._attachedClients.toJSON()) {
      if (client.isOAuthApp === true) {
        numberOfProducts++;
      }
    }
    for (const sub of this._activeSubscriptions) {
      if (sub.plan_id && sub.status === 'active') {
        numberOfProducts++;
      }
    }
    return numberOfProducts;
  },

  _toggleEnableSubmit() {
    if (this._allCheckboxesAreChecked()) {
      this.$(DELETE_ACCOUNT_BUTTON).attr('disabled', false);
    } else {
      this.$(DELETE_ACCOUNT_BUTTON).attr('disabled', true);
    }
  },

  _allCheckboxesAreChecked() {
    return this.$(`${CHECKBOXES}:checked`).length === this.$(CHECKBOXES).length;
  },

  submit() {
    const account = this.getSignedInAccount();
    const password = this.getElementValue('.password');

    return this.user
      .deleteAccount(account, password)
      .then(() => {
        Session.clear();
        return this.invokeBrokerMethod('afterDeleteAccount', account);
      })
      .then(() => {
        // user deleted an account
        this.logViewEvent('deleted');

        // email/uid are set in signin-mixin when a user signs in.
        // The index view checks these values to determine whether
        // to redirect a user to signup/signin. Clear them to avoid
        // sending the user directly to the signup page.
        this.relier.unset('email');
        this.relier.unset('uid');
        // force email-first until it's the default flow everywhere.
        this.relier.set('action', 'email');

        this.navigate(
          '/',
          {
            success: t('Account deleted successfully'),
          },
          {
            clearQueryParams: true,
          }
        );
      })
      .catch(err => {
        if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
          return this.showValidationError(this.$('#password'), err);
        }
        throw err;
      });
  },
});

Cocktail.mixin(View, PasswordMixin, SettingsPanelMixin, ServiceMixin);

export default View;
