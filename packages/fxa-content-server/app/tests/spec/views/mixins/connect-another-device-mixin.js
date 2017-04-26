/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const BaseView = require('views/base');
  const ConnectAnotherDeviceMixin = require('views/mixins/connect-another-device-mixin');
  const Constants = require('lib/constants');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const Cocktail = require('cocktail');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const Template = require('stache!templates/test_template');
  const User = require('models/user');
  const UserAgentMixin = require('views/mixins/user-agent-mixin');
  const { createRandomHexString } = require('../../../lib/helpers');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  const VALID_UID = createRandomHexString(Constants.UID_LENGTH);

  var View = BaseView.extend({
    template: Template
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
    let relier;
    let user;
    let view;

    beforeEach(() => {
      relier = new Relier();
      user = new User();

      view = new View({
        relier,
        user
      });
    });

    describe('isEligibleForConnectAnotherDevice', () => {
      beforeEach(() => {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: VALID_UID
        });
      });

      describe('user is completing sign-in', () => {
        beforeEach(() => {
          sinon.stub(user, 'getSignedInAccount', () => {
            return {
              isDefault: () => true
            };
          });
          sinon.stub(view, 'isSignUp', () => false);
        });

        it('returns `false`', () => {
          assert.isFalse(view.isEligibleForConnectAnotherDevice(account));
        });
      });

      describe('no user signed in', () => {
        beforeEach(() => {
          sinon.stub(user, 'getSignedInAccount', () => {
            return {
              isDefault: () => true
            };
          });
        });

        it('returns `true`', () => {
          assert.isTrue(view.isEligibleForConnectAnotherDevice(account));
        });
      });

      describe('different user signed in', () => {
        beforeEach(() => {
          sinon.stub(user, 'getSignedInAccount', () => {
            return {
              isDefault: () => false
            };
          });
          sinon.stub(user, 'isSignedInAccount', () => false);
        });

        it('returns `false`', () => {
          assert.isFalse(view.isEligibleForConnectAnotherDevice(account));
        });
      });

      describe('same user signed in', () => {
        beforeEach(() => {
          sinon.stub(user, 'getSignedInAccount', () => {
            return {
              isDefault: () => false
            };
          });
          sinon.stub(user, 'isSignedInAccount', () => true);
        });

        it('returns `true`', () => {
          assert.isTrue(view.isEligibleForConnectAnotherDevice(account));
        });
      });
    });

    describe('_isEligibleForSms', () => {
      beforeEach(() => {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: VALID_UID
        });

        relier.set('country', 'US');
      });

      describe('pre-reqs are not met', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet', () => false);
          sinon.spy(account, 'smsStatus');
        });

        it('resolves to object with `ok: false`', () => {
          return view._isEligibleForSms(account)
            .then((resp) => {
              assert.isFalse(resp.ok);
              assert.isTrue(view._areSmsRequirementsMet.calledOnce);
              assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
              assert.isFalse(account.smsStatus.called);
            });
        });
      });

      describe('pre-reqs are met, auth-server blocks, Able says OK', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet', () => true);
          sinon.spy(view, 'isInExperiment');
          sinon.stub(account, 'smsStatus', () => p({ country: 'US', ok: false }));
        });

        it('resolves to object with `ok: true, country: US`', () => {
          return view._isEligibleForSms(account)
            .then((resp) => {
              assert.isFalse(resp.ok);
              assert.isTrue(view._areSmsRequirementsMet.calledOnce);
              assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
              assert.isTrue(account.smsStatus.calledOnce);
              assert.isTrue(account.smsStatus.calledWith({ country: 'US' }));
              assert.isFalse(view.isInExperiment.called);
            });
        });
      });

      describe('pre-reqs are met, auth-server says OK, Able blocks', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet', () => true);
          sinon.stub(view, 'isInExperiment', () => false);
          sinon.stub(account, 'smsStatus', () => p({ country: 'US', ok: true }));
        });

        it('resolves to object with `ok: true, country: US`', () => {
          return view._isEligibleForSms(account)
            .then((resp) => {
              assert.isFalse(resp.ok);

              assert.isTrue(view._areSmsRequirementsMet.calledOnce);
              assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
              assert.isTrue(account.smsStatus.calledOnce);
              assert.isTrue(account.smsStatus.calledWith({ country: 'US' }));
              assert.isTrue(view.isInExperiment.calledOnce);
              assert.isTrue(view.isInExperiment.calledWith('sendSmsEnabledForCountry'));
            });
        });
      });

      describe('pre-reqs are met, auth-server says OK, Able says OK', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet', () => true);
          sinon.stub(view, 'isInExperiment', (experimentName) => experimentName === 'sendSmsEnabledForCountry');
          sinon.stub(account, 'smsStatus', () => p({ country: 'US', ok: true }));
        });

        it('resolves to object with `ok: true, country: US`', () => {
          return view._isEligibleForSms(account)
            .then((resp) => {
              assert.equal(resp.country, 'US');
              assert.isTrue(resp.ok);

              assert.isTrue(view._areSmsRequirementsMet.calledOnce);
              assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
              assert.isTrue(account.smsStatus.calledOnce);
              assert.isTrue(account.smsStatus.calledWith({ country: 'US' }));
              assert.isTrue(view.isInExperiment.calledOnce);
              assert.isTrue(view.isInExperiment.calledWith('sendSmsEnabledForCountry'));
            });
        });
      });
    });

    describe('_areSmsRequirementsMet', () => {
      describe('user is signing in', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => false);
          sinon.stub(view, 'isInExperiment', () => true);
          sinon.stub(view, 'getUserAgent', () => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn', () => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
        });
      });

      describe('user is on Android', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => true);
          sinon.stub(view, 'isInExperiment', () => true);
          sinon.stub(view, 'getUserAgent', () => {
            return {
              isAndroid: () => true,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn', () => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
        });
      });

      describe('user is on iOS', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => true);
          sinon.stub(view, 'isInExperiment', () => true);
          sinon.stub(view, 'getUserAgent', () => {
            return {
              isAndroid: () => false,
              isIos: () => true
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn', () => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
        });
      });

      describe('another user is signed in', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => true);
          sinon.stub(view, 'isInExperiment', () => true);
          sinon.stub(view, 'getUserAgent', () => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn', () => true);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
        });
      });

      describe('user is not part of treatment group', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => true);
          sinon.stub(view, 'isInExperiment', () => false);
          sinon.stub(view, 'getUserAgent', () => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn', () => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
        });
      });

      describe('user is eligible',() => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => true);
          sinon.stub(view, 'isInExperiment', () => true);
          sinon.stub(view, 'getUserAgent', () => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn', () => false);
        });

        it('returns `true', () => {
          assert.isTrue(view._areSmsRequirementsMet(account));
        });
      });
    });

    describe('navigateToConnectAnotherDeviceScreen', () => {
      let account;

      beforeEach(() => {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: VALID_UID
        });
      });

      describe('not eligible for CAD', () => {
        it('rejects with an error', () => {
          sinon.stub(view, 'isEligibleForConnectAnotherDevice', () => false);
          return view.navigateToConnectAnotherDeviceScreen(account)
            .then(assert.fail, (err) => {
              assert.ok(err);
            });
        });
      });

      describe('eligible for CAD', () => {
        beforeEach(() => {
          sinon.stub(view, 'isEligibleForConnectAnotherDevice', () => true);
          sinon.stub(view, 'navigate', () => {});
          sinon.stub(view, 'createExperiment', () => {});
        });

        describe('not eligible for SMS', () => {
          it('redirects to /connect_another_device', () => {
            sinon.stub(view, '_isEligibleForSms', () => p({ ok: false }));

            return view.navigateToConnectAnotherDeviceScreen(account)
              .then(() => {
                assert.isFalse(view.createExperiment.called);

                assert.isTrue(view.navigate.calledOnce);
                assert.isTrue(view.navigate.calledWith('connect_another_device', { account }));
              });
          });
        });

        describe('eligible for SMS', () => {
          beforeEach(() => {
            sinon.stub(view, '_isEligibleForSms', () => p({ country: 'GB', ok: true }));
          });

          describe('in treatment group', () => {
            it('creates the experiment, redirects to /sms', () => {
              sinon.stub(view, 'getExperimentGroup', () => 'treatment');
              return view.navigateToConnectAnotherDeviceScreen(account)
                .then(() => {
                  assert.isTrue(view.createExperiment.calledOnce);
                  assert.isTrue(view.createExperiment.calledWith('sendSms', 'treatment'));

                  assert.isTrue(view.navigate.calledOnce);
                  assert.isTrue(view.navigate.calledWith('sms', { account, country: 'GB' }));
                });
            });
          });

          describe('in control group', () => {
            it('creates the experiment, redirects to /connect_another_device', () => {
              sinon.stub(view, 'getExperimentGroup', () => 'control');
              return view.navigateToConnectAnotherDeviceScreen(account)
                .then(() => {
                  assert.isTrue(view.createExperiment.calledOnce);
                  assert.isTrue(view.createExperiment.calledWith('sendSms', 'control'));

                  assert.isTrue(view.navigate.calledOnce);
                  assert.isTrue(view.navigate.calledWith('connect_another_device', { account }));
                });
            });
          });
        });
      });
    });
  });
});
