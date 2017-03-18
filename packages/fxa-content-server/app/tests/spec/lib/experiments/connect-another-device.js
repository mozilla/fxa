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
        groupType: 'treatment',
        metrics: {
          logEvent () {},
          logExperiment () {}
        },
        notifier
      });

      sinon.stub(experiment, 'saveState', () => {});
    });

    afterEach(() => {
      experiment.destroy();
    });

    function testNotificationSavesState(notification, data, expectedState) {
      describe(notification, () => {
        it(`updates state with ${expectedState}`, () => {
          notifier.trigger(notification, data);
          assert.isTrue(experiment.saveState.calledWith(expectedState));
        });
      });
    }

    testNotificationSavesState('connectAnotherDevice.install_from.fx_android', null, 'install_from.fx_android');
    testNotificationSavesState('connectAnotherDevice.install_from.fx_desktop', null, 'install_from.fx_desktop');
    testNotificationSavesState('connectAnotherDevice.install_from.other', null, 'install_from.other');
    testNotificationSavesState('connectAnotherDevice.install_from.other_android', null, 'install_from.other_android');
    testNotificationSavesState('connectAnotherDevice.install_from.other_ios', null, 'install_from.other_ios');
    testNotificationSavesState('connectAnotherDevice.other_user_signed_in', null, 'other_user_signed_in');
    testNotificationSavesState('connectAnotherDevice.signedin.false', null, 'signedin.false');
    testNotificationSavesState('connectAnotherDevice.signedin.true', null, 'signedin.true');
    testNotificationSavesState('connectAnotherDevice.signin.clicked', null, 'signin.clicked');
    testNotificationSavesState('connectAnotherDevice.signin.eligible', null, 'signin.eligible');
    testNotificationSavesState('connectAnotherDevice.signin.ineligible', null, 'signin.ineligible');
    testNotificationSavesState('connectAnotherDevice.signin_from.fx_android', null, 'signin_from.fx_android');
    testNotificationSavesState('connectAnotherDevice.signin_from.fx_desktop', null, 'signin_from.fx_desktop');
    testNotificationSavesState('connectAnotherDevice.signin_from.fx_ios', null, 'signin_from.fx_ios');
    testNotificationSavesState('marketing.clicked', { type: 'ios' }, 'marketing.click.ios');
    testNotificationSavesState('marketing.impression', { type: 'ios' }, 'marketing.impression.ios');
  });
});
