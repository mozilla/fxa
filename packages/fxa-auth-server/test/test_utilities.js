const crypto = require('crypto');
const config = require('../config').default.getProperties();


const TestUtilities = {};

/**
 * Generate a unique email address for testing, optionally with a specified domain.
 * If a domain is not provided, it defaults to '@restmail.net'.
 * The generated email will have a random base string and may include a prefix
 * to bypass customs checks if `config.enableCustomsChecks` is true.
 * @param {*} domain
 * @param {*} config
 * @returns
 */
TestUtilities.uniqueEmail = function (domain, configOverride) {
  const cfg = configOverride || config;
  if (!domain) {
    domain = '@restmail.net';
  }
  const base = crypto.randomBytes(10).toString('hex');

  // The enable_customs_ prefix will skip the 'isAllowedEmail' check in customs
  // that is typically used to by pass customs during testing... This can
  // be useful if a test that expects customs to activate is run.
  const prefix = cfg.enableCustomsChecks ? 'enable_customs_' : '';
  return `${prefix}${base}${domain}`;
};

TestUtilities.uniqueUnicodeEmail = function () {
  return `${
    crypto.randomBytes(10).toString('hex') + String.fromCharCode(1234)
  }@${String.fromCharCode(5678)}restmail.net`;
};

module.exports = { TestUtilities }
