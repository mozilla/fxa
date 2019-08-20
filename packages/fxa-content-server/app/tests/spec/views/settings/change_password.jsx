/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Broker from 'models/auth_brokers/base';
import helpers from '../../../lib/helpers';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import React from 'react';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import {ChangePasswordHeader, ChangePasswordForm} from 'views/settings/change_password';
import View from 'views/settings/change_password';
import {
  render,
  cleanup,
  fireEvent,
  queryByText,
  getByText,
} from '@testing-library/react';

const { isEventLogged } = helpers;

const EMAIL = 'a@a.com';

describe('views/settings/change_password', function() {
  var account;
  var broker;
  var metrics;
  var notifier;
  var relier;
  var user;
  var view;

  beforeEach(function () {
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    relier = new Relier();

    broker = new Broker({
      relier: relier
    });

    user = new User({});

    view = new View({
      broker: broker,
      metrics: metrics,
      notifier,
      relier: relier,
      user: user
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('ChangePasswordHeader Component', () => {
    function renderChangePassword(){
      render(<ChangePasswordHeader />);
    }
    it('renders the password header correctly', () => {
      renderChangePassword();
      const title = document.querySelectorAll('.settings-unit-title');
      const settingsButtons = document.querySelectorAll('.settings-button');
      assert.lengthOf(title, 1);
      assert.include(title[0].innerText, 'Password');
      assert.lengthOf(settingsButtons, 1);
      assert.include(settingsButtons[0].innerText, 'Change');
    });
  });

  describe('Change Password Form Component', function () {
    beforeEach(function () {
      account = user.initAccount({
        email: EMAIL,
        sessionToken: 'abc123',
        verified: true
      });
      sinon.stub(account, 'isSignedIn').callsFake(function () {
        return Promise.resolve(true);
      });

      sinon.stub(view, 'getSignedInAccount').callsFake(function () {
        return account;
      });

      render(
        <ChangePasswordForm account={account} 
        submit={(oldPassword, newPassword)=>view.submit(oldPassword, newPassword)}
        showValidationError={(id,err)=>view.showValidationError(this.$(id),err)}
        />
      );
    });

    describe('render', function () {
      it('renders properly', function () {
        const oldPassword = document.querySelectorAll('#old_password');
        const inputMail = document.querySelectorAll('input[type=email]');
        assert.lengthOf(oldPassword, 1);
        assert.lengthOf($('.reset-password'), 1);
        assert.lengthOf($('#new_password'), 1);
        assert.lengthOf($('#new_vpassword'), 1);
        assert.lengthOf($('.input-help'), 1);
        assert.lengthOf($('.input-help-forgot-pw'), 1);
        assert.lengthOf(inputMail,1);
        assert.equal(inputMail[0].value, EMAIL);
      });
    });

    describe('submit', function () {
      describe('success', function () {
        var oldPassword = 'password';
        var newPassword = 'password123123';

        beforeEach(function () {

          sinon.stub(user, 'changeAccountPassword').callsFake(function () {
            return Promise.resolve({});
          });

          sinon.stub(view, 'navigate').callsFake(function () { });
          sinon.stub(view, 'displaySuccess').callsFake(function () { });

          sinon.spy(broker, 'afterChangePassword');

          return view.submit(oldPassword, newPassword);
        });

        it('delegates to the user to change the password', function () {
          assert.isTrue(user.changeAccountPassword.calledWith(
            account, oldPassword, newPassword, relier));
        });

        it('informs the broker', function () {
          assert.isTrue(broker.afterChangePassword.calledWith(account));
        });

        it('redirects to the `/settings` screen', function () {
          assert.equal(view.navigate.args[0][0], 'settings');
        });

        it('displays a success message', function () {
          assert.isTrue(view.displaySuccess.called);
          assert.isTrue(isEventLogged(metrics, 'settings.change-password.success'));
        });
      });
    });


  });

});
