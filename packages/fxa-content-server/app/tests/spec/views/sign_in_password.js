/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import FormPrefill from 'models/form-prefill';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import { SIGNIN_PASSWORD } from '../../../../tests/functional/lib/selectors';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/sign_in_password';

const EMAIL = 'testuser@testuser.com';

const Selectors = SIGNIN_PASSWORD;

describe('views/sign_in_password', () => {
  let account;
  let broker;
  let formPrefill;
  let model;
  let notifier;
  let relier;
  let user;
  let view;

  beforeEach(() => {
    account = new Account({ email: EMAIL });
    broker = new Broker();
    formPrefill = new FormPrefill();
    model = new Backbone.Model({ account });
    notifier = new Notifier();
    sinon.spy(notifier, 'trigger');
    relier = new Relier({
      service: 'sync',
      serviceName: 'Firefox Sync',
    });
    user = new User();

    view = new View({
      broker,
      formPrefill,
      model,
      notifier,
      relier,
      user,
      viewName: 'signin/password',
    });

    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    it('redirects to `/` if no account', () => {
      sinon.stub(view, 'getAccount').callsFake(() => null);
      view.beforeRender();

      assert.isTrue(view.navigate.calledOnceWith('/'));
    });

    it('does nothing if an account passed in', () => {
      sinon.stub(view, 'getAccount').callsFake(() => account);

      view.beforeRender();

      assert.isFalse(view.navigate.called);
    });
  });

  describe('render', () => {
    it('renders as expected, initializes flow events', () => {
      assert.include(view.$(Selectors.SUB_HEADER).text(), 'Firefox Sync');
      assert.lengthOf(view.$('input[type=email]'), 1);
      assert.equal(view.$('input[type=email]').val(), EMAIL);
      assert.lengthOf(view.$('input[type=password]'), 1);
      assert.isTrue(notifier.trigger.calledOnce);
      assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
      assert.lengthOf(view.$('.tos-pp'), 1);
    });
  });

  describe('validateAndSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, 'signIn').callsFake(() => Promise.resolve());
    });

    describe('password valid', () => {
      it('signs up the user', () => {
        view.$('#password').val('password');

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          assert.isTrue(view.signIn.calledOnce);
          assert.isTrue(view.signIn.calledWith(account, 'password'));
        });
      });
    });

    describe('useDifferentAccount', () => {
      it('navigates to `/` with the account', () => {
        sinon.spy(view, 'navigate');

        view.useDifferentAccount();

        assert.isTrue(view.navigate.calledOnceWith('/', { account }));
      });
    });
  });
});
