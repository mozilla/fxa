/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Backbone from 'backbone';
import chai from 'chai';
import Cocktail from 'cocktail';
import ResumeToken from 'models/resume-token';
import ResumeTokenMixin from 'models/mixins/resume-token';
import sinon from 'sinon';
import vat from 'lib/vat';

var assert = chai.assert;

describe('models/mixins/resume-token', function() {
  var model, sentryMetrics;
  var UTM_CAMPAIGN = 'deadbeef';
  var RESUME_SCHEMA = {
    utmCampaign: vat
      .hex()
      .len(8)
      .required(),
  };
  var VALID_RESUME_DATA = {
    notResumeable: 'this should not be picked',
    utmCampaign: UTM_CAMPAIGN,
  };
  var INVALID_RESUME_DATA = {
    utmCampaign: 'foo',
  };
  var MISSING_RESUME_DATA = {};

  var Model = Backbone.Model.extend({
    initialize(options) {
      this.sentryMetrics = sentryMetrics;
      this.window = options.window;
    },

    resumeTokenFields: ['utmCampaign'],

    resumeTokenSchema: RESUME_SCHEMA,
  });

  Cocktail.mixin(Model, ResumeTokenMixin);

  beforeEach(function() {
    sentryMetrics = {
      captureException: sinon.spy(),
    };
    model = new Model({});
  });

  describe('pickResumeTokenInfo', function() {
    it('returns an object with info to be passed along with email verification links', function() {
      model.set(VALID_RESUME_DATA);

      assert.deepEqual(model.pickResumeTokenInfo(), {
        utmCampaign: UTM_CAMPAIGN,
      });
    });
  });

  describe('populateFromResumeToken with valid data', function() {
    beforeEach(function() {
      var resumeToken = new ResumeToken(VALID_RESUME_DATA);
      model.populateFromResumeToken(resumeToken);
    });

    it('populates the model with data from the ResumeToken', function() {
      assert.equal(model.get('utmCampaign'), UTM_CAMPAIGN);
      assert.isFalse(
        model.has('notResumeable'),
        'only allow specific resume token values'
      );
    });

    it('does not call sentryMetrics.captureException', function() {
      assert.strictEqual(sentryMetrics.captureException.callCount, 0);
    });
  });

  describe('populateFromResumeToken with invalid data', function() {
    beforeEach(function() {
      var resumeToken = new ResumeToken(INVALID_RESUME_DATA);
      model.populateFromResumeToken(resumeToken);
    });

    it('does not populate the model', function() {
      assert.isFalse(model.has('utmCampaign'));
    });

    it('called sentryMetrics.captureException correctly', function() {
      assert.strictEqual(sentryMetrics.captureException.callCount, 1);
      var args = sentryMetrics.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.instanceOf(args[0], Error);
      assert.strictEqual(
        args[0].message,
        'Invalid property in resume token: utmCampaign'
      );
    });
  });

  describe('populateFromResumeToken with missing data', function() {
    beforeEach(function() {
      var resumeToken = new ResumeToken(MISSING_RESUME_DATA);
      model.populateFromResumeToken(resumeToken);
    });

    it('does not populate the model', function() {
      assert.isFalse(model.has('utmCampaign'));
    });

    it('called sentryMetrics.captureException correctly', function() {
      assert.strictEqual(sentryMetrics.captureException.callCount, 1);
      var args = sentryMetrics.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.instanceOf(args[0], Error);
      assert.strictEqual(
        args[0].message,
        'Missing property in resume token: utmCampaign'
      );
    });
  });

  describe('populateFromStringifiedResumeToken with valid data', function() {
    beforeEach(function() {
      var stringifiedResumeToken = ResumeToken.stringify(VALID_RESUME_DATA);
      model.populateFromStringifiedResumeToken(stringifiedResumeToken);
    });

    it('parses the resume param into an object', function() {
      assert.equal(model.get('utmCampaign'), UTM_CAMPAIGN);
      assert.isFalse(
        model.has('notResumeable'),
        'only allow specific resume token values'
      );
    });

    it('does not call sentryMetrics.captureException', function() {
      assert.strictEqual(sentryMetrics.captureException.callCount, 0);
    });
  });

  describe('populateFromStringifiedResumeToken with invalid data', function() {
    beforeEach(function() {
      var stringifiedResumeToken = ResumeToken.stringify(INVALID_RESUME_DATA);
      model.populateFromStringifiedResumeToken(stringifiedResumeToken);
    });

    it('does not populate the model', function() {
      assert.isFalse(model.has('utmCampaign'));
    });

    it('called sentryMetrics.captureException correctly', function() {
      assert.strictEqual(sentryMetrics.captureException.callCount, 1);
      var args = sentryMetrics.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.instanceOf(args[0], Error);
      assert.strictEqual(
        args[0].message,
        'Invalid property in resume token: utmCampaign'
      );
    });
  });

  describe('populateFromStringifiedResumeToken with missing data', function() {
    beforeEach(function() {
      var stringifiedResumeToken = ResumeToken.stringify(MISSING_RESUME_DATA);
      model.populateFromStringifiedResumeToken(stringifiedResumeToken);
    });

    it('does not populate the model', function() {
      assert.isFalse(model.has('utmCampaign'));
    });

    it('called sentryMetrics.captureException correctly', function() {
      assert.strictEqual(sentryMetrics.captureException.callCount, 1);
      var args = sentryMetrics.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.instanceOf(args[0], Error);
      assert.strictEqual(
        args[0].message,
        'Missing property in resume token: utmCampaign'
      );
    });
  });
});
