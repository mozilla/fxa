/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

module.exports = {
  extends: 'plugin:fxa/recommended',

  env: {
    amd: true, // defines require() and define() as global variables as per the amd spec
    browser: true, // browser global variables
    mocha: true // adds all of the Mocha testing global variables
  },

  rules: {
    'camelcase': 2,
    'id-blacklist': [2, 'self'],
    'strict': [2, 'function']
  }
}
