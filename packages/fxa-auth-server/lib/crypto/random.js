/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const randomBytes = require('../promise').promisify(require('crypto').randomBytes)

function random(bytes) {
  if (arguments.length > 1) {
    bytes = Array.from(arguments)
    const sum = bytes.reduce((acc, val) => acc + val, 0)
    return randomBytes(sum).then(buf => {
      let pos = 0
      return bytes.map(num => {
        const slice = buf.slice(pos, pos + num)
        pos += num
        return slice
      })
    })
  } else {
    return randomBytes(bytes)
  }
}

random.hex = function hex() {
  return random.apply(null, arguments).then(bufs => {
    if (Array.isArray(bufs)) {
      return bufs.map(buf => buf.toString('hex'))
    } else {
      return bufs.toString('hex')
    }
  })
}

module.exports = random
