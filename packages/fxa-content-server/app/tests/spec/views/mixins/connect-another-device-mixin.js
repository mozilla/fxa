/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const BaseView = require('views/base');
  const ConnectAnotherDeviceMixin = require('views/mixins/connect-another-device-mixin');
  const Constants = require('lib/constants');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const Cocktail = require('cocktail');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const Template = require('stache!templates/test_template');
  const User = require('models/user');
  const UserAgentMixin = require('lib/user-agent-mixin');
  const { createRandomHexString } = require('../../../lib/helpers');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  const VALID_UID = createRandomHexString(Constants.UID_LENGTH);

  var View = BaseView.extend({
    template: Template,
    viewName: 'connect-another-device'
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
        user
      });

      sinon.stub(view, 'logFlowEvent').callsFake(() => {});

      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'foo',
        uid: VALID_UID
      });
    });

    describe('isEligibleForConnectAnotherDeviceOnSignin', () => {
      it('returns true if signing in, if eligible for CAD, and is part of the experiment', () => {
        sinon.stub(view, 'isSignIn').callsFake(() => true);
        sinon.stub(view, 'isEligibleForConnectAnotherDevice').callsFake(() => true);
        sinon.stub(view, 'getExperimentGroup').callsFake(() => 'treatment');

        assert.isTrue(view.isEligibleForConnectAnotherDeviceOnSignin(account));
      });

      it('returns false if signing up, if eligible for CAD, and is part of the experiment', () => {
        sinon.stub(view, 'isSignIn').callsFake(() => false);
        sinon.stub(view, 'isEligibleForConnectAnotherDevice').callsFake(() => true);
        sinon.stub(view, 'getExperimentGroup').callsFake(() => 'treatment');

        assert.isFalse(view.isEligibleForConnectAnotherDeviceOnSignin(account));
      });

      it('returns false if signing in, not eligible for CAD, and is part of the experiment', () => {
        sinon.stub(view, 'isSignIn').callsFake(() => true);
        sinon.stub(view, 'isEligibleForConnectAnotherDevice').callsFake(() => false);
        sinon.stub(view, 'getExperimentGroup').callsFake(() => 'treatment');

        assert.isFalse(view.isEligibleForConnectAnotherDeviceOnSignin(account));
      });

      it('returns false if signing in, not eligible for CAD, and is part of the experiment', () => {
        sinon.stub(view, 'isSignIn').callsFake(() => true);
        sinon.stub(view, 'isEligibleForConnectAnotherDevice').callsFake(() => true);
        sinon.stub(view, 'getExperimentGroup').callsFake(() => false);

        assert.isFalse(view.isEligibleForConnectAnotherDeviceOnSignin(account));
      });
    });

    describe('navigateToConnectAnotherDeviceOnSigninScreen', () => {
      beforeEach(() => {
        sinon.stub(view, 'isEligibleForConnectAnotherDeviceOnSignin').callsFake(() => true);
        sinon.stub(view, 'navigateToConnectAnotherDeviceScreen').callsFake(() => p());
        sinon.spy(view, 'createExperiment');
        sinon.spy(notifier, 'trigger');
      });

      describe('user is part of treatment', () => {
        it('sets up experiment, delegates to `navigateToConnectAnotherDeviceScreen`', () => {
          sinon.stub(view, 'getExperimentGroup').callsFake(() => 'treatment');

          return view.navigateToConnectAnotherDeviceOnSigninScreen(account)
            .then(() => {
              assert.isTrue(notifier.trigger.calledWith('flow.initialize'));

              assert.isTrue(view.createExperiment.calledOnce);
              assert.isTrue(view.createExperiment.calledWith('sendSms', 'cadOnSignin.treatment'));

              assert.isTrue(view.navigateToConnectAnotherDeviceScreen.calledOnce);
              assert.isTrue(view.navigateToConnectAnotherDeviceScreen.calledWith(account));
            });
        });
      });

      describe('user is part of control', () => {
        it('sets up experiment, does nothing more', () => {
          sinon.stub(view, 'getExperimentGroup').callsFake(() => 'control');

          return view.navigateToConnectAnotherDeviceOnSigninScreen(account)
            .then(() => {
              assert.isTrue(notifier.trigger.calledWith('flow.initialize'));

              assert.isTrue(view.createExperiment.calledOnce);
              assert.isTrue(view.createExperiment.calledWith('sendSms', 'cadOnSignin.control'));

              assert.isFalse(view.navigateToConnectAnotherDeviceScreen.called);
            });
        });
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

    describe('_isEligibleForSms', () => {
      beforeEach(() => {
        relier.set('country', 'US');
      });

      describe('pre-reqs are not met', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => false);
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

      describe('pre-reqs are met, auth-server blocks, Experiment choice rules say OK', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
          sinon.spy(view, 'isInExperiment');
          sinon.stub(account, 'smsStatus').callsFake(() => p({ country: 'US', ok: false }));
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

      describe('pre-reqs are met, auth-server errors, Experiment choice rules say OK', () => {
        let err;

        beforeEach(() => {
          err = AuthErrors.toError('UNEXPECTED_ERROR');
          sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
          sinon.spy(view, 'isInExperiment');
          sinon.spy(view, 'logError');
          sinon.stub(account, 'smsStatus').callsFake(() => p.reject(err));
        });

        it('resolves to object with `ok: false`, logs error', () => {
          return view._isEligibleForSms(account)
            .then((resp) => {
              assert.isFalse(resp.ok);
              assert.isTrue(view._areSmsRequirementsMet.calledOnce);
              assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
              assert.isTrue(account.smsStatus.calledOnce);
              assert.isTrue(account.smsStatus.calledWith({ country: 'US' }));

              assert.isTrue(view.logError.calledOnce);
              assert.isTrue(view.logError.calledWith(err));
              // context is updated to include extra `.smsStatus` for reporting.
              assert.equal(err.context, 'connect-another-device.smsStatus');
            });
        });
      });

      describe('pre-reqs are met, auth-server says OK, Experiment choice rules block', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => false);
          sinon.stub(account, 'smsStatus').callsFake(() => p({ country: 'US', ok: true }));
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

      describe('pre-reqs are met, auth-server says OK, Experiment choice rules say OK', () => {
        beforeEach(() => {
          sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake((experimentName) => experimentName === 'sendSmsEnabledForCountry');
          sinon.stub(account, 'smsStatus').callsFake(() => p({ country: 'US', ok: true }));
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
      describe('user is on Android', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => true);
          sinon.stub(view, 'getUserAgent').callsFake(() => {
            return {
              isAndroid: () => true,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
          assert.isTrue(view.logFlowEvent.calledOnce);
          assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.android'));
        });
      });

      describe('user is on iOS', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => true);
          sinon.stub(view, 'getUserAgent').callsFake(() => {
            return {
              isAndroid: () => false,
              isIos: () => true
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
          assert.isTrue(view.logFlowEvent.calledOnce);
          assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.ios'));
        });
      });

      describe('no session', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => true);
          sinon.stub(view, 'getUserAgent').callsFake(() => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          account.unset('sessionToken');
          sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => true);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
          assert.isTrue(view.logFlowEvent.calledOnce);
          assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.no_session'));
        });
      });

      describe('another user is signed in', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => true);
          sinon.stub(view, 'getUserAgent').callsFake(() => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => true);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
          assert.isTrue(view.logFlowEvent.calledOnce);
          assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.other_user_signed_in'));
        });
      });

      describe('user is not part of experiment', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => false);
          sinon.stub(view, 'getUserAgent').callsFake(() => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => false);
        });

        it('returns `false', () => {
          assert.isFalse(view._areSmsRequirementsMet(account));
          assert.isTrue(view.logFlowEvent.calledOnce);
          assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.not_in_experiment'));
        });
      });

      describe('user is eligible',() => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp').callsFake(() => true);
          sinon.stub(view, 'isInExperiment').callsFake(() => true);
          sinon.stub(view, 'getUserAgent').callsFake(() => {
            return {
              isAndroid: () => false,
              isIos: () => false
            };
          });
          sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => false);
        });

        it('returns `true', () => {
          assert.isTrue(view._areSmsRequirementsMet(account));
        });
      });
    });

    describe('_smsCountry', () => {
      it('resolves to the country on success', () => {
        sinon.stub(account, 'smsStatus').callsFake(() => p({ country: 'GB', ok: true }));
        sinon.stub(view, 'isInExperiment').callsFake(() => true);

        return view._smsCountry(account)
          .then((country) => {
            assert.equal(country, 'GB');

            assert.isTrue(view.logFlowEvent.calledOnce);
            assert.isTrue(view.logFlowEvent.calledWith('sms.status.country.GB'));
          });
      });

      it('resolves to `undefined` if auth-server responds ok: false', () => {
        sinon.stub(account, 'smsStatus').callsFake(() => p({ country: 'AZ', ok: false }));

        return view._smsCountry(account)
          .then((country) => {
            assert.isUndefined(country);

            assert.isTrue(view.logFlowEvent.calledTwice);
            assert.isTrue(view.logFlowEvent.calledWith('sms.status.country.AZ'));
            assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.unsupported_country'));
          });
      });

      it('resolves to `undefined` if auth-server reported country is not supported', () => {
        sinon.stub(account, 'smsStatus').callsFake(() => p({ country: 'AZ', ok: true }));
        sinon.stub(view, 'isInExperiment').callsFake(() => false);

        return view._smsCountry(account)
          .then((country) => {
            assert.isUndefined(country);

            assert.isTrue(view.isInExperiment.calledOnce);
            assert.isTrue(view.isInExperiment.calledWith('sendSmsEnabledForCountry', { country: 'AZ' }));

            assert.isTrue(view.logFlowEvent.calledTwice);
            assert.isTrue(view.logFlowEvent.calledWith('sms.status.country.AZ'));
            assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.unsupported_country'));
          });
      });

      it('handles XHR errors', () => {
        const err = AuthErrors.toError('UNEXPECTED_ERROR');

        sinon.stub(account, 'smsStatus').callsFake(() => p.reject(err));
        sinon.stub(view, 'logError').callsFake(() => {});

        return view._smsCountry(account)
          .then((country) => {
            assert.isUndefined(country);

            assert.isTrue(view.logError.calledOnce);
            assert.isTrue(view.logError.calledWith(err));

            assert.isTrue(view.logFlowEvent.calledOnce);
            assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.xhr_error'));
          });
      });
    });

    describe('navigateToConnectAnotherDeviceScreen', () => {
      describe('not eligible for CAD', () => {
        it('rejects with an error', () => {
          sinon.stub(view, 'isEligibleForConnectAnotherDevice').callsFake(() => false);
          return view.navigateToConnectAnotherDeviceScreen(account)
            .then(assert.fail, (err) => {
              assert.ok(err);
            });
        });
      });

      describe('eligible for CAD', () => {
        beforeEach(() => {
          sinon.stub(view, 'isEligibleForConnectAnotherDevice').callsFake(() => true);
          sinon.stub(view, 'navigate').callsFake(() => {});
          sinon.stub(view, 'createExperiment').callsFake(() => {});
          sinon.spy(notifier, 'trigger');
        });

        describe('not eligible for SMS', () => {
          it('redirects to /connect_another_device', () => {
            sinon.stub(view, '_isEligibleForSms').callsFake(() => p({ ok: false }));

            return view.navigateToConnectAnotherDeviceScreen(account)
              .then(() => {
                assert.isFalse(view.createExperiment.called);

                assert.isTrue(notifier.trigger.calledOnce);
                assert.isTrue(notifier.trigger.calledWith('flow.initialize'));

                assert.isTrue(view.navigate.calledOnce);
                assert.isTrue(view.navigate.calledWith('connect_another_device', { account, type: 'signin' }));
              });
          });
        });

        describe('eligible for SMS', () => {
          beforeEach(() => {
            sinon.stub(view, '_isEligibleForSms').callsFake(() => p({ country: 'GB', ok: true }));
          });

          describe('in treatment group', () => {
            it('creates the experiment, redirects to /sms', () => {
              sinon.stub(view, 'getExperimentGroup').callsFake(() => 'treatment');
              return view.navigateToConnectAnotherDeviceScreen(account)
                .then(() => {
                  assert.isTrue(view.createExperiment.calledOnce);
                  assert.isTrue(view.createExperiment.calledWith('sendSms', 'treatment'));

                  assert.isTrue(view.navigate.calledOnce);
                  assert.isTrue(view.navigate.calledWith('sms', { account, country: 'GB', type: 'signin' }));
                });
            });
          });

          describe('in control group', () => {
            it('creates the experiment, redirects to /connect_another_device', () => {
              sinon.stub(view, 'getExperimentGroup').callsFake(() => 'control');
              return view.navigateToConnectAnotherDeviceScreen(account)
                .then(() => {
                  assert.isTrue(view.createExperiment.calledOnce);
                  assert.isTrue(view.createExperiment.calledWith('sendSms', 'control'));

                  assert.isTrue(view.navigate.calledOnce);
                  assert.isTrue(view.navigate.calledWith('connect_another_device', { account, type: 'signin' }));

                  assert.isTrue(view.logFlowEvent.calledOnce);
                  assert.isTrue(view.logFlowEvent.calledWith('sms.ineligible.control_group'));
                });
            });
          });
        });
      });
    });
  });
});
