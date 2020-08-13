/* eslint-disable camelcase */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/get_flow';
import Notifier from 'lib/channels/notifier';
import WindowMock from '../../mocks/window';
import Url from '../../../scripts/lib/url';

describe('views/get_flow', function () {
  let account;
  let user;
  let view;

  const flowData = {
    deviceId: 'foo',
    flowBeginTime: 987654,
    flowId: 'h2k3v5',
  };

  function render() {
    return view.render().then(() => view.afterVisible());
  }

  beforeEach(function () {
    account = new Account();
    user = new User();

    view = new View({
      user,
      notifier: new Notifier(),
      window: new WindowMock(),
    });

    sinon.stub(user, 'sessionStatus').resolves(account);
    sinon.stub(view, 'getSignedInAccount').returns(account);
    sinon.stub(view, 'initializeFlowEvents');
    sinon.stub(view, 'navigateAway');
    sinon.stub(view.metrics, 'getFlowEventMetadata').returns(flowData);
    sinon.stub(view.metrics, 'getFilteredValue').returns('foo');

    sinon.stub(view.window.console, 'error');
  });

  afterEach(function () {
    $(view.el).remove();
    view.window.console.error.restore();
    view.metrics.getFlowEventMetadata.restore();
    view.metrics.getFilteredValue.restore();
    view.destroy();
    view = null;
  });

  describe('render with proper params', () => {
    const betaSettingsPath = '/beta/settings';
    let queryParams = Object.assign(flowData, {
      broker: 'foo',
      context: 'foo',
      isSampledUser: 'foo',
      service: 'foo',
      uniqueUserId: 'foo',
    });

    describe('correct redirect_path', () => {
      beforeEach(() => {
        view.window.location.search = `?redirect_to=${encodeURIComponent(
          betaSettingsPath
        )}`;

        return render();
      });

      it('renders correctly, initializes flow events, redirects back', () => {
        assert.lengthOf(view.$('.redirect-loading'), 1);
        sinon.assert.calledOnce(view.initializeFlowEvents);

        sinon.assert.calledWithExactly(
          view.navigateAway,
          `${betaSettingsPath}${Url.objToSearchString(queryParams)}`
        );
      });
    });

    describe('correct redirect_path that has extra params', () => {
      beforeEach(() => {
        queryParams = Object.assign(queryParams, { science: 'rules' });

        view.window.location.search = `?redirect_to=${encodeURIComponent(
          `${betaSettingsPath}${Url.objToSearchString({
            science: 'rules',
          })}`
        )}`;

        return render();
      });

      it('renders correctly, initializes flow events, redirects back maintaining extra params', () => {
        assert.lengthOf(view.$('.redirect-loading'), 1);
        sinon.assert.calledOnce(view.initializeFlowEvents);

        sinon.assert.calledWithExactly(
          view.navigateAway,
          `${betaSettingsPath}${Url.objToSearchString(queryParams)}`
        );
      });
    });
  });

  describe('render with improper params', () => {
    describe('no redirect_path', () => {
      beforeEach(() => render());

      it('does not redirect and errors', () => {
        sinon.assert.calledWithExactly(
          view.window.console.error,
          'This page requires a `redirect_to` path parameter'
        );
        sinon.assert.notCalled(view.navigateAway);
      });
    });

    describe('absolute url as redirect_path', () => {
      beforeEach(() => {
        view.window.location.search = `?redirect_to=${encodeURIComponent(
          'http://bad-stuff.onion'
        )}`;

        return render();
      });

      it('does not redirect and errors', () => {
        sinon.assert.calledWithExactly(
          view.window.console.error,
          '`redirect_to` must not be an absolute address'
        );
        sinon.assert.notCalled(view.navigateAway);
      });
    });
  });
});
