/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('./error')
const P = require('./promise')

module.exports = (config, db) => {
  const configBounces = config.smtp && config.smtp.bounces || {}
  const BOUNCES_ENABLED = !! configBounces.enabled
  const MAX_HARD = configBounces.hard && configBounces.hard.max || 0
  const MAX_SOFT = configBounces.soft && configBounces.soft.max || 0
  const MAX_COMPLAINT = configBounces.complaint && configBounces.complaint.max || 0
  const DURATION_HARD = configBounces.hard && configBounces.hard.duration || Infinity
  const DURATION_SOFT = configBounces.soft && configBounces.soft.duration || Infinity
  const DURATION_COMPLAINT = configBounces.complaint && configBounces.complaint.duration || Infinity
  const BOUNCE_TYPE_HARD = 1
  const BOUNCE_TYPE_SOFT = 2
  const BOUNCE_TYPE_COMPLAINT = 3

  const freeze = Object.freeze
  const BOUNCE_RULES = freeze({
    [BOUNCE_TYPE_HARD]: freeze({
      duration: DURATION_HARD,
      error: error.emailBouncedHard,
      max: MAX_HARD
    }),
    [BOUNCE_TYPE_COMPLAINT]: freeze({
      duration: DURATION_COMPLAINT,
      error: error.emailComplaint,
      max: MAX_COMPLAINT
    }),
    [BOUNCE_TYPE_SOFT]: freeze({
      duration: DURATION_SOFT,
      error: error.emailBouncedSoft,
      max: MAX_SOFT
    })
  })

  function checkBounces(email) {
    return db.emailBounces(email)
      .then(bounces => {
        const counts = {
          [BOUNCE_TYPE_HARD]: 0,
          [BOUNCE_TYPE_COMPLAINT]: 0,
          [BOUNCE_TYPE_SOFT]: 0
        }
        const now = Date.now()
        bounces.forEach(bounce => {
          const type = bounce.bounceType
          const ruleSet = BOUNCE_RULES[type]
          if (ruleSet) {
            if (bounce.createdAt > now - ruleSet.duration) {
              counts[type]++
              if (counts[type] > ruleSet.max) {
                throw ruleSet.error()
              }
            }
          }
        })
      })
  }

  function disabled() {
    return P.resolve()
  }

  return {
    check: BOUNCES_ENABLED ? checkBounces : disabled
  }
}
