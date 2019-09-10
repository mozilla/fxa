/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/security_events';

describe('views/settings/security_events', () => {
  let account;
  let broker;
  let email;
  let metrics;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  const UID = '123';

  function initView() {
    view = new View({
      broker,
      metrics,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.spy(view, 'navigate');

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    relier = new Relier();

    return initView();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('beforeRender', () => {
    it('would print initial setup on console', () => {
      assert.isTrue(view.navigate.calledOnce);
      assert.equal(view.navigate.args[0][0], 'security_events');

      // Session is expiring, each time I'm running this test
      // I'm not getting a signed in view,
      // that's why it's redirecting me to signin/ view
      console.log(view.navigate.args[0][0]);
    });
  });
});
