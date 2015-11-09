/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var Relier = require('models/reliers/relier');
  var ResumeToken = require('models/resume-token');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var TestTemplate = require('stache!templates/test_template');

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
