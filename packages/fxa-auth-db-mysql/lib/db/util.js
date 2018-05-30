/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const crypto = require('crypto')
const P = require('../promise')
const randomBytes = P.promisify(require('crypto').randomBytes)
const scryptHash = P.promisify(require('scrypt-hash'))

const BOUNCE_TYPES = new Map([
  ['__fxa__unmapped', 0], // a bounce type we don't yet recognize
  ['Permanent', 1], // Hard
  ['Transient', 2], // Soft
  ['Complaint', 3]  // Complaint
])

const BOUNCE_SUB_TYPES = new Map([
  ['__fxa__unmapped', 0], // a bounce type we don't yet recognize
  ['Undetermined', 1],
  ['General', 2],
  ['NoEmail', 3],
  ['Suppressed', 4],
  ['MailboxFull', 5],
  ['MessageTooLarge', 6],
  ['ContentRejected', 7],
  ['AttachmentRejected', 8],
  ['abuse', 9],
  ['auth-failure', 10],
  ['fraud', 11],
  ['not-spam', 12],
  ['other', 13],
  ['virus', 14]
])

const VERIFICATION_METHODS = new Map([
  ['email', 0],     // sign-in confirmation email link
  ['email-2fa', 1], // sign-in confirmation email code (token code)
  ['totp-2fa', 2],   // TOTP code
  ['recovery-code', 3]   // Recovery code
])

// If you modify one of these maps, modify the other.
const DEVICE_CAPABILITIES = new Map([
  ['messages', 1],
  ['messages.sendtab', 2]
])
const DEVICE_CAPABILITIES_IDS = new Map([
  [1, 'messages'],
  [2, 'messages.sendtab']
])

module.exports = {

  mapDeviceCapability(val) {
    if (typeof val === 'number') {
      return DEVICE_CAPABILITIES_IDS.get(val) || null
    } else {
      return DEVICE_CAPABILITIES.get(val) || null
    }
  },

  mapEmailBounceType(val) {
    if (typeof val === 'number') {
      return val
    } else {
      return BOUNCE_TYPES.get(val) || 0
    }
  },

  mapEmailBounceSubType(val) {
    if (typeof val === 'number') {
      return val
    } else {
      return BOUNCE_SUB_TYPES.get(val) || 0
    }
  },

  mapVerificationMethodType(val) {
    if (typeof val === 'number') {
      return val
    } else {
      return VERIFICATION_METHODS.get(val) || undefined
    }
  },

  createHash () {
    const hash = crypto.createHash('sha256')
    const args = [...arguments]
    args.forEach((arg) => {
      hash.update(arg)
    })
    return hash.digest()
  },

  createHashScrypt(input) {
    // Creates an scrypt hash from string input with a randomly generated
    // salt. This matches process on auth-server.
    let salt
    return randomBytes(32)
      .then((result) => {
        salt = result
        const inputBuffer = Buffer.from(input)
        return scryptHash(inputBuffer, salt, 65536, 8, 1, 32)
          .then((hash) => {
            return {hash, salt}
          })
      })
  },

  compareHashScrypt(input, verifyHash, salt) {
    const inputBuffer = Buffer.from(input)
    return scryptHash(inputBuffer, salt, 65536, 8, 1, 32)
      .then((hash) => crypto.timingSafeEqual(hash, verifyHash))
  },

  generateRecoveryCodes(count, keyspace, length) {
    const randomByteCodes = []
    for (let i = 0; i < count; i++) {
      randomByteCodes.push(randomBytes(length))
    }

    return P.all(randomByteCodes)
      .then((result) => {
        return result.map((randomCode) => {
          const charsLength = keyspace.length
          const result = []
          let currentIndex = 0
          for (let i = 0; i < 10; i++) {
            currentIndex += randomCode[i]
            result[i] = keyspace[currentIndex % charsLength]
          }
          return result.join('')
        })
      })
  }
}
