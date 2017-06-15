/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Experiment = require('lib/experiments/grouping-rules/sessions');

  describe('lib/experiments/grouping-rules/sessions', () => {
    let experiment;

    before(() => {
      experiment = new Experiment();
    });

    it('exposes MIN_FIREFOX_VERSION', () => {
      assert.equal(experiment.MIN_FIREFOX_VERSION, 53);
    });

    describe('choose', () => {
      it('returns true if >= Fx 53', () => {
        assert.isFalse(experiment.choose({ firefoxVersion: experiment.MIN_FIREFOX_VERSION - 1 }));
        assert.isTrue(experiment.choose({ firefoxVersion: experiment.MIN_FIREFOX_VERSION }));
        assert.isTrue(experiment.choose({ firefoxVersion: experiment.MIN_FIREFOX_VERSION + 1 }));
      });
    });
  });
});
