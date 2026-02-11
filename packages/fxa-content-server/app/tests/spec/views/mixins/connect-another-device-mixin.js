/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Backbone from 'backbone';
import BaseView from 'views/base';
import ConnectAnotherDeviceMixin from 'views/mixins/connect-another-device-mixin';
import Constants from 'lib/constants';
import ExperimentMixin from 'views/mixins/experiment-mixin';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import Template from 'templates/test_template.mustache';
import User from 'models/user';
import UserAgentMixin from 'lib/user-agent-mixin';
import helpers from '../../../lib/helpers';
import VerificationReasonMixin from 'views/mixins/verification-reason-mixin';

const { createRandomHexString } = helpers;

const VALID_UID = createRandomHexString(Constants.UID_LENGTH);

var View = BaseView.extend({
  template: Template,
  viewName: 'connect-another-device',
});

Cocktail.mixin(
  View,
  ConnectAnotherDeviceMixin,
  ExperimentMixin,
  UserAgentMixin,
  VerificationReasonMixin
);

describe('views/mixins/connect-another-device-mixin', () => {
  let account;
  let model;
  let notifier;
  let relier;
  let user;
  let view;

  beforeEach(() => {
    model = new Backbone.Model({ type: 'signin' });
    notifier = new Notifier();
    relier = new Relier();
    user = new User();

    view = new View({
      model,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'logFlowEvent').callsFake(() => {});

    account = user.initAccount({
      email: 'a@a.com',
      sessionToken: 'foo',
      uid: VALID_UID,
    });
  });

  describe('isEligibleForConnectAnotherDevice', () => {
    it('returns true for signup if a different user is not signed in', () => {
      sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => false);
      assert.isTrue(view.isEligibleForConnectAnotherDevice(account));
    });

    it('returns false for signup if different user signed in', () => {
      sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => true);
      assert.isFalse(view.isEligibleForConnectAnotherDevice(account));
    });
  });

  describe('navigateToConnectAnotherDeviceScreen', () => {
    describe('not eligible for CAD', () => {
      it('rejects with an error', () => {
        sinon
          .stub(view, 'isEligibleForConnectAnotherDevice')
          .callsFake(() => false);
        return view
          .navigateToConnectAnotherDeviceScreen(account)
          .then(assert.fail, (err) => {
            assert.ok(err);
          });
      });
    });

    describe('eligible for CAD', () => {
      beforeEach(() => {
        sinon
          .stub(view, 'isEligibleForConnectAnotherDevice')
          .callsFake(() => true);
        sinon.stub(view, 'navigate').callsFake(() => {});
      });
    });
  });
});
