/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import View from 'views/pair/unsupported';
import sinon from 'sinon';
import GleanMetrics from '../../../../scripts/lib/glean';

describe('views/pair/unsupported', () => {
  let view,
    cadRedirectDesktopViewEventStub,
    cadMobilePairUseAppViewEventStub,
    cadRedirectMobileViewEventStub,
    cadRedirectDesktopDefaultViewEventStub;

  beforeEach(() => {
    initView();
    cadMobilePairUseAppViewEventStub = sinon.stub(
      GleanMetrics.cadMobilePairUseAppView,
      'view'
    );
    cadRedirectDesktopViewEventStub = sinon.stub(
      GleanMetrics.cadRedirectDesktop,
      'view'
    );
    cadRedirectMobileViewEventStub = sinon.stub(
      GleanMetrics.cadRedirectMobile,
      'view'
    );
    cadRedirectDesktopDefaultViewEventStub = sinon.stub(
      GleanMetrics.cadRedirectDesktop,
      'defaultView'
    );
  });

  afterEach(function () {
    view.destroy();
    cadMobilePairUseAppViewEventStub.restore();
    cadRedirectDesktopViewEventStub.restore();
    cadRedirectMobileViewEventStub.restore();
    cadRedirectDesktopDefaultViewEventStub.restore();
  });

  function initView() {
    view = new View({
      viewName: 'pairUnsupported',
    });
  }

  describe('isSystemCameraUrl is true', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => false,
          isFirefox: () => true,
          isIos: () => true,
          isMobile: () => true,
        };
      });
      sinon.stub(view, 'getHashParams').callsFake(() => {
        return {
          channel_id: {},
          channel_key: {},
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
      view.getHashParams.restore();
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
          sinon.assert.calledOnce(cadMobilePairUseAppViewEventStub);
          sinon.assert.notCalled(cadRedirectMobileViewEventStub);
        });
      });
    });
  });
  describe('isMobile, isFirefox, isSystemCameraUrl is false', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => false,
          isFirefox: () => true,
          isIos: () => true,
          isMobile: () => true,
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
    });
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(view.$el.find('.bg-image-triple-device-hearts').length);
        assert.ok(
          view.$el.find('h1').text(),
          'Connecting your mobile device with your Mozilla account'
        );
        assert.ok(
          Array.from(view.el.querySelectorAll('p')).some((p) =>
            p.textContent.includes('Open Firefox on your computer, visit')
          )
        );
        assert.lengthOf(view.$el.find('.bg-icon-warning'), 0);
        assert.equal(
          view
            .$('[data-glean-id="cad_redirect_mobile_learn_more"]')
            .attr('href'),
          'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer'
        );
      });
    });

    describe('glean metrics', () => {
      it('logs a view Glean metrics event', () => {
        return view.render().then(() => {
          sinon.assert.calledOnce(cadRedirectMobileViewEventStub);
          sinon.assert.notCalled(cadMobilePairUseAppViewEventStub);
        });
      });
    });
  });
  describe('isMobile, isFirefox is false, isSystemCameraUrl is false', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => true,
          isFirefox: () => false,
          isIos: () => false,
          isMobile: () => true,
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
    });
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(view.$el.find('.bg-image-triple-device-hearts').length);
        assert.ok(view.$el.find('h1').text(), 'Connect another device');
        assert.ok(
          Array.from(view.el.querySelectorAll('p')).some((p) =>
            p.textContent.includes(
              'Oops! It looks like you’re not using Firefox.'
            )
          )
        );
        assert.lengthOf(view.$el.find('.bg-icon-warning'), 1);
        assert.equal(
          view.$('[data-glean-id="cad_redirect_mobile_download"]').attr('href'),
          'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mozilla.firefox'
        );
      });
    });

    describe('glean metrics', () => {
      it('logs a view Glean metrics event', () => {
        return view.render().then(() => {
          sinon.assert.calledOnce(cadRedirectMobileViewEventStub);
          sinon.assert.notCalled(cadMobilePairUseAppViewEventStub);
        });
      });
    });
  });
  describe('desktop default view (isDesktopNonFirefox is false)', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => false,
          isFirefox: () => true,
          isIos: () => false,
          isMobile: () => false,
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
    });
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(view.$el.find('.bg-image-pair-fail').length);
        assert.ok(view.$el.find('h1').text(), 'Connect another device');
        assert.ok(view.$el.find('h2').text(), 'Oops! Something went wrong.');
        assert.lengthOf(view.$el.find('.bg-icon-warning'), 0);
      });
    });

    describe('glean metrics', () => {
      it('logs a view Glean metrics event', () => {
        view.logView();
        return view.render().then(() => {
          sinon.assert.calledOnce(cadRedirectDesktopDefaultViewEventStub);
          sinon.assert.notCalled(cadRedirectDesktopViewEventStub);
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
          isMobile: () => false,
        };
      });
    });
    afterEach(function () {
      view.getUserAgent.restore();
    });
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(view.$el.find('h1').text(), 'Connect another device');
        assert.ok(
          view.$el.find('h2').text(),
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
          sinon.assert.calledOnce(cadRedirectDesktopViewEventStub);
          sinon.assert.notCalled(cadMobilePairUseAppViewEventStub);
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
