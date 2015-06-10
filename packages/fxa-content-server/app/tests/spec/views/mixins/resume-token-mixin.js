/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'cocktail',
  'models/reliers/relier',
  'models/resume-token',
  'stache!templates/test_template',
  'views/base',
  'views/mixins/resume-token-mixin',
], function (chai, Cocktail, Relier, ResumeToken, TestTemplate,
  BaseView, ResumeTokenMixin ) {
  'use strict';

  var assert = chai.assert;

  var TestView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(
    TestView,
    ResumeTokenMixin
  );

  describe('views/mixins/resume-token-mixin', function () {
    var view;
    var relier;

    beforeEach(function () {
      relier = new Relier();

      view = new TestView({
        relier: relier
      });

      return view.render();
    });

    afterEach(function () {
      $('#container').empty();
    });

    describe('getResumeToken', function () {
      it('returns a ResumeToken model', function () {
        assert.instanceOf(view.getResumeToken(), ResumeToken);
      });
    });

    describe('getStringifiedResumeToken', function () {
      it('returns a stringified resume token', function () {
        assert.typeOf(view.getStringifiedResumeToken(), 'string');
      });
    });
  });
});
