/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var BaseView = require('views/base');
  var Chai = require('chai');
  var Cocktail = require('cocktail');
  var LoadingMixin = require('views/mixins/loading-mixin');
  var Template = require('stache!templates/test_template');
  var WindowMock = require('../../../mocks/window');

  var assert = Chai.assert;

  var View = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    View,
    LoadingMixin
  );

  describe('views/mixins/loading-mixin', function () {
    var windowMock;

    beforeEach(function () {
      $('#container').html('<div id="stage"></div>');

      windowMock = new WindowMock();

      void new View({
        viewName: 'loading-view',
        window: windowMock
      });
    });

    it('renders the loading template into the #stage element before the view is rendered', function () {
      assert.equal($('#stage .loading').length, 1);
    });
  });
});

