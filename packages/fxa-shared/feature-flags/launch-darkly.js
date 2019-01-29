/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = initialise;

/**
 * Initialise the LaunchDarkly implementation.
 *
 * @param {Object} config
 * @param {Object} log
 *
 * @returns {FeatureFlags}
 */
function initialise () {

  // TODO: flesh out implementation

  /**
   * @typedef {Object} FeatureFlags
   *
   * @property {Function} get
   */
  return { get };

  /**
   * Get the current state for all experiments.
   *
   * @returns {Promise}
   */
  function get () {
    return Promise.reject(new Error('Not implemented'));
  }
}
