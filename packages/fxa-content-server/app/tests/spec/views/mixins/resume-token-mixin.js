/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const $ = require('jquery');
const { assert } = require('chai');
const BaseView = require('views/base');
const Cocktail = require('cocktail');
const ResumeToken = require('models/resume-token');
const ResumeTokenMixin = require('views/mixins/resume-token-mixin');
const sinon = require('sinon');
const TestTemplate = require('templates/test_template.mustache');

const TestView = BaseView.extend({
  template: TestTemplate,

  initialize (options = {}) {
    this.metrics = options.metrics;
    this.relier = options.relier;
    this.user = options.user;
  }
});

Cocktail.mixin(
  TestView,
  ResumeTokenMixin
);

describe('views/mixins/resume-token-mixin', function () {
  let account;
  let flow;
  let metrics;
  let relier;
  let user;
  let view;

  beforeEach(function () {
    account = {
      pickResumeTokenInfo: sinon.spy()
    };

    flow = {
      pickResumeTokenInfo: sinon.spy()
    };

    metrics = {
      getFlowModel () {
        return flow;
      }
    };

    relier = {
      pickResumeTokenInfo: sinon.spy()
    };

    user = {
      pickResumeTokenInfo: sinon.spy()
    };

    view = new TestView({
      metrics,
      relier,
      user
    });

    return view.render();
  });

  afterEach(function () {
    $('#container').empty();
  });

  describe('getResumeToken', function () {
    it('returns a ResumeToken model', function () {
      assert.instanceOf(view.getResumeToken(account), ResumeToken);

      assert.isTrue(account.pickResumeTokenInfo.calledOnce);
      assert.isTrue(flow.pickResumeTokenInfo.calledOnce);
      assert.isTrue(relier.pickResumeTokenInfo.calledOnce);
      assert.isTrue(user.pickResumeTokenInfo.calledOnce);
    });
  });

  describe('getStringifiedResumeToken', function () {
    it('returns a stringified resume token', function () {
      assert.typeOf(view.getStringifiedResumeToken(account), 'string');

      assert.isTrue(account.pickResumeTokenInfo.calledOnce);
      assert.isTrue(flow.pickResumeTokenInfo.calledOnce);
      assert.isTrue(relier.pickResumeTokenInfo.calledOnce);
      assert.isTrue(user.pickResumeTokenInfo.calledOnce);
    });
  });
});
