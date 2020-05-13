/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import sinon from 'sinon';
import Backbone from 'backbone';

import Account from 'models/account';
import BaseBroker from 'models/auth_brokers/base';
import FxaClient from 'lib/fxa-client';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import User from 'models/user';
import WindowMock from '../../mocks/window';

import View from 'views/inline_totp_setup';

describe('views/inline_totp_setup', () => {
  let account;
  let broker;
  let fxaClient;
  let metrics;
  let onSubmitCompleteStub;
  let model;
  let notifier;
  let relier;
  let totpTokenStub;
  let user;
  let view;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();

    relier = new Relier({
      window: windowMock,
    });

    fxaClient = new FxaClient();

    totpTokenStub = {
      exists: true,
      verified: true,
    };

    broker = new BaseBroker({
      relier: relier,
      window: windowMock,
    });

    account = new Account({
      email: 'a@a.com',
      sessionToken: 'someToken',
      uid: 'uid',
    });

    onSubmitCompleteStub = sinon.stub();

    model = new Backbone.Model({
      account: account,
      lastPage: 'signin',
      password: 'password',
    });
    model.set('onSubmitComplete', onSubmitCompleteStub);

    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({
      notifier,
      sentryMetrics: {
        captureException() {},
      },
    });

    user = new User();

    view = new View({
      broker,
      canGoBack: true,
      fxaClient,
      metrics,
      model,
      notifier,
      relier,
      user,
      viewName: 'inline-totp-setup',
      window: windowMock,
    });

    sinon
      .stub(view, 'getSignedInAccount')
      .callsFake(() => model.get('account'));

    sinon.stub(account, 'checkTotpTokenExists').callsFake(() => {
      return Promise.resolve(totpTokenStub);
    });

    sinon.stub(account, 'createTotpToken').returns(
      Promise.resolve({
        recoveryCodes: [1, 2, 3],
        secret: 'SECRET',
        qrCodeUrl: 'data:image/png;base64,iVBOR:',
      })
    );

    $(windowMock.document.body).attr(
      'data-flow-id',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
    $(windowMock.document.body).attr('data-flow-begin', Date.now());
    sinon.spy(view, 'logFlowEvent');

    return view.render().then(() => $('#container').html(view.$el));
  });

  describe('beforeRender', () => {
    // See issue https://github.com/mozilla/fxa/issues/5206
    it('redirects if the session is not verified', async () => {
      account.checkTotpTokenExists.restore();
      sinon.stub(account, 'checkTotpTokenExists').callsFake(() => {
        return Promise.reject({ errno: { errno: 138 } });
      });
      sinon.stub(view, 'replaceCurrentPage');

      await view.beforeRender();

      assert.isTrue(view.replaceCurrentPage.calledOnce);
      assert.isTrue(view.replaceCurrentPage.calledWith('/signin_token_code'));

      view.replaceCurrentPage.restore();
      account.checkTotpTokenExists.restore();
    });

    it('redirects to login start point if there is no session', async () => {
      sinon
        .stub(account, 'get')
        .withArgs('sessionToken')
        .callsFake(() => {
          return null;
        });
      sinon.stub(view, 'navigate');

      await view.beforeRender();

      assert.isTrue(view.navigate.calledOnce);
      assert.equal(view.navigate.args, 'signup');

      view.navigate.restore();
      account.get.restore();
    });
  });

  describe('render', () => {
    describe('intro screen', () => {
      it('renders the intro screen header', () => {
        assert.lengthOf(view.$('#fxa-inline-totp-setup'), 1);
      });

      it('renders a continue button', () => {
        assert.lengthOf(view.$('button.totp-continue'), 1);
      });

      it('renders a cancel link', () => {
        assert.lengthOf(view.$('a.totp-cancel'), 1);
      });

      it('renders a support.mozilla.org help link', () => {
        assert.lengthOf(view.$('a.totp-support-link'), 1);
      });

      it('shows service name if set by the relier', async () => {
        relier.set('serviceName', 'Firefox Foxfire');
        await view.render();
        assert.equal(view.$('.service').text(), 'Continue to Firefox Foxfire');
      });
    });
  });
});
