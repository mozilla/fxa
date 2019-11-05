/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(config, fetchRecord, setRecords) {
  const Record = require('./record');
  const utils = require('./utils');

  const configuredRules = config.userDefinedRateLimitRules || {};
  // Pre compute user defined rules into a Map<action, array of rule name>
  const computedRules = new Map();

  Object.keys(configuredRules).forEach(key => {
    configuredRules[key].actions.forEach(action => {
      const items = computedRules.get(action);
      if (! items) {
        computedRules.set(action, [key]);
      } else {
        computedRules.set(action, items.push(key));
      }
    });
  });

  return async function checkUserDefinedRateLimitRules(
    result,
    action,
    email,
    ip
  ) {
    // Get all the user defined rules that might apply to this action
    const checkRules = computedRules.get(action);

    // No need to check if no user defined rules
    if (! checkRules || checkRules.length <= 0) {
      return result;
    }

    const retries = [];
    await Promise.all(
      checkRules.map(async ruleName => {
        const recordKey = ruleName + ':' + utils.createHashHex(email, ip);
        const record = await fetchRecord(
          recordKey,
          object => new Record(object, configuredRules[ruleName])
        );
        retries.push(record.update(action));

        await setRecords(record);
      })
    );

    const maxRetry = Math.max(retries);
    const block = maxRetry > 0;
    const retryAfter = maxRetry || 0;

    // Only update the retryAfter if it has a larger rate limit
    if (retryAfter && retryAfter > result.retryAfter) {
      result.retryAfter = retryAfter;
      result.block = block;
    }

    return result;
  };
};
