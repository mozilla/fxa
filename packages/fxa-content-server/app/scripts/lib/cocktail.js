/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A dropin replacement for Cocktail that ensure any of a mixin's
 * dependencies are also mixed in.
 *
 * A mixin that delcares `dependsOn` will have all dependencies
 * mixed in beforehand.
 *
 * NOTE: This does not check for circular dependencies. We depend on
 * the fact that mixins are in their own module and requirejs complains
 * about circular dependencies.
 */
define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail-lib');
  const _ = require('underscore');

  function mixin (target, ...mixins) {
    Cocktail.mixin(target, ...getAllMixins(mixins));
  }

  function getAllMixins(mixins) {
    // The approach - generate a big list, possibly with duplicates.
    // Deduplicate as a final step.
    return _.uniq(mixins.reduce((accumulator, mixin) => {
      if (mixin.dependsOn) {
        accumulator.push(...getAllMixins(mixin.dependsOn));
      }
      accumulator.push(mixin);

      return accumulator;
    }, []));
  }

  module.exports = {
    mixin
  };
});
