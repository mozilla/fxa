/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Broker from 'models/auth_brokers/base';
import Cocktail from 'cocktail';
import ExternalLinksMixin from 'views/mixins/external-links-mixin';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import TestTemplate from 'templates/test_template.mustache';
import WindowMock from '../../../mocks/window';

const View = BaseView.extend({
  template: TestTemplate,
});
Cocktail.mixin(View, ExternalLinksMixin);

describe('views/mixins/external-links-mixin', function() {
  let broker;
  let metrics;
  let notifier;
  let view;
  let windowMock;

  beforeEach(function() {
    broker = new Broker();
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    windowMock = new WindowMock();

    view = new View({
      broker,
      metrics,
      window: windowMock,
    });
  });

  afterEach(function() {
    return view.destroy();
  });

  describe('link conversion', () => {
    describe('broker does not support convertExternalLinksToText', function() {
      beforeEach(function() {
        return view.render();
      });

      it('does not convert any links', function() {
        assert.isFalse(view.$('#external-link').hasClass('visible-url'));
        assert.isFalse(view.$('#internal-link').hasClass('visible-url'));
      });
    });

    describe('broker supports convertExternalLinksToText', function() {
      beforeEach(function() {
        broker.setCapability('convertExternalLinksToText', true);
        return view.render();
      });

      it('converts external links, adding rel to links', function() {
        var $externalLink = view.$('#external-link');
        assert.isTrue($externalLink.hasClass('visible-url'));
        assert.equal(
          $externalLink.attr('data-visible-url'),
          $externalLink.attr('href')
        );
        assert.equal($externalLink.attr('rel'), 'noopener noreferrer');
      });

      it('does not convert internal links, does not add rel', function() {
        var $internalLink = view.$('#internal-link');
        assert.isFalse($internalLink.hasClass('visible-url'));
        assert.notEqual($internalLink.attr('rel'), 'noopener noreferrer');
      });

      it('does not convert if text and the href are the same', () => {
        assert.equal(
          typeof view.$('#data-visible-url-not-added').attr('data-visible-url'),
          'undefined'
        );
      });
    });

    it('uses opens external links in new tabs with about:accounts', () => {
      sinon.stub(broker.environment, 'isAboutAccounts').callsFake(function() {
        return true;
      });

      return view.render().then(function() {
        assert.equal(view.$('#external-link').attr('target'), '_blank');
      });
    });

    it('has no target attr if not about:accounts', () => {
      sinon.stub(broker.environment, 'isAboutAccounts').callsFake(function() {
        return false;
      });

      return view.render().then(function() {
        assert.notOk(view.$('#external-link').attr('target'));
      });
    });
  });

  describe('_onExternalLinkClick', () => {
    it('does nothing of the link is ignored', () => {
      sinon.stub(view, '_shouldIgnoreClick').callsFake(() => true);
      sinon
        .stub(view, '_flushMetricsThenRedirect')
        .callsFake(() => Promise.resolve());

      const event = {
        preventDefault: sinon.spy(),
        stopImmediatePropagation: sinon.spy(),
      };

      return view._onExternalLinkClick(event).then(() => {
        assert.isFalse(event.preventDefault.called);
        assert.isFalse(event.stopImmediatePropagation.called);
        assert.isFalse(view._flushMetricsThenRedirect.called);
      });
    });

    it('handles links that should be handled (cancel event, flush metrics)', () => {
      sinon.stub(view, '_shouldIgnoreClick').callsFake(() => false);
      sinon
        .stub(view, '_flushMetricsThenRedirect')
        .callsFake(() => Promise.resolve());

      const event = {
        currentTarget: {
          href: 'url',
        },
        preventDefault: sinon.spy(),
      };

      return view._onExternalLinkClick(event).then(() => {
        assert.isTrue(event.preventDefault.calledOnce);
        assert.isTrue(view._flushMetricsThenRedirect.calledOnce);
        assert.isTrue(view._flushMetricsThenRedirect.calledWith('url'));
      });
    });
  });

  describe('_shouldIgnoreClick', () => {
    it('returns `true` if event is modified or prevented', () => {
      sinon.stub(view, '_isEventModifiedOrPrevented').callsFake(() => true);
      sinon.stub(view, '_doesLinkOpenInAnotherTab').callsFake(() => false);
      const event = { currentTarget: {} };
      assert.isTrue(view._shouldIgnoreClick(event));
    });

    it('returns `true` if event opens in another tab', () => {
      sinon.stub(view, '_isEventModifiedOrPrevented').callsFake(() => false);
      sinon.stub(view, '_doesLinkOpenInAnotherTab').callsFake(() => true);
      const event = { currentTarget: {} };
      assert.isTrue(view._shouldIgnoreClick(event));
    });

    it('returns `false` otherwise', () => {
      sinon.stub(view, '_isEventModifiedOrPrevented').callsFake(() => false);
      sinon.stub(view, '_doesLinkOpenInAnotherTab').callsFake(() => false);
      const event = { currentTarget: {} };
      assert.isFalse(view._shouldIgnoreClick(event));
    });
  });

  describe('_isEventModifiedOrPrevented', () => {
    it('returns `true` if default is prevented', () => {
      const event = {
        altKey: false,
        ctlKey: false,
        isDefaultPrevented: () => true,
        metaKey: false,
        shiftKey: false,
      };

      assert.isTrue(view._isEventModifiedOrPrevented(event));
    });

    function testSpecialKeyDepressed(which) {
      const event = {
        altKey: false,
        ctlKey: false,
        isDefaultPrevented: () => false,
        metaKey: false,
        shiftKey: false,
        [which]: true,
      };

      assert.isTrue(view._isEventModifiedOrPrevented(event));
    }

    it('returns `true` if alt key is depressed', () => {
      testSpecialKeyDepressed('altKey');
    });

    it('returns `true` if ctrl key is depressed', () => {
      testSpecialKeyDepressed('ctrlKey');
    });

    it('returns `true` if meta key is depressed', () => {
      testSpecialKeyDepressed('metaKey');
    });

    it('returns `true` if shift key is depressed', () => {
      testSpecialKeyDepressed('shiftKey');
    });

    it('returns `false` otherwise', () => {
      const event = {
        altKey: false,
        ctlKey: false,
        isDefaultPrevented: () => false,
        metaKey: false,
        shiftKey: false,
      };

      assert.isFalse(view._isEventModifiedOrPrevented(event));
    });
  });

  describe('_doesLinkOpenInAnotherTab', () => {
    it('returns `true` if element has a `currentTarget`', () => {
      const $targetEl = {
        attr: () => '_blank',
      };

      assert.isTrue(view._doesLinkOpenInAnotherTab($targetEl));
    });

    it('returns `false` if element does not have a `currentTarget`', () => {
      const $targetEl = {
        attr: () => {},
      };

      assert.isFalse(view._doesLinkOpenInAnotherTab($targetEl));
    });
  });

  describe('_flushMetricsThenRedirect', () => {
    it('flushes the metrics, then redirects', () => {
      sinon.stub(metrics, 'flush').callsFake(() => Promise.resolve());

      return view._flushMetricsThenRedirect('url').then(() => {
        assert.isTrue(metrics.flush.calledOnce);
        assert.equal(windowMock.location, 'url');
      });
    });
  });
});
