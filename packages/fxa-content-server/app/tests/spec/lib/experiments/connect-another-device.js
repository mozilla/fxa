/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Experiment = require('lib/experiments/connect-another-device');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');

  let experiment;
  let notifier;

  describe('lib/experiments/connect-another-device', () => {
    beforeEach(() => {
      notifier = new Notifier();
      experiment = new Experiment();
      experiment.initialize('connectAnotherDevice', {
        able: {
          choose: sinon.spy(() => 'choice')
        },
        metrics: {
          isCollectionEnabled: () => true,
          logEvent: sinon.spy()
        },
        notifier,
        user: {
          get: () => 'uuid'
        },
        window
      });

      sinon.stub(experiment, 'saveState', () => {});
    });

    function testNotificationSavesState(notification, data, expectedState) {
      describe(notification, () => {
        it(`updates state with ${expectedState}`, () => {
          notifier.trigger(notification, data);
          assert.isTrue(experiment.saveState.calledWith(expectedState));
        });
      });
    }

    testNotificationSavesState(
      'connectAnotherDevice.install_from.fennec', null, 'install_from.fennec');
    testNotificationSavesState(
      'connectAnotherDevice.install_from.other', null, 'install_from.other');
    testNotificationSavesState(
      'connectAnotherDevice.install_from.other_android', null, 'install_from.other_android');
    testNotificationSavesState(
      'connectAnotherDevice.install_from.other_ios', null, 'install_from.other_ios');
    testNotificationSavesState(
      'connectAnotherDevice.other_user_signed_in', null, 'other_user_signed_in');
    testNotificationSavesState('connectAnotherDevice.signedin.false', null, 'signedin.false');
    testNotificationSavesState('connectAnotherDevice.signedin.true', null, 'signedin.true');
    testNotificationSavesState('connectAnotherDevice.signin.clicked', null, 'signin.clicked');
    testNotificationSavesState('connectAnotherDevice.signin.eligible', null, 'signin.eligible');
    testNotificationSavesState('connectAnotherDevice.signin.ineligible', null, 'signin.ineligible');
    testNotificationSavesState(
      'connectAnotherDevice.signin_from.desktop', null, 'signin_from.desktop');
    testNotificationSavesState(
      'connectAnotherDevice.signin_from.fennec', null, 'signin_from.fennec');
    testNotificationSavesState(
      'connectAnotherDevice.signin_from.fxios', null, 'signin_from.fxios');
    testNotificationSavesState('marketing.clicked', { type: 'ios' }, 'marketing.click.ios');
    testNotificationSavesState('marketing.impression', { type: 'ios' }, 'marketing.impression.ios');
  });
});
