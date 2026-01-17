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
  const BOUNCES_ALIAS_CHECK_ENABLED = !!configBounces.aliasCheckEnabled;

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

    let bounces;

    if (BOUNCES_ALIAS_CHECK_ENABLED) {
      bounces = await checkBouncesWithAliases(email);
    } else {
      bounces = await db.emailBounces(email);
    }

    return applyRules(bounces);
  }

  async function checkBouncesWithAliases(email) {
    // Given an email alias like test+123@domain.com:
    // We look for bounces to the 'root' email -> `test@domain.com`
    // And look for bounces to the alias with a wildcard -> `test+%@domain.com`
    //
    // This prevents us from picking up false positives when we replace the alias
    // with a wildcard, and doesn't miss the root email bounces either. We have to
    // use both because just using the wildcard would miss bounces sent to the root
    // and just using the root with a wildcard would pickup false positives.
    //
    // So, test+123@domain.com would match:
    //   - test@domain.com            Covered by normalized email
    //   - test+123@domain.com        Covered by wildcard email
    //   - test+asdf@domain.com       Covered by wildcard email
    // but not
    //   - testing@domain.com         Not picked up by wildcard since we include the '+'
    const normalizedEmail = emailNormalization.normalizeEmailAliases(email, '');
    const wildcardEmail = emailNormalization.normalizeEmailAliases(email, '+%');

    const [normalizedBounces, wildcardBounces] = await Promise.all([
      db.emailBounces(normalizedEmail),
      db.emailBounces(wildcardEmail),
    ]);

    // Merge and deduplicate by email+createdAt
    // there shouldn't be any overlap, but just in case
    const seen = new Set();
    const merged = [...normalizedBounces, ...wildcardBounces].filter(
      (bounce) => {
        const key = `${bounce.email}:${bounce.createdAt}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      }
    );

    return merged.sort((a, b) => b.createdAt - a.createdAt);
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
