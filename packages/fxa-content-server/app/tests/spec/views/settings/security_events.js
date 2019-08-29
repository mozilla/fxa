/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import { Model } from 'backbone';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/security_events';
import WindowMock from '../../../mocks/window';

describe('views/settings/security_events', () => {
  let account;
  let broker;
  let email;
  let model;
  let metrics;
  let notifier;
  const UID = '123';
  let user;
  let view;
  let windowMock;

  function initView() {
    windowMock = new WindowMock();
    windowMock.document = {
      body: {},
      execCommand: () => {},
      getElementById: () => {},
    };

    view = new View({
      broker,
      metrics: metrics,
      model: model,
      notifier: notifier,
      user: user,
      window: windowMock,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    model = new Model();
    metrics = new Metrics({ notifier });
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });

    return initView();
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

    describe('user is signed out', () => {
      beforeEach(() => {
        account = null;

        return view.beforeRender();
      });

      it('should redirect to `signin` view', () => {
        assert.equal(view.navigate.callCount, 1);
        assert.isTrue(view.navigate.calledWith('signin'));
      });
    });
  });
});
