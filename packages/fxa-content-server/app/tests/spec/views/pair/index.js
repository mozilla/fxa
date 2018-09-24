/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {assert} from 'chai';
import sinon from 'sinon';
import View from 'views/pair/index';
import BaseBroker from 'models/auth_brokers/base';
import Relier from 'models/reliers/relier';
import WindowMock from '../../../mocks/window';

const UA_CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36';
const UA_FIREFOX = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0';

describe('views/pair/index', () => {
  let view;
  let broker;
  let relier;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    relier = new Relier({}, {
      window: windowMock
    });
    broker = new BaseBroker({
      relier: relier,
      window: windowMock
    });
    view = new View({
      broker,
      viewName: 'pairIndex',
      window: windowMock
    });
    sinon.stub(view, 'navigate');
    sinon.spy(view, 'replaceCurrentPage');
  });

  afterEach(function () {
    view.destroy();
  });

  describe('render', () => {
    it('redirects to unsupported for non-Firefox desktop', () => {
      windowMock.navigator.userAgent = UA_CHROME;

      return view.render().then(() => {
        assert.isTrue(view.replaceCurrentPage.calledOnceWith('pair/unsupported'));
      });
    });

    it('redirects to CAD if not signed in', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;

      return view.render().then(() => {
        assert.isTrue(view.replaceCurrentPage.calledOnceWith('connect_another_device'));
      });
    });

    it('redirects to unsupported if no capability', () => {
      broker.set('browserSignedInAccount', { email: 'testuser@testuser.com', uid: 'uid' });
      return view.render().then(() => {
        assert.isTrue(view.replaceCurrentPage.calledOnceWith('pair/unsupported'));
      });
    });

    it('shows the code button', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.set('browserSignedInAccount', { email: 'testuser@testuser.com', uid: 'uid' });
      broker.setCapability('supportsPairing', true);

      return view.render().then(() => {
        assert.isFalse(view.replaceCurrentPage.calledOnceWith('pair/unsupported'));
        assert.ok(view.$el.find('#pair-header').text(), 'Connect another device');
        assert.ok(view.$el.find('.graphic').length);
      });
    });
  });

  describe('submit', () => {
    it('submits', () => {
      sinon.spy(view.broker, 'openPairPreferences');
      return view.render().then(() => {
        view.submit();
        assert.isTrue(view.broker.openPairPreferences.calledOnce);
      });
    });
  });
});
