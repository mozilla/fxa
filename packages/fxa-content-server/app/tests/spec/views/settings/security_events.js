/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AttachedClients from 'models/attached-clients';
import Broker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/base';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/security_events';
import WindowMock from '../../../mocks/window';

describe('views/settings/security_events', () => {
  let account;
  let attachedClients;
  let broker;
  let email;
  let host;
  let metrics;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;
  const securityEvents = [
    {
      name: 'account.reset',
      verified: true,
      createdAt: new Date().getTime(),
    },
    {
      name: 'account.login',
      verified: true,
      createdAt: new Date().getTime(),
    },
    {
      name: 'account.create',
      verified: false,
      createdAt: new Date().getTime(),
    },
  ];
  const UID = '123';

  function initView() {
    view = new View({
      attachedClients,
      broker,
      host,
      metrics,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.stub(user, 'sessionStatus').callsFake(() => Promise.resolve(account));
    sinon
      .stub(account, 'securityEvents')
      .callsFake(() => Promise.resolve(securityEvents));
    sinon
      .stub(account, 'deleteSecurityEvents')
      .callsFake(() => Promise.resolve([]));
    sinon
      .stub(user, 'fetchAccountAttachedClients')
      .callsFake(() => Promise.resolve(attachedClients));

    return view.render().then(() => $('#container').html(view.$el));
  }

  beforeEach(() => {
    broker = new Broker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    windowMock = new WindowMock();
    host = windowMock.location.host;
    sentryMetrics = new SentryMetrics(host);
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User();
    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    relier = new Relier();
    attachedClients = new AttachedClients(
      [
        {
          deviceId: 'device-1',
          os: 'Windows',
          isCurrentSession: false,
          name: 'alpha',
          deviceType: 'tablet',
        },
        {
          deviceId: 'device-2',
          os: 'iOS',
          isCurrentSession: true,
          name: 'beta',
          deviceType: 'mobile',
        },
        {
          clientId: 'app-1',
          lastAccessTime: Date.now(),
          name: '123Done',
        },
        {
          clientId: 'app-2',
          lastAccessTime: Date.now(),
          name: 'Pocket',
          scope: ['profile', 'profile:write'],
        },
      ],
      {
        notifier: notifier,
      }
    );

    return initView();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('beforeRender', () => {
    describe('navigates to signin if no user set', () => {
      beforeEach(() => {
        account = null;
        sinon.spy(view, 'navigate');
        return view.beforeRender();
      });

      it('navigates to signin', () => {
        assert.isTrue(view.navigate.calledOnce);
        assert.equal(view.navigate.args[0][0], '/signin');
      });
    });

    describe('fetches attached clients for signed in user', () => {
      it('sets security events instance', () => {
        assert.deepEqual(view._securityEvents, securityEvents);
        assert.isTrue(account.securityEvents.calledOnce);
      });

      it('sets clients instance', () => {
        assert.ok(view._clients);
      });
    });
  });

  describe('renders tables', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    it('renders security events table', () => {
      // total 4 rows, including the header row
      assert.equal(view.$('#security-events-table')[0].rows.length, 4);

      assert.equal(
        view.$('#security-events-table tr:first-child .event-name').text(),
        securityEvents[0].name,
        'correct security event name'
      );

      assert.ok(
        view.$('#security-events-table tr:first-child .event-verified').text(),
        securityEvents[0].verified
      );

      assert.equal(
        view.$('#security-events-table tr:nth-child(2) .event-name').text(),
        securityEvents[1].name,
        'correct security event name'
      );

      assert.ok(
        view.$('#security-events-table tr:nth-child(2) .event-verified').text(),
        securityEvents[1].verified
      );

      assert.equal(
        view.$('#security-events-table tr:nth-child(3) .event-name').text(),
        securityEvents[2].name,
        'correct security event name'
      );

      assert.ok(
        view.$('#security-events-table tr:nth-child(3) .event-verified').text(),
        securityEvents[2].verified
      );
    });

    it('renders connected devices and apps table', () => {
      // total 2 rows, including the header row
      assert.isAbove(view.$('#connected-devices-table')[0].rows.length, 1);
    });
  });

  describe('deletes the security events', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    it('delete the security events', () => {
      $('#delete-events').click();

      setTimeout(() => {
        TestHelpers.wrapAssertion(() => {
          assert.equal(view.$('#security-events-table')[0].rows.length, 1);
        });
      }, 100);
    });
  });
});
