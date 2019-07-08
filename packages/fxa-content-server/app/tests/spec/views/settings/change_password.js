/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import helpers from '../../../lib/helpers';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/settings/change_password';

const { isEventLogged } = helpers;

const EMAIL = 'a@a.com';

describe('views/settings/change_password', function() {
  var account;
  var broker;
  var model;
  var metrics;
  var notifier;
  var relier;
  var user;
  var view;

  beforeEach(function() {
    model = new Backbone.Model();
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    relier = new Relier();

    broker = new Broker({
      relier: relier,
    });

    user = new User({});

    view = new View({
      broker: broker,
      metrics: metrics,
      model: model,
      notifier,
      relier: relier,
      user: user,
    });
  });

  afterEach(function() {
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('with session', function() {
    beforeEach(function() {
      account = user.initAccount({
        email: EMAIL,
        sessionToken: 'abc123',
        verified: true,
      });
      sinon.stub(account, 'isSignedIn').callsFake(function() {
        return Promise.resolve(true);
      });

      sinon.stub(view, 'getSignedInAccount').callsFake(function() {
        return account;
      });

      return view.render().then(function() {
        $('body').append(view.el);
      });
    });

    describe('render', function() {
      it('renders properly', function() {
        assert.lengthOf($('#old_password'), 1);
        assert.lengthOf($('.reset-password'), 1);
        assert.lengthOf($('#new_password'), 1);
        assert.lengthOf($('#new_vpassword'), 1);
        assert.lengthOf($('.input-help'), 1);
        assert.isTrue($('.input-help-forgot-pw').length === 1);
        assert.equal(view.$('input[type=email]').val(), EMAIL);
      });
    });

    describe('isValidEnd', function() {
      it('returns true if both old and new passwords are valid and different', function() {
        $('#old_password').val('password');
        $('#new_password').val('password123123');
        $('#new_vpassword').val('password123123');

        assert.isTrue(view.isValidEnd());
      });

      it('returns true if both old and new passwords are valid and the same', function() {
        $('#old_password').val('password123123');
        $('#new_password').val('password123123');
        $('#new_vpassword').val('password123123');

        assert.isTrue(view.isValidEnd());
      });

      it('returns false if new passwords are valid and different', function() {
        $('#old_password').val('password123123');
        $('#new_password').val('password12312345');
        $('#new_vpassword').val('password123123');

        assert.isFalse(view.isValidEnd());
      });
    });

    describe('showValidationErrors', function() {
      it('shows an error if old_password is invalid', function() {
        view.$('#old_password').val('passwor');
        view.$('#new_password').val('password123123');
        view.$('#new_vpassword').val('password123123');

        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();

        assert.isTrue(view.showValidationError.calledOnce);
      });

      it('shows an error if new_password is invalid', function() {
        view.$('#old_password').val('password');
        view.$('#new_password').val('passwor');
        view.$('#new_vpassword').val('password123123');

        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();

        assert.isTrue(view.showValidationError.calledOnce);
      });

      it('shows an error if new_password and new_vpassword are different', function() {
        view.$('#old_password').val('password');
        view.$('#new_password').val('passwor');
        view.$('#new_vpassword').val('password123123');

        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();

        assert.isTrue(view.showValidationError.calledOnce);
      });
    });

    describe('submit', function() {
      describe('success', function() {
        var oldPassword = 'password';
        var newPassword = 'password123123';

        beforeEach(function() {
          $('#old_password').val(oldPassword);
          $('#new_password').val(newPassword);
          $('#new_vpassword').val(newPassword);

          sinon.stub(user, 'changeAccountPassword').callsFake(function() {
            return Promise.resolve({});
          });

          sinon.stub(view, 'navigate').callsFake(function() {});
          sinon.stub(view, 'displaySuccess').callsFake(function() {});

          sinon.spy(broker, 'afterChangePassword');

          return view.submit();
        });

        it('delegates to the user to change the password', function() {
          assert.isTrue(
            user.changeAccountPassword.calledWith(
              account,
              oldPassword,
              newPassword,
              relier
            )
          );
        });

        it('informs the broker', function() {
          assert.isTrue(broker.afterChangePassword.calledWith(account));
        });

        it('redirects to the `/settings` screen', function() {
          assert.equal(view.navigate.args[0][0], 'settings');
        });

        it('displays a success message', function() {
          assert.isTrue(view.displaySuccess.called);
          assert.isTrue(
            isEventLogged(metrics, 'settings.change-password.success')
          );
        });
      });

      describe('error', function() {
        beforeEach(function() {
          $('#old_password').val('bad_password');
          $('#new_password').val('bad_password');
          $('#new_vpassword').val('bad_password');

          sinon.stub(user, 'changeAccountPassword').callsFake(function() {
            return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
          });

          sinon.stub(view, 'showValidationError').callsFake(function() {});
          return view.submit();
        });

        it('display an error message', function() {
          assert.isTrue(view.showValidationError.called);
        });
      });

      describe('error', function() {
        beforeEach(function() {
          $('#old_password').val('password');
          $('#new_password').val('password123123');
          $('#new_vpassword').val('password123123');

          sinon.stub(user, 'changeAccountPassword').callsFake(function() {
            return Promise.reject(
              AuthErrors.toError('PASSWORDS_MUST_BE_DIFFERENT')
            );
          });

          sinon.stub(view, 'showValidationError').callsFake(function() {});
          return view.submit();
        });

        it('display an error message', function() {
          assert.isTrue(view.showValidationError.called);
        });
      });
    });
  });
});
