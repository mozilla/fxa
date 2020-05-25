/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/post_verify/newsletters/add_newsletters';
import WindowMock from '../../../../mocks/window';
import $ from 'jquery';

describe('views/post_verify/newsletters/add_newsletters', () => {
  let account;
  let broker;
  let experimentGroupingRules;
  let metrics;
  let model;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    relier = new Relier({
      window: windowMock,
    });
    broker = new BaseBroker({
      relier,
      window: windowMock,
    });
    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });
    model = new Backbone.Model({
      account,
    });
    notifier = _.extend({}, Backbone.Events);
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    experimentGroupingRules = {
      choose: () => true,
    };
    user = new User();
    view = new View({
      broker,
      experimentGroupingRules,
      metrics,
      model,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.stub(account, 'updateNewsletters').callsFake(() => Promise.resolve());
    sinon.stub(view, 'invokeBrokerMethod').callsFake(() => Promise.resolve());

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function () {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-add-newsletters-header'), 1);
      assert.lengthOf(view.$('.graphic-add-newsletters'), 1);
      assert.lengthOf(view.$('.marketing-email-optin-row'), 3);
      assert.lengthOf(view.$('#submit-btn'), 1);
      assert.lengthOf(view.$('#maybe-later-btn'), 1);
    });

    describe('without an account', () => {
      beforeEach(() => {
        account = new Account({});
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to the email first page', () => {
        assert.isTrue(view.navigate.calledWith('/'));
      });
    });
  });

  describe('submit', () => {
    describe('with no selected newsletters', () => {
      beforeEach(() => {
        return view.submit();
      });

      it('correct response', () => {
        assert.equal(account.updateNewsletters.callCount, 0);
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterSignUpConfirmationPoll',
            account
          )
        );
      });
    });

    describe('with selected newsletters', () => {
      beforeEach(() => {
        view.$('input[value="test-pilot"]').prop('checked', true);
        return view.submit();
      });

      it('sends correct newsletters', () => {
        assert.isTrue(account.updateNewsletters.calledOnceWith(['test-pilot']));
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterSignUpConfirmationPoll',
            account
          )
        );
      });
    });
  });

  describe('click maybe later', () => {
    describe('success', () => {
      beforeEach(() => {
        return view.clickMaybeLater();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterSignUpConfirmationPoll',
            account
          )
        );
      });
    });
  });
});
