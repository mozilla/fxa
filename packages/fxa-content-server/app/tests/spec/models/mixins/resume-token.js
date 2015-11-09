/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var ResumeToken = require('models/resume-token');
  var ResumeTokenMixin = require('models/mixins/resume-token');

  var assert = chai.assert;

  describe('models/mixins/resume-token', function () {
    var model;
    var CAMPAIGN = 'campaign id';
    var RESUME_DATA = {
      campaign: CAMPAIGN,
      notResumeable: 'this should not be picked'
    };

    var Model = Backbone.Model.extend({
      initialize: function (options) {
        this.window = options.window;
      },

      resumeTokenFields: ['campaign']
    });

    Cocktail.mixin(
      Model,
      ResumeTokenMixin
    );

    beforeEach(function () {
      model = new Model({});
    });

    describe('pickResumeTokenInfo', function () {
      it('returns an object with info to be passed along with email verification links', function () {
        model.set(RESUME_DATA);

        assert.deepEqual(model.pickResumeTokenInfo(), {
          campaign: CAMPAIGN
        });
      });
    });

    describe('populateFromResumeToken', function () {
      it('populates the model with data from the ResumeToken', function () {
        var resumeToken = new ResumeToken(RESUME_DATA);
        model.populateFromResumeToken(resumeToken);

        assert.equal(model.get('campaign'), CAMPAIGN);
        assert.isFalse(model.has('notResumeable'), 'only allow specific resume token values');
      });
    });

    describe('populateFromStringifiedResumeToken', function () {
      it('parses the resume param into an object', function () {
        var stringifiedResumeToken = ResumeToken.stringify(RESUME_DATA);

        model.populateFromStringifiedResumeToken(stringifiedResumeToken);

        assert.equal(model.get('campaign'), CAMPAIGN);
        assert.isFalse(model.has('notResumeable'), 'only allow specific resume token values');
      });
    });
  });
});
