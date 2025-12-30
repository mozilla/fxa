/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError: error } = require('@fxa/accounts/errors');
const { EmailNormalization } = require('fxa-shared/email/email-normalization');

module.exports = (config, db) => {
  const configBounces = (config.smtp && config.smtp.bounces) || {};
  const ignoreTemplates = configBounces.ignoreTemplates || [];
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

  const emailNormalization = new EmailNormalization(
    configBounces.emailAliasNormalization
  );

  async function checkBounces(email, template) {
    if (ignoreTemplates.includes(template)) {
      return;
    }

    // This strips out 'alias' stuff from an email and replace
    // them with wildcards, allowing us to turn up bounce records
    // on email aliases.
    const normalizedEmail = emailNormalization.normalizeEmailAliases(
      email,
      '%'
    );
    const bounces = await db.emailBounces(normalizedEmail);
    return applyRules(bounces);
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

    bounces.forEach((bounce) => {
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
    return tallies;
  }

  function disabled() {
    return Promise.resolve();
  }

  return {
    check: BOUNCES_ENABLED ? checkBounces : disabled,
  };
};
