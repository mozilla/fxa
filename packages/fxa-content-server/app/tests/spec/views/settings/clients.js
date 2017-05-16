/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require ('underscore');
  const Able = require('lib/able');
  const assert = require('chai').assert;
  const AttachedClients = require('models/attached-clients');
  const BaseBroker = require('models/auth_brokers/base');
  const BaseView = require('views/base');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const Translator = require('lib/translator');
  const User = require('models/user');
  const View = require('views/settings/clients');
  const WindowMock = require('../../../mocks/window');

  describe('views/settings/clients', function () {
    var able;
    var account;
    var attachedClients;
    var broker;
    var email;
    var metrics;
    var notifier;
    var parentView;
    var translator;
    var UID = '123';
    var user;
    var view;
    var windowMock;

    function initView () {
      view = new View({
        able: able,
        attachedClients: attachedClients,
        broker: broker,
        metrics: metrics,
        notifier: notifier,
        parentView: parentView,
        translator: translator,
        user: user,
        window: windowMock
      });

      return view.render();
    }

    function setupReRenderTest(testAction) {
      return initView()
        .then(function () {
          var deferred = p.defer();

          view.on('rendered', deferred.resolve.bind(deferred));

          if (_.isFunction(testAction)) {
            testAction();
          }

          return deferred.promise;
        });
    }

    beforeEach(function () {
      able = new Able();
      sinon.stub(able, 'choose', function () {
        return true;
      });
      broker = new BaseBroker();
      email = TestHelpers.createEmail();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      parentView = new BaseView();
      translator = new Translator({forceEnglish: true});
      user = new User();
      windowMock = new WindowMock();

      account = user.initAccount({
        email: email,
        sessionToken: 'abc123',
        uid: UID,
        verified: true
      });

      sinon.stub(account, 'isSignedIn', function () {
        return p(true);
      });

      attachedClients = new AttachedClients([
        {
          clientType: 'device',
          genericOS: 'Windows',
          id: 'device-1',
          isCurrentDevice: false,
          name: 'alpha',
          type: 'tablet'
        },
        {
          clientType: 'device',
          genericOS: 'iOS',
          id: 'device-2',
          isCurrentDevice: true,
          name: 'beta',
          type: 'mobile'
        },
        {
          clientType: 'oAuthApp',
          id: 'app-1',
          isOAuthApp: true,
          lastAccessTime: Date.now(),
          name: '123Done'
        },
        {
          clientType: 'oAuthApp',
          id: 'app-2',
          isOAuthApp: true,
          lastAccessTime: Date.now(),
          name: 'Pocket',
          scope: ['profile', 'profile:write']
        }
      ], {
        notifier: notifier
      });
    });

    afterEach(function () {
      if ($.prototype.trigger.restore) {
        $.prototype.trigger.restore();
      }
      view.remove();
      view.destroy();

      view = null;
    });

    describe('constructor', function () {
      beforeEach(function () {
        view = new View({
          notifier: notifier,
          parentView: parentView,
          user: user
        });
      });

      it('creates an `AttachedClients` instance if one not passed in', function () {
        assert.ok(view._attachedClients);
      });
    });

    describe('render', function () {
      beforeEach(function () {
        sinon.spy(attachedClients, 'fetch');

        return initView();
      });

      it('does not fetch the device list immediately to avoid startup XHR requests', function () {
        assert.isFalse(attachedClients.fetch.called);
      });

      it('renders attachedClients already in the collection', function () {
        assert.ok(view.$('li.client').length, 2);
      });

      it('title attribute is added', function () {
        assert.equal(view.$('#app-1 .client-name').attr('title'), '123Done');
        assert.equal(view.$('#app-2 .client-name').attr('title'), 'Pocket - profile,profile:write');
      });

      it('renders attachedClients and apps', function () {
        assert.equal(view.$('#clients .settings-unit-title').text().trim(), 'Devices & apps');
        assert.ok(view.$('#clients').text().trim().indexOf('manage your attachedClients and apps below'));
      });

      it('properly sets the type of devices', function () {
        assert.ok(view.$('#device-1').hasClass('tablet'));
        assert.notOk(view.$('#device-1').hasClass('desktop'));
        assert.equal(view.$('#device-1').data('os'), 'Windows');
        assert.ok(view.$('#device-2').hasClass('mobile'));
        assert.notOk(view.$('#device-2').hasClass('desktop'));
        assert.equal(view.$('#device-2').data('os'), 'iOS');
        assert.equal($('#container [data-get-app]').length, 0, '0 mobile app placeholders');
      });

      it('properly sets the type of apps', function () {
        attachedClients = new AttachedClients([
          {
            clientType: 'oAuthApp',
            id: 'app-1',
            isOAuthApp: true,
            lastAccessTime: Date.now(),
            name: '123Done'
          },
          {
            clientType: 'oAuthApp',
            id: 'app-2',
            isOAuthApp: true,
            lastAccessTime: Date.now(),
            name: 'Pocket'
          },
          {
            clientType: 'oAuthApp',
            id: 'app-3',
            isOAuthApp: true,
            lastAccessTime: Date.now(),
            name: 'Add-ons'
          }
        ], {
          notifier: notifier
        });

        return initView()
          .then(function () {
            $('#container').html(view.el);
            assert.ok(view.$('#app-1').hasClass('client-oAuthApp'));
            assert.notOk(view.$('#app-1').hasClass('desktop'));
            assert.equal(view.$('#app-1').data('name'), '123Done');
            assert.equal(view.$('#app-2').data('name'), 'Pocket');
            assert.equal(view.$('#app-3').data('name'), 'Add-ons');
            assert.equal($('#container [data-get-app]').length, 2, 'has mobile app placeholders');
            assert.equal($('#container [data-os=iOS]').length, 1, 'has the iOS placeholder');
            assert.equal($('#container [data-os=Android]').length, 1, 'has the Android placeholder');
            assert.equal($('#container .device-support').prop('target'), '_blank', 'opens device article in new tab');
          });

      });

      it('app placeholders for mobile if there are no mobile clients', function () {
        attachedClients = new AttachedClients([
          {
            clientType: 'device',
            id: 'device-1',
            isCurrentDevice: false,
            name: 'alpha',
            type: 'desktop'
          }
        ], {
          notifier: notifier
        });

        return initView()
          .then(function () {
            $('#container').html(view.el);
            assert.equal($('#container [data-get-app]').length, 2, '2 mobile app placeholders');
          });
      });

      it('no app placeholders if there is a tablet device', function () {
        attachedClients = new AttachedClients([
          {
            clientType: 'device',
            id: 'device-1',
            isCurrentDevice: false,
            name: 'alpha',
            type: 'tablet'
          }
        ], {
          notifier: notifier
        });

        return initView()
          .then(function () {
            $('#container').html(view.el);
            assert.equal($('#container [data-get-app]').length, 0, 'no mobile app placeholders');
          });
      });

      it('names devices "Firefox" if there is no name', function () {
        attachedClients = new AttachedClients([
          {
            clientType: 'device',
            id: 'device-1',
            isCurrentDevice: false,
            type: 'desktop'
          }
        ], {
          notifier: notifier
        });

        return initView()
          .then(function () {
            $('#container').html(view.el);
            assert.equal($('#container #device-1 .client-name').text().trim(), 'Firefox', 'device name is Firefox');
          });

      });

    });

    describe('device added to collection', function () {
      beforeEach(function () {
        return setupReRenderTest(function () {
          attachedClients.add({
            clientType: 'device',
            id: 'device-3',
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: 'a few seconds ago',
            name: 'delta',
            type: 'desktop'
          });
        });
      });

      it('adds new device to list', function () {
        assert.lengthOf(view.$('li.client-device'), 3);
        assert.include(view.$('#device-3 .client-name').text().trim(), 'delta');
        assert.include(view.$('#device-3 .client-name').attr('title'), 'delta', 'the title attr is correct');
        assert.isTrue(view.$('#device-3 .last-connected').text().trim().indexOf('started syncing a few seconds ago') >= 0, 'formats connected date');
        assert.ok(view.$('#device-3').hasClass('desktop'));
      });
    });

    describe('device removed from collection', function () {
      beforeEach(function () {
        return setupReRenderTest(function () {
          // DOM needs to be written so that device remove animation completes
          $('#container').html(view.el);
          attachedClients.get('device-1').destroy();
        });
      });

      it('removes device from list', function () {
        assert.lengthOf(view.$('li.client-device'), 1);
        assert.lengthOf(view.$('#device-2'), 1);
      });
    });

    describe('openPanel', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            sinon.spy($.prototype, 'trigger');
            return view.openPanel();
          });
      });

      it('fetches the device list', function () {
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.open'));
        assert.isTrue($.prototype.trigger.called, 'calls form submit of the ForView');
      });
    });

    describe('click to disconnect device', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            // click events require the view to be in the DOM
            $('#container').html(view.el);

            sinon.spy(view, 'navigate');

            $('#device-2 .client-disconnect').click();
          });
      });

      it('navigates to confirmation dialog', function () {
        assert.isTrue(view.navigate.calledOnce);
        var args = view.navigate.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0], 'settings/clients/disconnect');
        assert.equal(args[1].clientId, 'device-2');
        assert.equal(args[1].clients, view._attachedClients);
      });
    });

    describe('refresh list behaviour', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            // click events require the view to be in the DOM
            $('#container').html(view.el);
          });
      });

      it('calls `render` when refreshed', function (done) {
        sinon.spy(view, 'render');
        sinon.stub(view, 'isPanelOpen', function () {
          return true;
        });

        sinon.stub(view, '_fetchAttachedClients', function () {
          return p();
        });

        $('.clients-refresh').click();
        setTimeout(function () {
          // render delayed by device request promises
          assert.isTrue(view.render.called);
          view.render.restore();
          done();
        }, 150);
      });

      it('calls `_fetchAttachedClients` using a button', function () {
        sinon.spy($.prototype, 'trigger');
        sinon.stub(view, 'isPanelOpen', function () {
          return true;
        });

        sinon.stub(view, 'submit', function () {
          return p();
        });

        $('.clients-refresh').click();
        assert.isTrue($.prototype.trigger.called, 'calls form submit of the ForView');
      });

    });

    describe('_onGetApp', function () {
      it('logs get event', function () {
        attachedClients = new AttachedClients([
          {
            clientType: 'device',
            id: 'device-1',
            isCurrentDevice: false,
            name: 'alpha',
            type: 'desktop'
          }
        ], {
          notifier: notifier
        });

        return initView()
          .then(() => {
            $('#container').html(view.el);
            assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.clients.get.android'));
            view._onGetApp({
              currentTarget: '[data-get-app=android]'
            });
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.get.android'));
          });
      });
    });

    describe('_fetchAttachedClients', function () {
      beforeEach(function () {
        sinon.stub(user, 'fetchAccountSessions', function () {
          return p();
        });

        sinon.stub(user, 'fetchAccountOAuthApps', function () {
          return p();
        });

        return initView()
          .then(function () {
            return view._fetchAttachedClients();
          });
      });

      it('delegates to the user to fetch the device list', function () {
        var account = view.getSignedInAccount();
        assert.isTrue(user.fetchAccountSessions.calledWith(account));
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.items.zero'));
      });

      it('logs the number of clients', function () {
        function createAttachedClientView(numOfClients) {
          return initView()
            .then(() => {
              if (view._attachedClients.fetchClients.restore) {
                view._attachedClients.fetchClients.restore();
              }
              sinon.stub(view._attachedClients, 'fetchClients', function () {
                view._attachedClients.length = numOfClients;
                return p();
              });

              return view._fetchAttachedClients();
            });
        }

        return createAttachedClientView(1).then(() => {
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.items.one'), 'one client');
        }).then(() => {
          return createAttachedClientView(2);
        }).then(() => {
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.items.two'), 'two clients');
        }).then(() => {
          return createAttachedClientView(3);
        }).then(() => {
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.items.many'), 'many clients');
        }).then(() => {
          return createAttachedClientView(70);
        }).then(() => {
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.clients.items.many'), 'many many clients');
        });

      });
    });

    describe('_formatAccessTimeAndScope', function () {
      it('translates the last active string', function () {
        return initView()
          .then(() => {
            view.translator = {
              get: (untranslatedText) => {
                if (untranslatedText === 'started syncing %(translatedTimeAgo)s') {
                  return 'Translated %(translatedTimeAgo)s';
                }

                return untranslatedText;
              }
            };

            const formatted = view._formatAccessTimeAndScope([
              {
                isDevice: true,
                lastAccessTimeFormatted: 'a few seconds ago',
                name: 'client-1'
              }
            ]);

            assert.equal(formatted[0].lastAccessTimeFormatted, 'Translated %(translatedTimeAgo)s');
            assert.equal(formatted[0].name, 'client-1');
          });
      });

      it('properly sets the title according to scope', function () {
        return initView()
          .then(() => {
            $('#container').html(view.el);

            const formatted = view._formatAccessTimeAndScope([
              {
                clientType: 'oAuthApp',
                id: 'app-1',
                lastAccessTime: Date.now(),
                lastAccessTimeFormatted: 'a few seconds ago',
                name: '123Done',
                scope: ['profile']
              },
              {
                clientType: 'oAuthApp',
                id: 'app-2',
                lastAccessTime: Date.now(),
                lastAccessTimeFormatted: '32 minutes ago',
                name: 'Pocket',
                scope: ['profile', 'profile:write']
              },
              {
                clientType: 'oAuthApp',
                id: 'app-3',
                lastAccessTime: Date.now(),
                lastAccessTimeFormatted: 'a month ago',
                name: 'Add-ons'
              }
            ]);

            assert.equal(formatted[0].title, '123Done - profile');
            assert.equal(formatted[0].lastAccessTimeFormatted, 'last active a few seconds ago');
            assert.equal(formatted[1].title, 'Pocket - profile,profile:write');
            assert.equal(formatted[2].title, 'Add-ons');
          });
      });
    });

  });
});
