/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow users to report a signin.
 */
import AuthErrors from '../lib/auth-errors';
import Constants from '../lib/constants';
import FormView from './form';
import Template from 'templates/report_sign_in.mustache';
import SignInToReport from '../models/verification/report-sign-in';

const View = FormView.extend({
  className: 'report-sign-in',
  template: Template,

  initialize(options = {}) {
    this._signInToReport = new SignInToReport(this.getSearchParams());
  },

  beforeRender() {
    if (! this._signInToReport.isValid()) {
      this.logError(AuthErrors.toError('DAMAGED_REJECT_UNBLOCK_LINK'));
    }
  },

  submit() {
    const signInToReport = this._signInToReport;
    const account = this.user.initAccount({
      uid: signInToReport.get('uid'),
    });
    const unblockCode = signInToReport.get('unblockCode');

    return this.user
      .rejectAccountUnblockCode(account, unblockCode)
      .then(() => this.navigate('signin_reported'));
  },

  setInitialContext(context) {
    const isLinkDamaged = ! this._signInToReport.isValid();
    const isLinkValid = ! isLinkDamaged;
    const supportLink = this._getSupportLink();

    context.set({
      escapedSupportLink: encodeURI(supportLink),
      hasSupportLink: !! supportLink,
      isLinkDamaged,
      isLinkValid,
    });
  },

  /**
   * Get the SUMO link for `Why is this happening to me?`. Could be
   * `undefined` if no link is available.
   *
   * @returns {String}
   */
  _getSupportLink() {
    return Constants.BLOCKED_SIGNIN_SUPPORT_URL;
  },
});

export default View;
