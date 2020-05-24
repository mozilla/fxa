/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import sinon from 'sinon';
import View from 'views/pp';
import WindowMock from '../../mocks/window';

var assert = chai.assert;

var TEMPLATE_TEXT = '<span id="fxa-pp-header"></span>';

describe('views/pp', function () {
  var view;
  var xhrMock;
  var windowMock;

  beforeEach(function () {
    xhrMock = {
      ajax() {
        return Promise.resolve(TEMPLATE_TEXT);
      },
    };

    windowMock = new WindowMock();
    windowMock.location.pathname = '/legal/privacy';

    view = new View({
      broker: {
        hasCapability: () => true,
      },
      window: windowMock,
      xhr: xhrMock,
    });
  });

  afterEach(function () {
    view.remove();
    view.destroy();
  });

  it('Back button is displayed if there is a page to go back to', function () {
    sinon.stub(view, 'canGoBack').callsFake(function () {
      return true;
    });

    return view.render().then(function () {
      assert.equal(view.$('#fxa-pp-back').length, 1);
    });
  });

  it('sets a cookie that lets the server correctly handle page refreshes', function () {
    return view.render().then(function () {
      assert.isTrue(
        /canGoBack=1; path=\/legal\/privacy/.test(windowMock.document.cookie)
      );
    });
  });

  it('Back button is not displayed if there is no page to go back to', function () {
    sinon.stub(view, 'canGoBack').callsFake(function () {
      return false;
    });

    return view.render().then(function () {
      assert.equal(view.$('#fxa-pp-back').length, 0);
    });
  });

  it('fetches translated text from the backend', function () {
    return view.render().then(function () {
      assert.ok(view.$('#fxa-pp-header').length);
    });
  });

  it('shows an error if fetch fails', function () {
    sinon.stub(xhrMock, 'ajax').callsFake(function () {
      return Promise.reject(new Error('could not fetch resource'));
    });

    return view.render().then(function () {
      assert.isTrue(xhrMock.ajax.called);
      assert.isTrue(view.isErrorVisible());
    });
  });
});
