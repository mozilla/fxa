/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import DOMEventMock from '../../mocks/dom-event';
import preventDefaultThen from 'views/decorators/prevent_default_then';
import TestHelpers from '../../lib/helpers';

const { wrapAssertion } = TestHelpers;

describe('views/decorators/prevent_default_then', function () {
  let view;
  const viewName = 'view';

  const View = BaseView();

  beforeEach(function () {
    view = new View({
      viewName: viewName,
    });

    return view.render();
  });

  afterEach(function () {
    if (view) {
      view.destroy();
      $('#container').empty();
    }

    view = null;
  });

  describe('preventDefaultThen', function () {
    it('can take the name of a function as the name of the event handler', function (done) {
      view.eventHandler = function (event) {
        wrapAssertion(function () {
          assert.isTrue(event.isDefaultPrevented());
        }, done);
      };

      var backboneHandler = preventDefaultThen('eventHandler');
      backboneHandler.call(view, new DOMEventMock());
    });

    it('can take a function as the event handler', function (done) {
      function eventHandler(event) {
        wrapAssertion(function () {
          assert.isTrue(event.isDefaultPrevented());
        }, done);
      }

      var backboneHandler = preventDefaultThen(eventHandler);
      backboneHandler.call(view, new DOMEventMock());
    });

    it('can take no arguments at all', function () {
      var backboneHandler = preventDefaultThen();

      var eventMock = new DOMEventMock();
      backboneHandler.call(view, eventMock);

      assert.isTrue(eventMock.isDefaultPrevented());
    });
  });
});
