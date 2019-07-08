/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('./error');
const P = require('./promise');

module.exports = (config, db) => {
  const configBounces = (config.smtp && config.smtp.bounces) || {};
  const BOUNCES_ENABLED = !!configBounces.enabled;

  const BOUNCE_TYPE_HARD = 1;
  const BOUNCE_TYPE_SOFT = 2;
  const BOUNCE_TYPE_COMPLAINT = 3;

  const freeze = Object.freeze;
  const BOUNCE_RULES = freeze({
    [BOUNCE_TYPE_HARD]: freeze(configBounces.hard || {}),
    [BOUNCE_TYPE_SOFT]: freeze(configBounces.soft || {}),
    [BOUNCE_TYPE_COMPLAINT]: freeze(configBounces.complaint || {}),
  });

  const ERRORS = {
    [BOUNCE_TYPE_HARD]: error.emailBouncedHard,
    [BOUNCE_TYPE_SOFT]: error.emailBouncedSoft,
    [BOUNCE_TYPE_COMPLAINT]: error.emailComplaint,
  };

  function checkBounces(email) {
    return db.emailBounces(email).then(applyRules);
  }

  // Relies on the order of the bounces array to be sorted by date,
  // descending. So, each bounce in the array must be older than the
  // previous.
  function applyRules(bounces) {
    const tallies = {
      [BOUNCE_TYPE_HARD]: {
        count: 0,
        latest: 0,
      },
      [BOUNCE_TYPE_COMPLAINT]: {
        count: 0,
        latest: 0,
      },
      [BOUNCE_TYPE_SOFT]: {
        count: 0,
        latest: 0,
      },
    };
    const now = Date.now();

    bounces.forEach(bounce => {
      const type = bounce.bounceType;
      const ruleSet = BOUNCE_RULES[type];
      if (ruleSet) {
        const tally = tallies[type];
        const tier = ruleSet[tally.count];
        if (!tally.latest) {
          tally.latest = bounce.createdAt;
        }
        if (tier && bounce.createdAt > now - tier) {
          throw ERRORS[type](tally.latest);
        }
        tally.count++;
      }
    });
  }

  function disabled() {
    return P.resolve();
  }

  return {
    check: BOUNCES_ENABLED ? checkBounces : disabled,
  };
};
