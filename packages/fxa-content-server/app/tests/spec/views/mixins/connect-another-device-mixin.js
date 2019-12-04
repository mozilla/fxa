/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
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
        return view._isEligibleForSms(account).then(resp => {
          assert.isFalse(resp.ok);
          assert.isTrue(view._areSmsRequirementsMet.calledOnce);
          assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
          assert.isFalse(account.smsStatus.called);
        });
      });
    });

    describe('pre-reqs are met, auth-server blocks', () => {
      beforeEach(() => {
        sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
        sinon.stub(view, '_smsCountry').callsFake(() => Promise.resolve());
      });

      it('resolves to object with `ok: false`', () => {
        return view._isEligibleForSms(account).then(resp => {
          assert.isFalse(resp.ok);

          assert.isTrue(view._areSmsRequirementsMet.calledOnce);
          assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
          assert.isTrue(view._smsCountry.calledOnce);
          assert.isTrue(view._smsCountry.calledWith(account));
        });
      });
    });

    describe('pre-reqs are met, auth-server says OK', () => {
      beforeEach(() => {
        sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
        sinon.stub(view, '_smsCountry').callsFake(() => Promise.resolve('GB'));
      });

      it('resolves to object with `ok: true, country: GB`', () => {
        return view._isEligibleForSms(account).then(resp => {
          assert.isTrue(resp.ok);
          assert.equal(resp.country, 'GB');

          assert.isTrue(view._areSmsRequirementsMet.calledOnce);
          assert.isTrue(view._areSmsRequirementsMet.calledWith(account));
          assert.isTrue(view._smsCountry.calledOnce);
          assert.isTrue(view._smsCountry.calledWith(account));
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
            isIos: () => false,
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
            isIos: () => true,
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
            isIos: () => false,
          };
        });
        account.unset('sessionToken');
        sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => true);
      });

      it('returns `false', () => {
        assert.isFalse(view._areSmsRequirementsMet(account));
        assert.isTrue(view.logFlowEvent.calledOnce);
        assert.isTrue(
          view.logFlowEvent.calledWith('sms.ineligible.no_session')
        );
      });
    });

    describe('another user is signed in', () => {
      beforeEach(() => {
        sinon.stub(view, 'isSignUp').callsFake(() => true);
        sinon.stub(view, 'isInExperiment').callsFake(() => true);
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isIos: () => false,
          };
        });
        sinon.stub(user, 'isAnotherAccountSignedIn').callsFake(() => true);
      });

      it('returns `false', () => {
        assert.isFalse(view._areSmsRequirementsMet(account));
        assert.isTrue(view.logFlowEvent.calledOnce);
        assert.isTrue(
          view.logFlowEvent.calledWith('sms.ineligible.other_user_signed_in')
        );
      });
    });

    describe('user is eligible', () => {
      beforeEach(() => {
        sinon.stub(view, 'isSignUp').callsFake(() => true);
        sinon.stub(view, 'isInExperiment').callsFake(() => true);
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isIos: () => false,
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
      sinon
        .stub(account, 'smsStatus')
        .callsFake(() => Promise.resolve({ country: 'GB', ok: true }));
      sinon.stub(view, 'isInExperiment').callsFake(() => true);

      return view._smsCountry(account).then(country => {
        assert.equal(country, 'GB');

        assert.isTrue(view.logFlowEvent.calledOnce);
        assert.isTrue(view.logFlowEvent.calledWith('sms.status.country.GB'));
      });
    });

    it('resolves to `undefined` if auth-server responds ok: false', () => {
      sinon
        .stub(account, 'smsStatus')
        .callsFake(() => Promise.resolve({ country: 'AZ', ok: false }));

      return view._smsCountry(account).then(country => {
        assert.isUndefined(country);

        assert.isTrue(view.logFlowEvent.calledTwice);
        assert.isTrue(view.logFlowEvent.calledWith('sms.status.country.AZ'));
        assert.isTrue(
          view.logFlowEvent.calledWith('sms.ineligible.unsupported_country')
        );
      });
    });

    it('handles XHR errors', () => {
      const err = AuthErrors.toError('UNEXPECTED_ERROR');

      sinon.stub(account, 'smsStatus').callsFake(() => Promise.reject(err));
      sinon.stub(view, 'logError').callsFake(() => {});

      return view._smsCountry(account).then(country => {
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
        sinon
          .stub(view, 'isEligibleForConnectAnotherDevice')
          .callsFake(() => false);
        return view
          .navigateToConnectAnotherDeviceScreen(account)
          .then(assert.fail, err => {
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

      describe('not eligible for SMS', () => {
        it('redirects to /connect_another_device without additional logging', () => {
          return view.navigateToConnectAnotherDeviceScreen(account).then(() => {
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(
              view.navigate.calledWith('connect_another_device', {
                account,
                showSuccessMessage: true,
                type: 'signin',
              })
            );
          });
        });
      });
    });

    describe('getEligibleSmsCountry', () => {
      describe('eligible for SMS', () => {
        beforeEach(() => {
          sinon
            .stub(view, '_isEligibleForSms')
            .callsFake(() => Promise.resolve({ country: 'GB', ok: true }));
          sinon.spy(notifier, 'trigger');
        });

        describe('user is not part of experiment', () => {
          it('logs a flow event', () => {
            sinon
              .stub(view, 'getAndReportExperimentGroup')
              .callsFake(() => false);
            return view.getEligibleSmsCountry(account).then(country => {
              assert.isUndefined(country);

              assert.isTrue(notifier.trigger.calledOnce);
              assert.isTrue(notifier.trigger.calledWith('flow.initialize'));

              assert.isTrue(view.logFlowEvent.calledOnce);
              assert.isTrue(
                view.logFlowEvent.calledWith('sms.ineligible.not_in_experiment')
              );
            });
          });
        });

        describe('country is fully rolled out', () => {
          it('returns the country', () => {
            sinon
              .stub(view, 'getAndReportExperimentGroup')
              .callsFake(() => true);
            return view.getEligibleSmsCountry(account).then(country => {
              assert.equal(country, 'GB');

              assert.isFalse(view.logFlowEvent.called);
            });
          });
        });

        describe('in treatment group', () => {
          it('returns the country', () => {
            sinon
              .stub(view, 'getAndReportExperimentGroup')
              .callsFake(() => 'treatment');
            return view.getEligibleSmsCountry(account).then(country => {
              assert.equal(country, 'GB');
            });
          });
        });

        describe('in control group', () => {
          it('does not return a country', () => {
            sinon
              .stub(view, 'getAndReportExperimentGroup')
              .callsFake(() => 'control');
            return view.getEligibleSmsCountry(account).then(country => {
              assert.isUndefined(country);

              assert.isTrue(view.logFlowEvent.calledOnce);
              assert.isTrue(
                view.logFlowEvent.calledWith('sms.ineligible.control_group')
              );
            });
          });
        });
      });
    });

    describe('replaceCurrentPageWithSmsScreen', () => {
      it('delegates to replaceCurrentPage', () => {
        sinon.spy(view, 'replaceCurrentPage');

        const account = {};
        view.replaceCurrentPageWithSmsScreen(account, 'GB', true);

        assert.isTrue(view.replaceCurrentPage.calledOnce);
        assert.isTrue(
          view.replaceCurrentPage.calledWith('sms', {
            account,
            country: 'GB',
            showSuccessMessage: true,
            type: 'signin',
          })
        );
      });
    });
  });
});
