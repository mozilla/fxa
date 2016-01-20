/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var chai = require('chai');
  var View = require('views/unexpected_error');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/unexpected_error', function () {
    var model;
    var view;
    var windowMock;

    beforeEach(function () {
      model = new Backbone.Model();
      windowMock = new WindowMock();

      view = new View({
        model: model,
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    it('shows error', function () {
      model.set('error', 'boom');

      return view.render()
          .then(function () {
            assert.equal(view.$('.error').text(), 'boom');
          });
    });
  });
});
