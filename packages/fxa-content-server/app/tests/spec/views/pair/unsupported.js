/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import View from 'views/pair/unsupported';
import sinon from 'sinon';
import GleanMetrics from '../../../../scripts/lib/glean';

describe('views/pair/unsupported', () => {
  let view, desktopNonFirefoxViewEventStub, viewEventStub;

  beforeEach(() => {
    initView();
    viewEventStub = sinon.stub(GleanMetrics.cadMobilePairUseAppView, 'view');
    desktopNonFirefoxViewEventStub = sinon.stub(
      GleanMetrics.cadRedirectDesktop,
      'view'
    );
  });

  afterEach(function () {
    view.destroy();
    viewEventStub.restore();
    desktopNonFirefoxViewEventStub.restore();
  });

  function initView() {
    view = new View({
      viewName: 'pairUnsupported',
    });
  }

  describe('isDesktopNonFirefox is false', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => false,
          isFirefox: () => true,
          isIos: () => false,
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
    });
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(
          view.$el.find('#pair-unsupported-header').text(),
          'Pair using an app'
        );
        assert.ok(view.$el.find('.bg-image-pair-fail').length);
      });
    });

    describe('glean metrics', () => {
      it('logs a view Glean metrics event', () => {
        view.logView();
        return view.render().then(() => {
          sinon.assert.calledOnce(viewEventStub);
          sinon.assert.notCalled(desktopNonFirefoxViewEventStub);
        });
      });
    });
  });

  describe('isDesktopNonFirefox is true', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => false,
          isFirefox: () => false,
          isIos: () => false,
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
    });
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(
          view.$el.find('#pair-unsupported-header').text(),
          'Oops! It looks like you’re not using Firefox.'
        );
        assert.ok(view.$el.find('.bg-no-ff-desktop').length);
      });
    });

    describe('glean metrics', () => {
      let downloadEventStub;
      beforeEach(() => {
        downloadEventStub = sinon.stub(
          GleanMetrics.cadRedirectDesktop,
          'download'
        );
      });
      afterEach(() => {
        downloadEventStub.restore();
      });

      it('logs a view Glean metrics event', () => {
        view.logView();
        return view.render().then(() => {
          sinon.assert.calledOnce(desktopNonFirefoxViewEventStub);
          sinon.assert.notCalled(viewEventStub);
        });
      });

      it('logs a download engage Glean metrics event', () => {
        return view.render().then(() => {
          assert.equal(
            view.$('#download-firefox').attr('href'),
            'https://www.mozilla.org/firefox/new/'
          );
          view.$('#download-firefox').click();
          sinon.assert.calledOnce(downloadEventStub);
        });
      });
    });
  });
});
