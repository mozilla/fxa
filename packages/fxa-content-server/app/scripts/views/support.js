/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import allowOnlyOneSubmit from './decorators/allow_only_one_submit';
import AccountByUidMixin from './mixins/account-by-uid-mixin';
import AvatarMixin from './mixins/avatar-mixin';
import BaseView from './base';
import 'chosen-js';
import Cocktail from 'cocktail';
import LoadingMixin from './mixins/loading-mixin';
import 'modal';
import PaymentServer from '../lib/payment-server';
import preventDefaultThen from './decorators/prevent_default_then';
import SettingsHeaderTemplate from 'templates/partial/settings-header.mustache';
import SupportFormErrorTemplate from 'templates/partial/support-form-error.mustache';
import Template from 'templates/support.mustache';

const t = msg => msg;

const proto = BaseView.prototype;
const SupportView = BaseView.extend({
  template: Template,
  className: 'settings',
  layoutClassName: 'settings',
  viewName: 'support',

  // The `mustVerify` flag will ensure that the account is valid.
  mustVerify: true,

  initialize(options = {}) {
    this.getUidAndSetSignedInAccount();

    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }
  },

  setInitialContext(context) {
    const account = this.getSignedInAccount();
    context.set({
      unsafeHeaderHTML: this._getHeaderHTML(account),
      topicPlaceHolder: t('Please Select One'),
    });
  },

  events: {
    'change #topic': 'onFormChange',
    'keyup #message': 'onFormChange',
    'click button[type=submit]': 'submitSupportForm',
    'click button.cancel': 'navigateToSubscriptionsManagement',
  },

  beforeRender() {
    const account = this.getSignedInAccount();

    return account.fetchActiveSubscriptions().then(subscriptions => {
      if (subscriptions.length > 0) {
        return account.fetchProfile().then(() => this.user.setAccount(account));
      } else {
        // Note that if a user landed here, it is because:
        // a) they accessed the page directly, as the button for this page is
        //    not displayed when a user does not have any active subscriptions
        // b) the edge case where the (last) subscription expired between
        //    clicking of the button and here

        this.navigateToSubscriptionsManagement();
        return false;
      }
    });
  },

  _getHeaderHTML(account) {
    return SettingsHeaderTemplate(account.pick('displayName', 'email'));
  },

  afterVisible() {
    this.topicEl = this.$('#topic');
    this.submitBtn = this.$('button[type="submit"]');
    this.subjectEl = this.$('#subject');
    this.messageEl = this.$('#message');
    this.topicEl.chosen({ disable_search: true, width: '100%' });

    return proto.afterVisible.call(this).then(this._showAvatar.bind(this));
  },

  _showAvatar() {
    var account = this.getSignedInAccount();
    return this.displayAccountProfileImage(account);
  },

  onFormChange(e) {
    e.stopPropagation();

    if (this.messageEl.val().trim() !== '' && this.topicEl.val() !== '') {
      this.submitBtn.attr('disabled', false);
    } else {
      this.submitBtn.attr('disabled', true);
    }
  },

  submitSupportForm: preventDefaultThen(
    allowOnlyOneSubmit(function() {
      const account = this.getSignedInAccount();
      const supportTicket = this.buildSupportTicket();
      return account
        .createSupportTicket(supportTicket)
        .then(this.handleFormResponse.bind(this))
        .catch(this.displayErrorMessage.bind(this));
    })
  ),

  handleFormResponse(resp) {
    if (resp.success === true) {
      this.navigateToSubscriptionsManagement({
        successfulSupportTicketSubmission: true,
      });
    } else {
      this.displayErrorMessage();
    }
  },

  displayErrorMessage() {
    // Inject the error modal if it's not already there.
    if (!$('.modal').length) {
      const errorModal = this.renderTemplate(SupportFormErrorTemplate);
      $('body').append(errorModal);
    }
    $('.modal').modal({
      closeText: '✕',
      closeClass: 'icon-remove',
    });
  },

  navigateToSubscriptionsManagement(queryParams = {}) {
    PaymentServer.navigateToPaymentServer(
      this,
      this._subscriptionsConfig,
      'subscriptions',
      queryParams
    );
  },

  buildSupportTicket() {
    return {
      topic: this.topicEl.val(),
      subject: this.subjectEl.val().trim(),
      message: this.messageEl.val().trim(),
    };
  },
});

Cocktail.mixin(SupportView, AccountByUidMixin, AvatarMixin, LoadingMixin);

export default SupportView;
