/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

// All rules are auto-loaded into this module.

const fs = require('fs')
const path = require('path')

fs.readdirSync(__dirname).forEach(name => {
  if (name !== 'index.js') {
    exports[name.substr(0, name.length - 3)] = require(path.join(__dirname, name))
  }
})
