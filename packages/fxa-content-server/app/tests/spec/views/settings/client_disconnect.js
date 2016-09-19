/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const assert = require('chai').assert;
  const AttachedClients = require('models/attached-clients');
  const Backbone = require('backbone');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const User = require('models/user');
  const View = require('views/settings/client_disconnect');
  const WindowMock = require('../../../mocks/window');

  describe('views/settings/client_disconnect', () => {
    let attachedClients;
    let clientId;
    let metrics;
    let model = new Backbone.Model();
    let notifier;
    let user;
    let view;
    let windowMock;

    beforeEach(() => {
      metrics = new Metrics();
      user = new User();
      notifier = new Notifier();
      windowMock = new WindowMock();
      attachedClients = new AttachedClients([
        {
          clientType: 'device',
          id: 'device-1',
          isCurrentDevice: false,
          name: 'alpha',
          type: 'tablet'
        },
        {
          clientType: 'device',
          id: 'device-2',
          isCurrentDevice: true,
          name: 'beta',
          type: 'mobile'
        }
      ]);
      clientId = 'device-2';

      model.set({
        clientId: clientId,
        clients: attachedClients
      });

      createView();
    });

    function createView() {
      view = new View({
        metrics: metrics,
        model: model,
        notifier: notifier,
        user: user,
        window: windowMock
      });
    }

    afterEach(() => {
      $(view.el).remove();
      view.destroy();
      view = null;
    });

    describe('initialize', () => {
      it('initialize sets props', () => {
        assert.notOk(view.hasDisconnected);
        assert.equal(view.viewName, 'settings.clients.disconnect');
      });
    });

    describe('beforeRender', () => {
      it('sets client', () => {
        view.beforeRender();
        assert.equal(view.client.id, 'device-2');
        assert.equal(view.client.get('name'), 'beta');
      });

      it('redirects back to settings if empty model', () => {
        sinon.spy(view, 'navigate');
        view.model = new Backbone.Model();
        view.beforeRender();
        assert.isTrue(view.navigate.calledOnce);
        assert.equal(view.navigate.args[0][0], 'settings/clients');
      });
    });

    describe('render', () => {
      it('renders initial view', () => {
        return view.render().then(() => {
          assert.ok($(view.el).find('.intro').length, 'intro text');
          assert.ok($(view.el).find('.select-row-wrapper').length, 'dropdown');
          assert.notOk($(view.el).find('.reason-help').length, 'help');
        });
      });

      it('renders view after disconnection', () => {
        view.hasDisconnected = true;
        return view.render().then(() => {
          assert.notOk($(view.el).find('.intro').length, 'intro text');
          assert.notOk($(view.el).find('.select-row-wrapper').length, 'dropdown');
          assert.ok($(view.el).find('.reason-help').length, 'help');
        });
      });

    });

    describe('context', () => {
      it('has props', () => {
        view.beforeRender();
        assert.ok(view.context().deviceName);
        assert.notOk(view.context().reasonHelp);
        assert.notOk(view.context().hasDisconnected, false);
      });
    });

    describe('selectOption event', () => {
      it('select disables form properly', () => {
        sinon.spy(view, 'disableForm');
        sinon.spy(view, 'enableForm');

        return view.render().then(() => {
          assert.ok(view.disableForm.calledOnce);
          assert.notOk(view.enableForm.calledOnce);
          assert.ok($(view.el).find('.primary.disabled').length, 'has disabled class');

          // choose an option
          $(view.el).find('.disconnect-reasons').val('no').change();
          assert.notOk($(view.el).find('.primary.disabled').length, 'no disabled button');
          assert.ok(view.disableForm.calledOnce);
          assert.ok(view.enableForm.calledOnce);

          // choose first option again
          $(view.el).find('.disconnect-reasons').val('reason').change();
          assert.ok($(view.el).find('.primary.disabled').length, 'disabled button at first');
        });
      });
    });

    describe('closePanelAfterDisconnect event', () => {
      it('does not close panel if not disconnected', () => {
        sinon.spy(view, 'closeDisconnectModal');
        view.closePanelAfterDisconnect();
        assert.notOk(view.closeDisconnectModal.calledOnce, 'does not close panel');
      });

      it('close panel if disconnected device', () => {
        view.hasDisconnected = true;
        sinon.spy(view, 'closeDisconnectModal');
        view.closePanelAfterDisconnect();
        assert.ok(view.closeDisconnectModal.calledOnce);
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        sinon.stub(view.user, 'destroyAccountClient', () => {
          return p();
        });
        sinon.spy(view, 'render');
        sinon.spy(view, 'navigateToSignIn');
        sinon.spy(view, 'closeModalPanel');
        sinon.spy(view, 'closeDisconnectModal');
      });

      it('suspicious option with current device', () => {
        return view.render().then(() => {
          $(view.el).find('.disconnect-reasons').val('suspicious').change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.ok(view.render.calledOnce, 'not rendered, current device');
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.suspicious'));
            assert.ok(view.navigateToSignIn.called, 'navigates away');
            assert.ok(view.closeModalPanel.called, 'close modal called');
            assert.notOk(view.closeDisconnectModal.called);
            assert.ok(view.reasonHelp);
          });
        });
      });

      it('lost option with not a current device', () => {
        model.set({
          clientId: 'device-1',
          clients: attachedClients
        });

        return view.render().then(() => {
          $(view.el).find('.disconnect-reasons').val('lost').change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.ok(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.lost'));
            assert.notOk(view.navigateToSignIn.called, 'does not navigate');
            assert.notOk(view.closeDisconnectModal.called);
            assert.ok(view.reasonHelp);
          });
        });
      });

      it('old option', () => {
        model.set({
          clientId: 'device-1',
          clients: attachedClients
        });

        return view.render().then(() => {
          $(view.el).find('.disconnect-reasons').val('old').change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.notOk(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.old'));
            assert.notOk(view.navigateToSignIn.called);
            assert.ok(view.closeDisconnectModal.called);
            assert.notOk(view.reasonHelp);
          });
        });
      });

      it('no option', () => {
        model.set({
          clientId: 'device-1',
          clients: attachedClients
        });

        return view.render().then(() => {
          $(view.el).find('.disconnect-reasons').val('no').change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.notOk(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.no'));
            assert.notOk(view.navigateToSignIn.called);
            assert.ok(view.closeDisconnectModal.called);
            assert.notOk(view.reasonHelp);
          });
        });
      });

    });

  });
});
