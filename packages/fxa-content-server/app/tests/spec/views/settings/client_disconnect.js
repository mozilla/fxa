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
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const User = require('models/user');
  const View = require('views/settings/client_disconnect');
  const WindowMock = require('../../../mocks/window');

  describe('views/settings/client_disconnect', () => {
    let attachedClients;
    let clientId;
    let metrics;
    const model = new Backbone.Model();
    let notifier;
    let relier;
    let user;
    let view;
    let windowMock;

    beforeEach(() => {
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      relier = new Relier();
      user = new User();
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
        metrics,
        model,
        notifier,
        relier,
        user,
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
          assert.ok($(view.el).find('.disconnect-reasons').length, 'radio');
          assert.notOk($(view.el).find('.reason-help').length, 'help');
        });
      });

      it('renders view after disconnection', () => {
        view.hasDisconnected = true;
        return view.render().then(() => {
          assert.notOk($(view.el).find('.intro').length, 'intro text');
          assert.notOk($(view.el).find('.disconnect-reasons').length, 'radio');
          assert.ok($(view.el).find('.reason-help').length, 'help');
        });
      });

    });

    describe('context', () => {
      it('has props', () => {
        view.beforeRender();
        const context = view.getContext();
        assert.ok(context.deviceName);
        assert.notOk(context.reasonHelp);
        assert.notOk(context.hasDisconnected);
      });
    });

    describe('selectOption event', () => {
      it('select disables form properly', () => {
        sinon.spy(view, 'disableForm');
        sinon.spy(view, 'enableForm');

        return view.render().then(() => {
          assert.ok(view.disableForm.calledOnce);
          assert.notOk(view.enableForm.calledOnce);
          assert.ok($(view.el).find('.warning.disabled').length, 'has disabled class');

          // choose an option
          $(view.el).find('input[name=disconnect-reasons][value=no]').prop('checked', true).change();
          assert.notOk($(view.el).find('.warning.disabled').length, 'no disabled button');
          assert.ok(view.disableForm.calledOnce);
          assert.ok(view.enableForm.calledOnce);
        });
      });
    });

    describe('_returnToClientListAfterDisconnect event', () => {
      it('does not navigate if not disconnected', () => {
        sinon.spy(view, 'navigate');
        view._returnToClientListAfterDisconnect();
        assert.isFalse(view.navigate.calledOnce, 'does not close panel');
      });

      it('navigates if disconnected device', () => {
        view.hasDisconnected = true;
        sinon.spy(view, 'navigate');
        view._returnToClientListAfterDisconnect();
        assert.isTrue(view.navigate.calledOnce);
        assert.isTrue(view.navigate.calledWith('settings/clients'));
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        sinon.stub(view.user, 'destroyAccountClient', () => {
          return p();
        });
        sinon.spy(view, 'render');
        sinon.spy(view, 'navigateToSignIn');
      });

      it('suspicious option with current device', () => {
        return view.render().then(() => {
          $(view.el).find('input[name=disconnect-reasons][value=suspicious]').prop('checked', true).change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.ok(view.render.calledOnce, 'not rendered, current device');
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.suspicious'));
            assert.ok(view.navigateToSignIn.called, 'navigates away');
            assert.ok(view.reasonHelp);
          });
        });
      });

      it('a click on the "Got it" button returns to `settings/clients`', () => {
        model.set({
          clientId: 'device-1',
          clients: attachedClients
        });

        sinon.stub(view, 'navigate', () => {});

        return view.render().then(() => {
          $(view.el).find('input[name=disconnect-reasons][value=lost]').prop('checked', true).change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            view.$el.find('button[type=submit]').click();
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('settings/clients'));
          });
        });
      });

      it('lost option with not a current device', () => {
        model.set({
          clientId: 'device-1',
          clients: attachedClients
        });

        return view.render().then(() => {
          $(view.el).find('input[name=disconnect-reasons][value=lost]').prop('checked', true).change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.ok(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.lost'));
            assert.notOk(view.navigateToSignIn.called, 'does not navigate');
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
          $(view.el).find('input[name=disconnect-reasons][value=old]').prop('checked', true).change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.notOk(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.old'));
            assert.notOk(view.navigateToSignIn.called);
            assert.notOk(view.reasonHelp);
          });
        });
      });

      it('duplicate option', () => {
        model.set({
          clientId: 'device-1',
          clients: attachedClients
        });

        return view.render().then(() => {
          $(view.el).find('input[name=disconnect-reasons][value=duplicate]').prop('checked', true).change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.notOk(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.duplicate'));
            assert.notOk(view.navigateToSignIn.called);
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
          $(view.el).find('input[name=disconnect-reasons][value=no]').prop('checked', true).change();
          return view.submit().then(() => {
            assert.ok(view.hasDisconnected);
            assert.notOk(view.render.calledTwice);
            assert.ok(TestHelpers.isEventLogged(metrics, 'settings.clients.disconnect.submit.no'));
            assert.notOk(view.navigateToSignIn.called);
            assert.notOk(view.reasonHelp);
          });
        });
      });
    });
  });
});
