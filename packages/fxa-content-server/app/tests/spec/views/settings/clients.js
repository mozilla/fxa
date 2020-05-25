/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import AttachedClients from 'models/attached-clients';
import BaseBroker from 'models/auth_brokers/base';
import BaseView from 'views/base';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import Translator from 'lib/translator';
import User from 'models/user';
import View from 'views/settings/clients';
import WindowMock from '../../../mocks/window';

describe('views/settings/clients', () => {
  let account;
  let attachedClients;
  let broker;
  let email;
  let metrics;
  let notifier;
  let parentView;
  let translator;
  let user;
  let view;
  let windowMock;

  const UID = '123';

  function initView() {
    view = new View({
      attachedClients: attachedClients,
      broker: broker,
      metrics: metrics,
      notifier: notifier,
      parentView: parentView,
      translator: translator,
      user: user,
      window: windowMock,
    });

    sinon.spy(view, 'logFlowEvent');

    return view.render();
  }

  function setupReRenderTest(testAction) {
    return initView().then(() => {
      return new Promise((resolve) => {
        view.on('rendered', () => resolve());

        if (_.isFunction(testAction)) {
          testAction();
        }
      });
    });
  }

  beforeEach(() => {
    broker = new BaseBroker();
    email = TestHelpers.createEmail();
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    parentView = new BaseView();
    translator = new Translator({ forceEnglish: true });
    user = new User();
    windowMock = new WindowMock();

    account = user.initAccount({
      email: email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });

    sinon.stub(account, 'isSignedIn').callsFake(() => {
      return Promise.resolve(true);
    });

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
  });

  afterEach(() => {
    metrics.destroy();
    metrics = null;

    if ($.prototype.trigger.restore) {
      $.prototype.trigger.restore();
    }
    view.remove();
    view.destroy();

    view = null;
  });

  describe('constructor', () => {
    beforeEach(() => {
      view = new View({
        notifier: notifier,
        parentView: parentView,
        user: user,
      });
    });

    it('creates an `AttachedClients` instance if one not passed in', () => {
      assert.ok(view._attachedClients);
    });
  });

  describe('render', () => {
    beforeEach(() => {
      sinon.spy(attachedClients, 'fetch');

      return initView();
    });

    it('does not fetch the clients list immediately to avoid startup XHR requests', () => {
      assert.isFalse(attachedClients.fetch.called);
    });

    it('renders attachedClients already in the collection', () => {
      assert.ok(view.$('li.client').length, 2);
    });

    it('title attribute is added', () => {
      assert.equal(view.$('#app-1--- .client-name').attr('title'), '123Done');
      assert.equal(
        view.$('#app-2--- .client-name').attr('title'),
        'Pocket - profile,profile:write'
      );
    });

    it('renders attachedClients and apps', () => {
      assert.equal(
        view.$('#clients .settings-unit-title').text().trim(),
        'Devices & apps'
      );
      assert.ok(
        view
          .$('#clients')
          .text()
          .trim()
          .indexOf('manage your attachedClients and apps below')
      );
    });

    it('properly sets the type of devices', () => {
      assert.ok(view.$('#-device-1--').hasClass('tablet'));
      assert.notOk(view.$('#-device-1--').hasClass('desktop'));
      assert.equal(view.$('#-device-1--').data('os'), 'Windows');
      assert.ok(view.$('#-device-2--').hasClass('mobile'));
      assert.notOk(view.$('#-device-2--').hasClass('desktop'));
      assert.equal(view.$('#-device-2--').data('os'), 'iOS');
      assert.equal(
        $('#container [data-get-app]').length,
        0,
        '0 mobile app placeholders'
      );
    });

    it('properly sets the type of apps', () => {
      attachedClients = new AttachedClients(
        [
          {
            clientId: 'app-1',
            lastAccessTime: Date.now(),
            name: '123Done',
          },
          {
            clientId: 'app-2',
            lastAccessTime: Date.now(),
            name: 'Pocket',
          },
          {
            clientId: 'app-3',
            lastAccessTime: Date.now(),
            name: 'Add-ons',
          },
        ],
        {
          notifier: notifier,
        }
      );

      return initView().then(() => {
        $('#container').html(view.el);
        assert.ok(view.$('#app-1---').hasClass('client-oAuthApp'));
        assert.notOk(view.$('#app-1---').hasClass('desktop'));
        assert.equal(view.$('#app-1---').data('name'), '123Done');
        assert.equal(view.$('#app-2---').data('name'), 'Pocket');
        assert.equal(view.$('#app-3---').data('name'), 'Add-ons');
        assert.equal(
          $('#container [data-get-app]').length,
          2,
          'has mobile app placeholders'
        );
        assert.equal(
          $('#container [data-os=iOS]').length,
          1,
          'has the iOS placeholder'
        );
        assert.equal(
          $('#container [data-os=Android]').length,
          1,
          'has the Android placeholder'
        );
        assert.equal(
          $('#container .device-support').prop('target'),
          '_blank',
          'opens device article in new tab'
        );
      });
    });

    it('app placeholders for mobile if there are no mobile clients', () => {
      attachedClients = new AttachedClients(
        [
          {
            deviceId: 'device-1',
            deviceType: 'desktop',
            isCurrentSession: false,
            name: 'alpha',
          },
        ],
        {
          notifier: notifier,
        }
      );

      return initView().then(() => {
        $('#container').html(view.el);
        assert.equal(
          $('#container [data-get-app]').length,
          2,
          '2 mobile app placeholders'
        );
      });
    });

    it('no app placeholders if there is a tablet device', () => {
      attachedClients = new AttachedClients(
        [
          {
            deviceId: 'device-1',
            deviceType: 'tablet',
            isCurrentSession: false,
            name: 'alpha',
          },
        ],
        {
          notifier: notifier,
        }
      );

      return initView().then(() => {
        $('#container').html(view.el);
        assert.equal(
          $('#container [data-get-app]').length,
          0,
          'no mobile app placeholders'
        );
      });
    });

    it('names devices "Firefox" if there is no name', () => {
      attachedClients = new AttachedClients(
        [
          {
            deviceId: 'device-1',
            deviceType: 'desktop',
            isCurrentSession: false,
          },
        ],
        {
          notifier: notifier,
        }
      );

      return initView().then(() => {
        $('#container').html(view.el);
        assert.equal(
          $('#container #-device-1-- .client-name').text().trim(),
          'Firefox',
          'device name is Firefox'
        );
      });
    });
  });

  describe('device removed from collection', () => {
    beforeEach(() => {
      return setupReRenderTest(() => {
        // DOM needs to be written so that device remove animation completes
        $('#container').html(view.el);
        attachedClients.get('-device-1--').destroy();
      });
    });

    it('removes device from list', () => {
      assert.lengthOf(view.$('li.client-device'), 1);
      assert.lengthOf(view.$('#-device-2--'), 1);
    });
  });

  describe('openPanel', () => {
    beforeEach(() => {
      return initView().then(() => {
        sinon.spy($.prototype, 'trigger');
        sinon
          .stub(view, '_fetchAttachedClients')
          .callsFake(() => Promise.resolve());
        view.$('.clients-refresh').data('minProgressIndicatorMs', 0);
        return view.openPanel();
      });
    });

    it('fetches the device list', () => {
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'settings.clients.open')
      );
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'settings.clients.refresh')
      );
      assert.isTrue(view._fetchAttachedClients.calledOnce);
    });
  });

  describe('click to disconnect device', () => {
    beforeEach(() => {
      return initView().then(() => {
        // click events require the view to be in the DOM
        $('#container').html(view.el);

        sinon.spy(view, 'navigate');

        $('#-device-2-- .client-disconnect').click();
      });
    });

    it('navigates to confirmation dialog', () => {
      assert.isTrue(view.navigate.calledOnce);
      var args = view.navigate.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'settings/clients/disconnect');
      assert.equal(args[1].clientId, '-device-2--');
      assert.equal(args[1].clients, view._attachedClients);
    });
  });

  describe('refresh list behaviour', () => {
    beforeEach(() => {
      return initView().then(() => {
        // click events require the view to be in the DOM
        $('#container').html(view.el);
      });
    });

    it('calls `validateAndSubmit` on `clients-refresh` click, starts the refresh', () => {
      sinon.spy(view, 'startRefresh');
      sinon.stub(view, 'validateAndSubmit').callsFake(() => Promise.resolve());

      view.$('.clients-refresh').click();

      assert.isTrue(view.startRefresh.calledOnce);
      assert.isTrue(view.validateAndSubmit.calledOnce);
    });
  });

  describe('validateAndSubmit (refresh)', () => {
    beforeEach(() => {
      return initView().then(() => {
        view.$('.clients-refresh').data('minProgressIndicatorMs', '1');
      });
    });

    it('calls `_fetchAttachedClients`, refreshes', () => {
      sinon.stub(view, 'isPanelOpen').callsFake(() => true);
      sinon
        .stub(view, '_fetchAttachedClients')
        .callsFake(() => Promise.resolve());
      sinon.stub(view, 'render').callsFake(() => Promise.resolve());

      return view.validateAndSubmit().then(() => {
        assert.isTrue(view._fetchAttachedClients.calledOnce);
        assert.isTrue(view.render.calledOnce);
      });
    });
  });

  describe('startRefresh', () => {
    beforeEach(() => {
      return initView();
    });

    it('initializes the progress indicator and logs the refresh', () => {
      sinon.spy(view, 'logViewEvent');

      assert.isUndefined(
        view.$('.clients-refresh').data('minProgressIndicatorMs')
      );

      view.startRefresh();

      assert.equal(
        view.$('.clients-refresh').data('minProgressIndicatorMs'),
        View.MIN_REFRESH_INDICATOR_MS
      );
      assert.isTrue(view.logViewEvent.calledOnce);
      assert.isTrue(view.logViewEvent.calledWith('refresh'));
    });
  });

  describe('_onGetApp', () => {
    it('logs get event', () => {
      attachedClients = new AttachedClients(
        [
          {
            clientType: 'device',
            id: 'device-1',
            isCurrentSession: false,
            name: 'alpha',
            type: 'desktop',
          },
        ],
        {
          notifier: notifier,
        }
      );

      return initView().then(() => {
        $('#container').html(view.el);
        assert.isFalse(
          TestHelpers.isEventLogged(metrics, 'settings.clients.get.android')
        );
        view._onGetApp({
          currentTarget: '[data-get-app=android]',
        });
        assert.isTrue(
          TestHelpers.isEventLogged(metrics, 'settings.clients.get.android')
        );
      });
    });
  });

  describe('_fetchAttachedClients', () => {
    beforeEach(() => {
      sinon.stub(user, 'fetchAccountAttachedClients').callsFake(() => {
        return Promise.resolve();
      });

      return initView()
        .then(() => {
          assert.equal(view.logFlowEvent.callCount, 0);
          return view._fetchAttachedClients();
        })
        .then(() => {
          assert.equal(view.logFlowEvent.callCount, 1);
          const args = view.logFlowEvent.args[0];
          assert.lengthOf(args, 1);
          const eventParts = args[0].split('.');
          assert.lengthOf(eventParts, 4);
          assert.equal(eventParts[0], 'timing');
          assert.equal(eventParts[1], 'clients');
          assert.equal(eventParts[2], 'fetch');
          assert.match(eventParts[3], /^[0-9]+$/);
        });
    });

    it('delegates to the user to fetch the device list', () => {
      var account = view.getSignedInAccount();
      assert.isTrue(user.fetchAccountAttachedClients.calledWith(account));
    });
  });

  describe('_formatAccessTimeAndScope', () => {
    it('translates the last active string', () => {
      return initView().then(() => {
        view.translator = {
          get: (untranslatedText) => {
            if (untranslatedText === 'Last seen %(translatedTimeAgo)s') {
              return 'Translated %(translatedTimeAgo)s';
            }

            return untranslatedText;
          },
        };

        const formatted = view._formatAccessTimeAndScope([
          {
            clientType: 'device',
            lastAccessTimeFormatted: 'a few seconds ago',
            name: 'client-1',
          },
        ]);

        assert.equal(
          formatted[0].lastAccessTimeFormatted,
          'Translated %(translatedTimeAgo)s'
        );
        assert.equal(formatted[0].name, 'client-1');
      });
    });

    it('supports approximate sync formatting', () => {
      return initView().then(() => {
        const now = Date.now();
        const formatted = view._formatAccessTimeAndScope([
          {
            clientType: 'device',
            createdTime: now,
            createdTimeFormatted: '32 minutes ago',
            deviceId: 'device-1',
            isCurrentSession: false,
            isDevice: true,
            lastAccessTime: now,
            lastAccessTimeFormatted: '32 minutes ago',
            location: {
              city: 'Bournemouth',
              country: 'United Kingdom',
              stateCode: 'EN',
            },
            type: 'desktop',
          },
          {
            approximateLastAccessTime: now,
            approximateLastAccessTimeFormatted: '1 hour ago',
            clientType: 'device',
            deviceId: 'device-2',
            isCurrentSession: false,
            isDevice: true,
            lastAccessTime: now - 1,
            lastAccessTimeFormatted: '2 days ago',
            location: {
              city: 'Bournemouth',
              country: 'United Kingdom',
            },
            type: 'mobile',
          },
          {
            approximateLastAccessTime: now,
            approximateLastAccessTimeFormatted: '3 weeks ago',
            clientType: 'device',
            deviceId: 'device-3',
            isCurrentSession: false,
            isDevice: true,
            lastAccessTime: now,
            lastAccessTimeFormatted: '4 months ago',
            location: {
              country: 'United Kingdom',
              stateCode: 'EN',
            },
            type: 'mobile',
          },
          {
            createdTime: now,
            createdTimeFormatted: '1 day ago',
            clientType: 'webSession',
            isWebSession: true,
            lastAccessTime: now,
            lastAccessTimeFormatted: '1 day ago',
            location: {
              city: 'Bournemouth',
              stateCode: 'EN',
            },
            sessionTokenId: 'session-1',
          },
          {
            approximateLastAccessTime: now,
            approximateLastAccessTimeFormatted: '3 weeks ago',
            clientType: 'webSession',
            isWebSession: true,
            lastAccessTime: now - 1,
            lastAccessTimeFormatted: '4 months ago',
            location: {
              country: 'United Kingdom',
            },
            sessionTokenId: 'session-2',
          },
          {
            approximateLastAccessTime: now,
            approximateLastAccessTimeFormatted: '5 years ago',
            clientType: 'webSession',
            isWebSession: true,
            lastAccessTime: now,
            lastAccessTimeFormatted: '6 decades ago',
            location: {},
            sessionTokenId: 'session-3',
          },
          {
            clientType: 'oAuthApp',
            clientId: 'oauth-1',
            createdTime: now,
            createdTimeFormatted: 'wibble',
            lastAccessTime: now,
            lastAccessTimeFormatted: 'blee',
          },
          {
            approximateLastAccessTime: now,
            approximateLastAccessTimeFormatted: 'wibble',
            clientId: 'oauth-2',
            clientType: 'oAuthApp',
            lastAccessTime: now - 1,
            lastAccessTimeFormatted: 'blee',
          },
          {
            approximateLastAccessTime: now,
            approximateLastAccessTimeFormatted: 'wibble',
            clientId: 'oauth-3',
            clientType: 'oAuthApp',
            lastAccessTime: now,
            lastAccessTimeFormatted: 'blee',
            location: {
              city: 'Mountain View',
              country: 'United States',
              stateCode: 'CA',
            },
          },
        ]);

        assert.equal(
          formatted[0].lastAccessTimeFormatted,
          'Last seen 32 minutes ago near Bournemouth, EN, United Kingdom'
        );
        assert.equal(
          formatted[1].lastAccessTimeFormatted,
          'Last seen over 1 hour ago in United Kingdom'
        );
        assert.equal(
          formatted[2].lastAccessTimeFormatted,
          'Last seen 4 months ago in United Kingdom'
        );
        assert.equal(formatted[3].lastAccessTimeFormatted, '1 day ago');
        assert.equal(
          formatted[4].lastAccessTimeFormatted,
          'Over 3 weeks ago in United Kingdom'
        );
        assert.equal(formatted[5].lastAccessTimeFormatted, '6 decades ago');
        assert.equal(formatted[6].lastAccessTimeFormatted, 'Last active blee');
        assert.equal(
          formatted[7].lastAccessTimeFormatted,
          'Last active over wibble'
        );
        assert.equal(
          formatted[8].lastAccessTimeFormatted,
          'Last active blee near Mountain View, CA, United States'
        );
      });
    });

    it('properly sets the title', () => {
      return initView().then(() => {
        const formatted = view._formatAccessTimeAndScope([
          {
            clientId: 'app-1',
            clientType: 'oAuthApp',
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: 'a few seconds ago',
            name: '123Done',
            scope: ['profile'],
          },
          {
            clientId: 'app-2',
            clientType: 'oAuthApp',
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: '32 minutes ago',
            name: 'Pocket',
            scope: ['profile', 'profile:write'],
          },
          {
            clientId: 'app-3',
            clientType: 'oAuthApp',
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: 'a month ago',
            name: 'Add-ons',
          },
          {
            clientType: 'webSession',
            isWebSession: true,
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: '12 minutes ago',
            name: "User's Web Session",
            sessionTokenId: 'session-1',
            userAgent: 'Firefox 40',
          },
          {
            clientType: 'webSession',
            isWebSession: true,
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: '18 minutes ago',
            name: "User's Second Web Session",
            sessionTokenId: 'session-2',
            userAgent: '',
          },
          {
            clientType: 'device',
            deviceId: 'device-1',
            deviceType: 'mobile',
            isCurrentSession: false,
            isDevice: true,
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: '30 minutes ago',
            location: {
              country: 'Canada',
              state: 'Ontario',
            },
            name: 'device-1',
          },
          {
            clientType: 'device',
            deviceId: 'device-2',
            deviceType: 'mobile',
            isCurrentSession: false,
            isDevice: true,
            name: 'device-2',
          },
        ]);

        assert.equal(formatted[0].title, '123Done - profile');
        assert.equal(
          formatted[0].lastAccessTimeFormatted,
          'Last active a few seconds ago'
        );
        assert.equal(formatted[1].title, 'Pocket - profile,profile:write');
        assert.equal(formatted[2].title, 'Add-ons');
        assert.equal(formatted[3].title, 'Web Session, Firefox 40');
        assert.equal(formatted[4].title, 'Web Session');
        assert.equal(formatted[5].title, 'device-1');
        assert.equal(
          formatted[5].lastAccessTimeFormatted,
          'Last seen 30 minutes ago in Canada'
        );
        assert.equal(formatted[6].title, 'device-2');
        assert.equal(
          formatted[6].lastAccessTimeFormatted,
          'Last seen time unknown'
        );
      });
    });
  });
});
