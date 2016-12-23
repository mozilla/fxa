/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The connect-another-device experiment is to see whether we can nudge
 * users to connect a 2nd device when they verify their email address.
 *
 * Instead of the normal "sign(up|in)_complete" screen, users in the
 * treatment group are presented with an alternative "connect another device"
 * screen that encourages users to either sign in if they are in a Firefox
 * with WebChannel support, or to install a Firefox for mobile if on a
 * mobile device.
 */
define(function (require, exports, module) {
  'use strict';

  const BaseExperiment = require('lib/experiments/base');
  const { createSaveStateDelegate } = BaseExperiment;

  module.exports = BaseExperiment.extend({
    notifications: {
      'connectAnotherDevice.install_from.fennec': createSaveStateDelegate('install_from.fennec'),
      'connectAnotherDevice.install_from.other': createSaveStateDelegate('install_from.other'),
      'connectAnotherDevice.install_from.other_android':
        createSaveStateDelegate('install_from.other_android'),
      'connectAnotherDevice.install_from.other_ios':
        createSaveStateDelegate('install_from.other_ios'),
      'connectAnotherDevice.other_user_signed_in': createSaveStateDelegate('other_user_signed_in'),
      'connectAnotherDevice.signedin.false': createSaveStateDelegate('signedin.false'),
      'connectAnotherDevice.signedin.true': createSaveStateDelegate('signedin.true'),
      'connectAnotherDevice.signin.clicked': createSaveStateDelegate('signin.clicked'),
      'connectAnotherDevice.signin.eligible': createSaveStateDelegate('signin.eligible'),
      'connectAnotherDevice.signin.ineligible': createSaveStateDelegate('signin.ineligible'),
      'connectAnotherDevice.signin_from.desktop': createSaveStateDelegate('signin_from.desktop'),
      'connectAnotherDevice.signin_from.fennec': createSaveStateDelegate('signin_from.fennec'),
      'connectAnotherDevice.signin_from.fxios': createSaveStateDelegate('signin_from.fxios'),
      'marketing.clicked': '_onMarketingClick',
      'marketing.impression': '_onMarketingImpression'
    },

    _onMarketingClick ({ type }) {
      this.saveState(`marketing.click.${type}`);
    },

    _onMarketingImpression ({ type }) {
      this.saveState(`marketing.impression.${type}`);
    }
  });
});
