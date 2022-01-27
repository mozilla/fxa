/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import _ from 'underscore';
import allowOnlyOneSubmit from './decorators/allow_only_one_submit';
import AccountByUidMixin from './mixins/account-by-uid-mixin';
import AvatarMixin from './mixins/avatar-mixin';
import BaseView from './base';
import 'chosen-js';
import Cocktail from 'cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import KeyCodes from '../lib/key-codes';
import LoadingMixin from './mixins/loading-mixin';
import 'modal';
import PaymentServer from '../lib/payment-server';
import preventDefaultThen from './decorators/prevent_default_then';
import SettingsHeaderTemplate from 'templates/partial/settings-header.mustache';
import Strings from '../lib/strings';
import SubscriptionModel from 'models/subscription';
import SupportForm from 'models/support-form';
import SupportFormErrorTemplate from 'templates/partial/support-form-error.mustache';
import SupportFormSuccessTemplate from 'templates/partial/support-form-success.mustache';
import Template from 'templates/support.mustache';
import { getProductSupportApps } from 'fxa-shared/subscriptions/metadata';

const productPrefix = 'FxA - ';

const t = (msg) => msg;

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
    this.supportForm = new SupportForm();
    this.productSupportApps = {};

    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }
  },

  setInitialContext(context) {
    const account = this.getSignedInAccount();
    context.set({
      unsafeHeaderHTML: this._getHeaderHTML(account),
    });
  },

  events: {
    'change #product': 'onFormChange',
    'change #topic': 'onFormChange',
    'keyup #message': 'onFormChange',
    'click button[type=submit]': 'submitSupportForm',
    'click button.cancel': 'navigateToSubscriptions',
    keyup: 'onKeyUp',
  },

  // Prevent App view's handler
  onKeyUp(event) {
    if (event.which === KeyCodes.ESCAPE) {
      event.stopPropagation();
    }
  },

  beforeRender() {
    const account = this.getSignedInAccount();

    return account.getSubscriptions().then((subscriptions) => {
      if (subscriptions.length) {
        this.model.set('subscriptions', subscriptions);

        return account
          .fetchSubscriptionPlans()
          .then((plans) => {
            const productSupportApps =
              getProductSupportApps(subscriptions)(plans);
            this.productSupportApps = productSupportApps;
          })
          .then(() => account.fetchProfile());
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
    this.productEl = this.$('#product');
    this.topicEl = this.$('#topic');
    this.submitBtn = this.$('button[type="submit"]');
    this.submitText = this.$('.submit-content');
    this.submitSpinner = this.$('.spinner');
    this.cancelBtn = this.$('button.cancel');
    this.appEl = this.$('#app');
    // hidden until a product with the required metadata is selected
    this.appEl.parent().parent().hide();
    this.subjectEl = this.$('#subject');
    this.messageEl = this.$('#message');
    this.productEl.chosen({
      disable_search: true,
      width: '100%',
    });
    this.topicEl.chosen({
      disable_search: true,
      width: '100%',
    });
    this.appEl.chosen({
      disable_search: true,
      width: '100%',
    });

    // Have screen readers use the form label for the drop down
    $('div.chosen-drop ul').each(function () {
      $(this).attr(
        'aria-labelledby',
        $(this).closest('.support-field').find('label').attr('id')
      );
    });

    return proto.afterVisible.call(this).then(this._showAvatar.bind(this));
  },

  _showAvatar() {
    var account = this.getSignedInAccount();
    return this.displayAccountProfileImage(account);
  },

  onFormChange(e) {
    e.stopPropagation();

    const productName = this.productEl.val();
    const subscription = this.findSubscription(productName);
    if (subscription) {
      this.notifier.trigger(
        'subscription.initialize',
        new SubscriptionModel(
          {
            planId: subscription.plan_id || subscription.sku,
            productId: subscription.product_id,
          },
          {
            window: this.window,
          }
        )
      );
    }

    // We need to update the product specific app/service options when the
    // product selection has changed
    if (e.target.id === 'product') {
      const apps =
        subscription && this.productSupportApps[subscription.product_id]
          ? this.productSupportApps[subscription.product_id]
          : [];

      if (apps.length) {
        this.appEl
          .empty()
          .append('<option value="">&nbsp;</option>')
          .append(
            apps
              .map(_.escape)
              .map((a) => `<option value="${a}">${a}</option>`)
              .join('')
          )
          .prop('disabled', false);
        this.appEl.parent().parent().slideDown();
      } else {
        this.appEl.empty().prop('disabled', true);
        this.appEl.parent().parent().slideUp();
      }

      this.appEl.trigger('chosen:updated');
    }

    const topic = this.topicEl.val();
    this.supportForm.set({
      productName: this.formatProductName(productName),
      topic: topic,
      app: this.appEl.val() || '',
      subject: this.subjectEl.val().trim(),
      message: this.messageEl.val().trim(),
      product: this.supportForm.getProductTag(productName),
      category: this.supportForm.getCategoryTag(topic),
    });

    if (this.supportForm.isValid()) {
      this.submitBtn.prop('disabled', false);
    } else {
      this.submitBtn.prop('disabled', true);
    }
  },

  findSubscription: function (productName) {
    const subscriptions = this.model.get('subscriptions');
    return subscriptions.find((sub) => sub.product_name === productName);
  },

  formatProductName: function (name) {
    return `${productPrefix}${name}`;
  },

  unformatProductName: function (name) {
    return name.slice(productPrefix.length);
  },

  submitButtonUIToggle: function () {
    this.submitText.toggleClass('hidden');
    this.submitSpinner.toggleClass('hidden');
    this.submitBtn.prop('disabled', !this.submitBtn.prop('disabled'));
    this.cancelBtn.prop('disabled', !this.cancelBtn.prop('disabled'));
  },

  closeModalReset: function (button) {
    this.submitBtn.prop('disabled', false);
    this.cancelBtn.prop('disabled', false);

    this.submitText.removeClass('hidden');
    this.submitSpinner.addClass('hidden');
  },

  submitSupportForm: preventDefaultThen(
    allowOnlyOneSubmit(function () {
      const account = this.getSignedInAccount();
      const supportTicket = _.clone(this.supportForm.attributes);
      this.submitButtonUIToggle();
      this.logFlowEvent('submit', this.viewName);
      return account
        .createSupportTicket(supportTicket)
        .then(this.handleFormResponse.bind(this))
        .then(this.submitButtonUIToggle.bind(this))
        .catch(this.displayErrorMessage.bind(this));
    })
  ),

  handleFormResponse(resp) {
    if (resp.success === true) {
      this.logFlowEvent('success', this.viewName);
      this.displaySuccessMessage();
      this.logFlowEvent('complete', this.viewName);
    } else {
      this.displayErrorMessage();
    }
  },

  displaySuccessMessage() {
    // The message is slightly different if the user selected "Other" for the
    // subscription product
    let message;
    const productName = this.unformatProductName(
      this.supportForm.attributes.productName
    );
    const escapedLowercaseTopic = _.escape(
      this.supportForm.getLoweredTopic(this.supportForm.attributes.topic)
    );
    const escapedSelectedProduct = _.escape(productName);

    if (productName === t('Other')) {
      message = t(
        "Thank you for reaching out to Mozilla Support about <b>%(escapedLowercaseTopic)s</b>. We'll contact you via email as soon as possible."
      );
    } else {
      message = t(
        "Thank you for reaching out to Mozilla Support about <b>%(escapedLowercaseTopic)s</b> for <b>%(escapedSelectedProduct)s</b>. We'll contact you via email as soon as possible."
      );
    }

    message = Strings.interpolate(this.unsafeTranslate(message), {
      escapedSelectedProduct,
      escapedLowercaseTopic,
    });
    const selector = '.modal.dialog-success';
    const successModal = this.renderTemplate(SupportFormSuccessTemplate, {
      message,
    });
    $('body').append(successModal);
    $(selector).modal({
      escapeClose: false,
      clickClose: false,
      showClose: false,
    });
    $(selector)
      .find('button')
      .on('click', this.navigateToSubscriptions.bind(this));
  },

  displayErrorMessage() {
    this.logFlowEvent('fail', this.viewName);
    const selector = '.modal.dialog-error';
    // Inject the error modal if it's not already there.
    if (!$(selector).length) {
      const errorModal = this.renderTemplate(SupportFormErrorTemplate);
      $('body').append(errorModal);
    }
    $(selector).modal({
      closeText: '',
    });

    $(selector).on('modal:close', this.closeModalReset.bind(this));
  },

  navigateToSubscriptions(e) {
    e.preventDefault();
    this.navigateToSubscriptionsManagement();
  },

  navigateToSubscriptionsManagement(queryParams = {}) {
    // Flow events need to be initialized before the navigation
    // so the flow_id and flow_begin_time are propagated
    this.initializeFlowEvents();

    PaymentServer.navigateToPaymentServer(
      this,
      this._subscriptionsConfig,
      'subscriptions',
      queryParams
    );
  },
});

Cocktail.mixin(
  SupportView,
  AccountByUidMixin,
  AvatarMixin,
  FlowEventsMixin,
  LoadingMixin
);

export default SupportView;
