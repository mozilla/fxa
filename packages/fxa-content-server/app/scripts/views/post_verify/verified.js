/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 *  Generic view to handle different post verify success screens.
 */
import Cocktail from 'cocktail';
import FormView from '../form';
import ServiceMixin from '../mixins/service-mixin';
import Template from 'templates/post_verify/verified.mustache';

const t = msg => msg;

const TEMPLATE_INFO = {
  SECONDARY_EMAIL_VERIFIED: {
    readyText: t(
      'Account notifications will now also be sent to %(secondaryEmail)s.'
    ),
    buttonText: t('Continue to %(serviceName)s '),
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: t('Secondary email verified'),
  },
};

class Verified extends FormView {
  template = Template;

  initialize(options = {}) {
    // This is temporary until I add the recovery key screens
    this._templateInfo = TEMPLATE_INFO['SECONDARY_EMAIL_VERIFIED'];
  }

  setInitialContext(context) {
    context.set({
      headerId: this._getHeaderId(),
      headerTitle: this._getEscapedHeaderTitle(),
      readyText: this._getReadyText(),
      buttonText: this._getButtonText(),
    });
  }

  submit() {
    return Promise.resolve()
      .then(() => {
        const { account, continueBrokerMethod } = this.model.toJSON();
        console.log(account, continueBrokerMethod);
        if (continueBrokerMethod && account) {
          return this.invokeBrokerMethod(continueBrokerMethod, account);
        }

        this.navigate('/settings');
      })
      .catch(err => this.displayError(err));
  }

  _getHeaderId() {
    return this._templateInfo.headerId;
  }

  _getEscapedHeaderTitle() {
    const title = this._templateInfo.headerTitle;
    // translateInTemplate HTML escapes
    return this.translateInTemplate(title);
  }

  _getReadyText() {
    const readyText = this._templateInfo.readyText;
    // translateInTemplate HTML escapes
    return this.translateInTemplate(readyText);
  }

  _getButtonText() {
    const buttonText = this._templateInfo.buttonText;
    // translateInTemplate HTML escapes
    return this.translateInTemplate(buttonText);
  }
}

Cocktail.mixin(Verified, ServiceMixin);

export default Verified;
