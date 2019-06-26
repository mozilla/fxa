/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AttachedClients from 'models/attached-clients';
import Backbone from 'backbone';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/client_disconnect';
import WindowMock from '../../../mocks/window';

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
        type: 'tablet',
      },
      {
        clientType: 'device',
        id: 'device-2',
        isCurrentDevice: true,
        name: 'beta',
        type: 'mobile',
      },
    ]);
    clientId = 'device-2';

    model.set({
      clientId: clientId,
      clients: attachedClients,
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
      window: windowMock,
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
        assert.ok(
          $(view.el)
            .find('input[name=disconnect-reasons][value=no]')
            .prop('checked'),
          'Rather not Say'
        );
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
      sinon.stub(view.user, 'destroyAccountClient').callsFake(() => {
        return Promise.resolve();
      });
      sinon.spy(view, 'logFlowEvent');
      sinon.spy(view, 'render');
      sinon.spy(view, 'navigateToSignIn');
    });

    it('suspicious option with current device', () => {
      return view.render().then(() => {
        $(view.el)
          .find('input[name=disconnect-reasons][value=suspicious]')
          .prop('checked', true)
          .change();
        assert.equal(view.logFlowEvent.callCount, 0);

        return view.submit().then(() => {
          assert.ok(view.hasDisconnected);
          assert.ok(view.render.calledOnce, 'not rendered, current device');
          assert.ok(
            TestHelpers.isEventLogged(
              metrics,
              'settings.clients.disconnect.submit.suspicious'
            )
          );
          assert.ok(view.navigateToSignIn.called, 'navigates away');
          assert.ok(view.reasonHelp);

          assert.equal(view.logFlowEvent.callCount, 1);
          const args = view.logFlowEvent.args[0];
          assert.lengthOf(args, 1);
          const eventParts = args[0].split('.');
          assert.lengthOf(eventParts, 4);
          assert.equal(eventParts[0], 'timing');
          assert.equal(eventParts[1], 'clients');
          assert.equal(eventParts[2], 'disconnect');
          assert.match(eventParts[3], /^[0-9]+$/);
        });
      });
    });

    it('a click on the "Got it" button returns to `settings/clients`', () => {
      model.set({
        clientId: 'device-1',
        clients: attachedClients,
      });

      sinon.stub(view, 'navigate').callsFake(() => {});

      return view.render().then(() => {
        $(view.el)
          .find('input[name=disconnect-reasons][value=lost]')
          .prop('checked', true)
          .change();
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
        clients: attachedClients,
      });

      return view.render().then(() => {
        $(view.el)
          .find('input[name=disconnect-reasons][value=lost]')
          .prop('checked', true)
          .change();
        return view.submit().then(() => {
          assert.ok(view.hasDisconnected);
          assert.ok(view.render.calledTwice);
          assert.ok(
            TestHelpers.isEventLogged(
              metrics,
              'settings.clients.disconnect.submit.lost'
            )
          );
          assert.notOk(view.navigateToSignIn.called, 'does not navigate');
          assert.ok(view.reasonHelp);
        });
      });
    });

    it('old option', () => {
      model.set({
        clientId: 'device-1',
        clients: attachedClients,
      });

      return view.render().then(() => {
        $(view.el)
          .find('input[name=disconnect-reasons][value=old]')
          .prop('checked', true)
          .change();
        return view.submit().then(() => {
          assert.ok(view.hasDisconnected);
          assert.notOk(view.render.calledTwice);
          assert.ok(
            TestHelpers.isEventLogged(
              metrics,
              'settings.clients.disconnect.submit.old'
            )
          );
          assert.notOk(view.navigateToSignIn.called);
          assert.notOk(view.reasonHelp);
        });
      });
    });

    it('duplicate option', () => {
      model.set({
        clientId: 'device-1',
        clients: attachedClients,
      });

      return view.render().then(() => {
        $(view.el)
          .find('input[name=disconnect-reasons][value=duplicate]')
          .prop('checked', true)
          .change();
        return view.submit().then(() => {
          assert.ok(view.hasDisconnected);
          assert.notOk(view.render.calledTwice);
          assert.ok(
            TestHelpers.isEventLogged(
              metrics,
              'settings.clients.disconnect.submit.duplicate'
            )
          );
          assert.notOk(view.navigateToSignIn.called);
          assert.notOk(view.reasonHelp);
        });
      });
    });

    it('no option', () => {
      model.set({
        clientId: 'device-1',
        clients: attachedClients,
      });

      return view.render().then(() => {
        $(view.el)
          .find('input[name=disconnect-reasons][value=no]')
          .prop('checked', true)
          .change();
        return view.submit().then(() => {
          assert.ok(view.hasDisconnected);
          assert.notOk(view.render.calledTwice);
          assert.ok(
            TestHelpers.isEventLogged(
              metrics,
              'settings.clients.disconnect.submit.no'
            )
          );
          assert.notOk(view.navigateToSignIn.called);
          assert.notOk(view.reasonHelp);
        });
      });
    });
  });
});
