/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A dropin replacement for Cocktail that ensure any of a mixin's
 * dependencies are also mixed in.
 *
 * A mixin that declares `dependsOn` will have all dependencies
 * mixed in beforehand.
 *
 * NOTE: This does not check for circular dependencies. We depend on
 * the fact that mixins are in their own module and require might complain
 * about circular dependencies.
 */

import Cocktail from 'cocktail-lib';
import _ from 'underscore';

function mixin(target, ...mixins) {
  Cocktail.mixin(target, ...getAllMixins(mixins));
}

function getAllMixins(mixins) {
  // The approach - generate a big list, possibly with duplicates.
  // Deduplicate as a final step.
  return _.uniq(
    mixins.reduce((accumulator, mixin) => {
      if (mixin.dependsOn) {
        accumulator.push(...getAllMixins(mixin.dependsOn));
      }
      accumulator.push(mixin);

      return accumulator;
    }, [])
  );
}

/**
 * Check if `mixin` is mixed into `target` by checking
 * whether `target` contains all of the properties/methods
 * of `mixin`. Not foolproof, if `mixin` contains only
 * properties and `target` already has all the properties,
 * then `true` will be returned even if `target`s properties
 * are not the same as `mixin`s properties.
 *
 * @param {Object} target
 * @param {Object} mixin
 * @returns {Boolean}
 */
function isMixedIn(target, mixin) {
  return _.every(Object.keys(mixin), (key) => key in target);
}

export default {
  isMixedIn,
  mixin,
};
