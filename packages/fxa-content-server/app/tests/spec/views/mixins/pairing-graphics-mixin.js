/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const BaseView = require('views/base');
const Cocktail = require('cocktail');
const PairingGraphicsMixin = require('views/mixins/pairing-graphics-mixin');
const sinon = require('sinon');

const View = BaseView.extend({});

Cocktail.mixin(
  View,
  PairingGraphicsMixin
);

describe('views/mixins/pairing-graphics-mixin', function () {
  let view;

  beforeEach(() => {
    view = new View({});
  });

  describe('getGraphicsId', () => {
    it('returns `graphic-connect-another-device` if SvgTransformOrigin not supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          supportsSvgTransformOrigin: () => false
        };
      });
      assert.equal(view.getGraphicsId(), 'graphic-connect-another-device');
    });

    it('returns `graphic-connect-another-device-hearts` if SvgTransformOrigin supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          supportsSvgTransformOrigin: () => true
        };
      });
      assert.equal(view.getGraphicsId(), 'graphic-connect-another-device-hearts');
    });
  });
});
