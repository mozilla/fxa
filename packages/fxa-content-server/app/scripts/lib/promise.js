/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default {
  /**
   * Return a promise that resolves after `delayMS`.
   *
   * @param {Number} delayMS
   * @returns {Promise}
   */
  delay(delayMS) {
    return new Promise((resolve) => {
      setTimeout(resolve, delayMS);
    });
  },

  /**
   * Convert `callback` that expects arguments using NodeJS conventions
   * to return a Promise.
   *
   * @param {Function} callback that expects arguments using NodeJS conventions
   * @returns {Function} replacement callback that returns a Promise
   */
  denodeify(callback) {
    return function (...args) {
      return new Promise((resolve, reject) => {
        callback(...args, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    };
  },
};
