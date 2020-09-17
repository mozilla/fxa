/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import sinon from 'sinon';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Constants from 'lib/constants';
import Relier from 'models/reliers/relier';
import ResumeToken from 'models/resume-token';
import TestHelpers from '../../../lib/helpers';
import WindowMock from '../../../mocks/window';
import xhr from 'lib/xhr';

describe('models/reliers/relier', function () {
  var relier;
  var windowMock;

  var EMAIL = 'email@moz.org';
  var ENTRYPOINT = 'preferences';
  var ENTRYPOINT_EXPERIMENT = 'wibble';
  var ENTRYPOINT_VARIATION = 'blee';
  var SETTING = 'avatar';
  var UID = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
  var UTM_CAMPAIGN = 'utm_campaign';
  var UTM_CONTENT = 'utm_content';
  var UTM_MEDIUM = 'utm_medium';
  var UTM_SOURCE = 'utm_source';
  var UTM_TERM = 'utm_term';

  beforeEach(function () {
    windowMock = new WindowMock();

    relier = new Relier(
      {},
      {
        window: windowMock,
      }
    );
  });

  it('fetch with missing `resume` token is not a problem', function () {
    windowMock.location.search = TestHelpers.toSearchString({
      utm_campaign: UTM_CAMPAIGN, //eslint-disable-line camelcase
    });

    return relier.fetch().then(function () {
      assert.equal(relier.get('utmCampaign'), UTM_CAMPAIGN);
    });
  });

  it('fetch populates expected fields from the search parameters, unexpected search parameters are ignored', function () {
    windowMock.location.search = TestHelpers.toSearchString({
      coppa: 'false',
      email: EMAIL,
      entrypoint: ENTRYPOINT,
      entrypoint_experiment: ENTRYPOINT_EXPERIMENT, //eslint-disable-line camelcase
      entrypoint_variation: ENTRYPOINT_VARIATION, //eslint-disable-line camelcase
      ignored: 'ignored',
      setting: SETTING,
      uid: UID,
      utm_campaign: UTM_CAMPAIGN, //eslint-disable-line camelcase
      utm_content: UTM_CONTENT, //eslint-disable-line camelcase
      utm_medium: UTM_MEDIUM, //eslint-disable-line camelcase
      utm_source: UTM_SOURCE, //eslint-disable-line camelcase
      utm_term: UTM_TERM, //eslint-disable-line camelcase
    });

    return relier.fetch().then(function () {
      // Next two are not imported from the search parameters, but is set manually.
      assert.equal(relier.get('context'), Constants.CONTENT_SERVER_CONTEXT);

      assert.isFalse(relier.get('isCoppaEnabled'));
      // The rest are imported from search parameters
      assert.equal(relier.get('email'), EMAIL);

      assert.equal(relier.get('setting'), SETTING);
      assert.equal(relier.get('uid'), UID);
      assert.equal(relier.get('entrypoint'), ENTRYPOINT);
      assert.equal(relier.get('entrypointExperiment'), ENTRYPOINT_EXPERIMENT);
      assert.equal(relier.get('entrypointVariation'), ENTRYPOINT_VARIATION);

      assert.equal(relier.get('utmCampaign'), UTM_CAMPAIGN);
      assert.equal(relier.get('utmContent'), UTM_CONTENT);
      assert.equal(relier.get('utmMedium'), UTM_MEDIUM);
      assert.equal(relier.get('utmSource'), UTM_SOURCE);
      assert.equal(relier.get('utmTerm'), UTM_TERM);

      assert.isFalse(relier.has('ignored'));
    });
  });

  describe('fetchSubscriptionProductName', () => {
    const subscriptionProductId = 'prod_8675309';
    const subscriptionProductName = '123 Done Pro';
    const config = {
      authServerUrl: 'http://example.com',
    };
    const productNameUrl = `${config.authServerUrl}/v1/oauth/subscriptions/productname?productId=${subscriptionProductId}`;

    beforeEach(() => {
      relier.initialize({}, { config });
    });

    afterEach(() => {
      xhr.ajax.restore();
    });

    it('fetches product name if subscriptionProductId is set', () => {
      sinon.stub(xhr, 'ajax').resolves({
        /* eslint-disable camelcase */
        product_name: subscriptionProductName,
        /* eslint-enable camelcase */
      });
      relier.set({ subscriptionProductId });
      return relier.fetchSubscriptionProductName().then(() => {
        assert.isTrue(
          xhr.ajax.calledWith({ type: 'GET', url: productNameUrl })
        );
        assert.isTrue(
          subscriptionProductName === relier.get('subscriptionProductName')
        );
      });
    });

    it('returns early if subscriptionProductId is not set', () => {
      sinon.spy(xhr, 'ajax');
      assert.equal(undefined, relier.fetchSubscriptionProductName());
      assert.isFalse(xhr.ajax.called);
      assert.isFalse(
        subscriptionProductName === relier.get('subscriptionProductName')
      );
    });

    it('returns early if subscriptionProductName is already set', () => {
      sinon.spy(xhr, 'ajax');
      relier.set({ subscriptionProductId, subscriptionProductName });
      assert.equal(undefined, relier.fetchSubscriptionProductName());
      assert.isFalse(xhr.ajax.called);
    });

    it('clears subscriptionProductId if product name not found', () => {
      sinon.stub(xhr, 'ajax').resolves({ status: 404 });
      relier.set({ subscriptionProductId });
      return relier.fetchSubscriptionProductName().then(() => {
        assert.isTrue(
          xhr.ajax.calledWith({ type: 'GET', url: productNameUrl })
        );
        assert.isTrue(
          typeof relier.get('subscriptionProductId') === 'undefined'
        );
        assert.isFalse(
          subscriptionProductName === relier.get('subscriptionProductName')
        );
      });
    });
  });

  it('entryPoint is correctly translated to `entrypoint` if `entrypoint` is not specified', function () {
    windowMock.location.search = TestHelpers.toSearchString({
      entryPoint: ENTRYPOINT,
    });

    return relier.fetch().then(function () {
      assert.equal(relier.get('entrypoint'), ENTRYPOINT);
    });
  });

  it('entryPoint is ignored if `entrypoint` is already specified', function () {
    windowMock.location.search = TestHelpers.toSearchString({
      entryPoint: 'ignored entrypoint',
      entrypoint: ENTRYPOINT,
    });

    return relier.fetch().then(function () {
      assert.equal(relier.get('entrypoint'), ENTRYPOINT);
    });
  });

  ['trailhead-1'].forEach((value) => {
    testInvalidQueryParam('style', value);
  });

  [undefined, 'email', 'signin', 'signup', 'force_auth', 'pairing'].forEach(
    (action) => {
      describe(`valid action: ${action}`, () => {
        testValidQueryParam('action', action, 'action', action);
      });
    }
  );

  ['', ' ', 'invalid'].forEach((action) => {
    describe(`invalid action: ${action}`, () => {
      testInvalidQueryParam('action', action);
    });
  });

  describe('email non-verification flow', function () {
    beforeEach(function () {
      relier.set('isVerification', false);
    });

    ['', ' ', 'invalid email'].forEach(function (email) {
      testInvalidQueryParam('email', email);
    });

    ['testuser@testuser.com', 'testuser@testuser.co.uk'].forEach(function (
      value
    ) {
      testValidQueryParam('email', value, 'email', value);
    });
  });

  describe('email first flow', () => {
    [' '].forEach(function (email) {
      testInvalidQueryParam('email', email);
    });

    [
      '',
      'invalid email',
      'testuser@testuser.com',
      'testuser@testuser.co.uk',
    ].forEach((value) => {
      testValidQueryParam('email', value, 'email', value.trim(), {
        action: 'email',
      });
    });
  });

  describe('email verification flow', function () {
    beforeEach(function () {
      relier = new Relier(
        {},
        {
          isVerification: true,
          window: windowMock,
        }
      );
    });

    [
      // the non-email strings will cause a validation error in
      // the consuming views.
      '',
      ' ',
      'invalid email',
      'testuser@testuser.com',
      'testuser@testuser.co.uk',
    ].forEach(function (value) {
      testValidQueryParam('email', value, 'email', value.trim());
    });
  });

  describe('uid non-verification flow', function () {
    beforeEach(function () {
      relier.set('isVerification', false);
    });

    ['', ' ', 'invalid uid'].forEach(function (uid) {
      testInvalidQueryParam('uid', uid);
    });

    [UID].forEach(function (value) {
      testValidQueryParam('uid', value, 'uid', value);
    });
  });

  describe('uid verification flow', function () {
    beforeEach(function () {
      relier = new Relier(
        {},
        {
          isVerification: true,
          window: windowMock,
        }
      );
    });

    [
      // the non-uid strings will cause a validation error in
      // the consuming views.
      '',
      ' ',
      'invalid uid',
      UID,
    ].forEach(function (value) {
      testValidQueryParam('uid', value, 'uid', value.trim());
    });
  });

  it('isOAuth returns `false`', function () {
    assert.isFalse(relier.isOAuth());
  });

  it('isSync returns `false` by default', function () {
    return relier.fetch().then(function () {
      assert.isFalse(relier.isSync());
    });
  });

  it('pickResumeTokenInfo returns an object with info to be passed along with email verification links', function () {
    var UTM_CAMPAIGN = 'campaign id';
    var ITEM = 'item';
    var ENTRYPOINT = 'entry point';

    relier.set({
      entrypoint: ENTRYPOINT,
      entrypointExperiment: ITEM,
      entrypointVariation: ITEM,
      notPassed: 'this should not be picked',
      resetPasswordConfirm: true,
      style: 'trailhead',
      utmCampaign: UTM_CAMPAIGN,
      utmContent: ITEM,
      utmMedium: ITEM,
      utmSource: ITEM,
      utmTerm: ITEM,
    });

    assert.deepEqual(relier.pickResumeTokenInfo(), {
      entrypoint: ENTRYPOINT,
      entrypointExperiment: ITEM,
      entrypointVariation: ITEM,
      resetPasswordConfirm: true,
      style: 'trailhead',
      utmCampaign: UTM_CAMPAIGN,
      utmContent: ITEM,
      utmMedium: ITEM,
      utmSource: ITEM,
      utmTerm: ITEM,
    });
  });

  it('re-population from resume token parses the resume param into an object', function () {
    var UTM_CAMPAIGN = 'campaign id';
    var ENTRYPOINT = 'entry point';
    var resumeData = {
      entrypoint: ENTRYPOINT,
      notImported: 'this should not be picked',
      resetPasswordConfirm: false,
      utmCampaign: UTM_CAMPAIGN,
    };
    var resumeToken = ResumeToken.stringify(resumeData);

    windowMock.location.search = TestHelpers.toSearchString({
      resume: resumeToken,
    });

    return relier.fetch().then(function () {
      assert.equal(relier.get('utmCampaign'), UTM_CAMPAIGN);
      assert.equal(relier.get('entrypoint'), ENTRYPOINT);
      assert.isUndefined(
        relier.get('notImported'),
        'only allow specific resume token values'
      );
      assert.isFalse(relier.get('resetPasswordConfirm'));
    });
  });

  function testInvalidQueryParam(paramName, value) {
    it(
      'invalid query param fails (' + paramName + ":'" + value + "')",
      function () {
        var params = {};
        params[paramName] = value;
        windowMock.location.search = TestHelpers.toSearchString(params);

        return relier.fetch().then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, paramName);
        });
      }
    );
  }

  function testValidQueryParam(
    paramName,
    paramValue,
    modelName,
    expectedValue,
    params = {}
  ) {
    it(
      'valid query param succeeds (' + paramName + ':' + paramValue + ')',
      function () {
        if (!_.isUndefined(paramValue)) {
          params[paramName] = paramValue;
        } else {
          delete params[paramName];
        }

        windowMock.location.search = TestHelpers.toSearchString(params);

        return relier.fetch().then(function () {
          if (_.isUndefined(expectedValue)) {
            assert.isFalse(relier.has(modelName));
          } else {
            assert.equal(relier.get(modelName), expectedValue);
          }
        });
      }
    );
  }
});
