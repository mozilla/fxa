/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import FormView from '../form';
import preventDefaultThen from '../decorators/prevent_default_then';
import Template from '../../templates/push/send_login.mustache';
import SessionVerificationPollMixin from '../mixins/session-verification-poll-mixin';
import Cocktail from '../../lib/cocktail';
import FlowEventsMixin from '../mixins/flow-events-mixin';

const proto = FormView.prototype;

class SendPushLoginView extends FormView {
  template = Template;

  events = assign(this.events, {
    'click #resend': preventDefaultThen('resend'),
    'click #send-email': preventDefaultThen('useEmailCode'),
  });

  beforeRender() {
    const account = this.getSignedInAccount();
    return account
      .sendPushLoginRequest()
      .then(() => this.invokeBrokerMethod('beforeSignIn', account));
  }

  afterVisible() {
    const account = this.getSignedInAccount();
    return proto.afterVisible
      .call(this)
      .then(() => this.broker.persistVerificationData(account))
      .then(() =>
        this.invokeBrokerMethod('beforeSignUpConfirmationPoll', account)
      )
      .then(() => {
        return this.waitForSessionVerification(account, () => {
          this.logViewEvent('verification.success');
          this.notifier.trigger('verification.success');

          return this.invokeBrokerMethod(
            'afterCompleteSignInWithCode',
            account
          );
        });
      });
  }

  resend() {
    const account = this.getSignedInAccount();
    return account
      .sendPushLoginRequest()
      .then(() => {
        this.displaySuccess('Notification sent');
      })
      .catch(() => {
        this.displayError('Something went wrong');
      });
  }

  useEmailCode() {
    const account = this.getSignedInAccount();
    return account.verifySessionResendCode().then(() => {
      return this.navigate('/signin_token_code');
    });
  }
}

Cocktail.mixin(
  SendPushLoginView,
  FlowEventsMixin,
  SessionVerificationPollMixin
);

export default SendPushLoginView;
