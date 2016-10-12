/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const crypto = require('crypto')

function base36(len) {
  let out = []
  while (out.length < len) {
    let rand = crypto.randomBytes(len)
    let randLen = rand.length
    for (let i = 0; i < randLen; i++) {
      let b = rand[i]
      // 252-256 skews the base36 distribution, so skip those bytes
      if (b < 252) {
        out.push((b % 36).toString(36))
        if (out.length === len) {
          break
        }
      }
    }
  }
  return out.join('').toUpperCase()
}

module.exports = (len) => {
  return () => {
    return base36(len)
  }
}
