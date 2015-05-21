/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'cocktail',
  'chai',
  'views/mixins/loading-mixin',
  'views/base',
  'stache!templates/test_template',
  '../../../mocks/window'
], function ($, Cocktail, Chai, LoadingMixin, BaseView, Template, WindowMock) {
  var assert = Chai.assert;

  var View = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    View,
    LoadingMixin
  );

  describe('views/mixins/loading-mixin', function () {
    var view;
    var windowMock;

    beforeEach(function () {
      $('#container').html('<div id="stage"></div>');

      windowMock = new WindowMock();

      view = new View({
        screenName: 'loading-view',
        window: windowMock
      });
    });

    it('renders the loading template into the #stage element before the view is rendered', function () {
      assert.equal($('#stage .loading').length, 1);
    });
  });
});

