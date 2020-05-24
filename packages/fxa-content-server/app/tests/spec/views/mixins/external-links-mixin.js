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

describe('views/mixins/external-links-mixin', function () {
  let broker;
  let metrics;
  let notifier;
  let view;
  let windowMock;

  beforeEach(function () {
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

  afterEach(function () {
    return view.destroy();
  });

  describe('_onExternalLinkClick', () => {
    it('does nothing of the link is ignored', () => {
      sinon.stub(view, '_shouldIgnoreClick').callsFake(() => true);
      sinon.stub(view, 'navigateAway');

      const event = {
        preventDefault: sinon.spy(),
        stopImmediatePropagation: sinon.spy(),
      };

      view._onExternalLinkClick(event);
      assert.isFalse(event.preventDefault.called);
      assert.isFalse(event.stopImmediatePropagation.called);
      assert.isFalse(view.navigateAway.called);
    });

    it('handles links that should be handled (cancel event, flush metrics)', () => {
      sinon.stub(view, '_shouldIgnoreClick').callsFake(() => false);
      sinon.stub(view, 'navigateAway');

      const event = {
        currentTarget: {
          href: 'url',
        },
        preventDefault: sinon.spy(),
      };

      view._onExternalLinkClick(event);
      assert.isTrue(event.preventDefault.calledOnce);
      assert.isTrue(view.navigateAway.calledOnceWith('url'));
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
});
