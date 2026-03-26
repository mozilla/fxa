/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const defaultConnectionMethods = {
  connect(callback) {
    return callback();
  },
  query() {
    throw new Error('query() should not have been called');
  },
  changeUser(opts, callback) {
    return callback();
  },
  end(callback) {
    return callback();
  },
};

export default function mockMySQL(mockMethods) {
  return {
    createConnection() {
      return { ...defaultConnectionMethods, ...mockMethods };
    },
  };
}
