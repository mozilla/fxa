/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import PairingGraphicsMixin from 'views/mixins/pairing-graphics-mixin';
import sinon from 'sinon';

const View = BaseView.extend({});

Cocktail.mixin(View, PairingGraphicsMixin);

describe('views/mixins/pairing-graphics-mixin', function () {
  let view;

  beforeEach(() => {
    view = new View({});
  });

  describe('getGraphicsId', () => {
    it('returns `bg-image-cad` if SvgTransformOrigin not supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          supportsSvgTransformOrigin: () => false,
        };
      });
      assert.equal(view.getGraphicsId(), 'bg-image-cad');
    });

    it('returns `bg-image-triple-device-hearts` if SvgTransformOrigin supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          supportsSvgTransformOrigin: () => true,
        };
      });
      assert.equal(view.getGraphicsId(), 'bg-image-triple-device-hearts');
    });
  });

  describe('showDownloadFirefoxQrCode', () => {
    it('returns true if entry point is app menu', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'fxa_app_menu');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns true if entry point is preferences', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'preferences');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns true if entry point is synced-tabs', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'synced-tabs');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns true if entry point is side-bar', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'tabs-sidebar');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns true if entry point is fx-view', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'fx-view');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns true if entry point is fxa_discoverability_native', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'fx-view');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns false if entry point is not app menu', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => undefined);
      assert.equal(view.showDownloadFirefoxQrCode(), false);
    });
  });
});
