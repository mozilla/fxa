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

    it('returns `bg-image-cad-hearts` if SvgTransformOrigin supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          supportsSvgTransformOrigin: () => true,
        };
      });
      assert.equal(view.getGraphicsId(), 'bg-image-cad-hearts');
    });
  });

  describe('showDownloadFirefoxQrCode', () => {
    it('returns true if entry point is app menu', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => 'fxa_app_menu');
      assert.equal(view.showDownloadFirefoxQrCode(), true);
    });

    it('returns false if entry point is not app menu', () => {
      sinon.stub(view, 'getSearchParam').callsFake(() => undefined);
      assert.equal(view.showDownloadFirefoxQrCode(), false);
    });
  });
});
