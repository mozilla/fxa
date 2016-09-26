/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var Broker = require('models/auth_brokers/base');
  var Chai = require('chai');
  var Cocktail = require('cocktail');
  var ExternalLinksMixin = require('views/mixins/external-links-mixin');
  var TestTemplate = require('stache!templates/test_template');
  var WindowMock = require('../../../mocks/window');

  var assert = Chai.assert;

  var View = BaseView.extend({
    template: TestTemplate
  });
  Cocktail.mixin(View, ExternalLinksMixin);

  describe('views/mixins/external-links-mixin', function () {
    var broker;
    var view;
    var windowMock;

    beforeEach(function () {
      broker = new Broker();
      windowMock = new WindowMock();
      windowMock.navigator.userAgent = 'mocha';

      view = new View({
        broker: broker,
        window: windowMock
      });
    });

    afterEach(function () {
      return view.destroy();
    });

    describe('broker does not support convertExternalLinksToText', function () {
      beforeEach(function () {
        return view.render();
      });

      it('does not convert external links', function () {
        assert.isFalse(view.$('#external-link').hasClass('visible-url'));
      });

      it('does not convert internal links', function () {
        assert.isFalse(view.$('#internal-link').hasClass('visible-url'));
      });
    });

    describe('broker supports convertExternalLinksToText', function () {
      beforeEach(function () {
        broker.setCapability('convertExternalLinksToText', true);
        return view.render();
      });

      it('converts external links', function () {
        var $externalLink = view.$('#external-link');
        assert.isTrue($externalLink.hasClass('visible-url'));
        assert.equal(
          $externalLink.attr('data-visible-url'), $externalLink.attr('href'));
      });

      it('does not convert internal links', function () {
        assert.isFalse(view.$('#internal-link').hasClass('visible-url'));
      });

      it('adds rel in external links', function () {
        var $externalLink = view.$('#external-link');
        assert.equal(
         $externalLink.attr('rel'),'noopener noreferrer');
      });

      it('does not add rel in internal links', function () {
        var $internalLink = view.$('#internal-link');
        assert.notEqual(
         $internalLink.attr('rel'),'noopener noreferrer');
      });

      it('does not convert if text and the href are the same', () => {
        assert.equal(
          typeof view.$('#data-visible-url-not-added').attr('data-visible-url'),
          'undefined'
        );
      });
    });
  });
});
