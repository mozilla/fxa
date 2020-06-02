/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(
  mc,
  reputationService,
  limits,
  recordLifetimeSeconds
) {
  const IpEmailRecord = require('./ip_email_record')(limits);
  const EmailRecord = require('./email_record')(limits);
  const IpRecord = require('./ip_record')(limits);
  const UidRecord = require('./uid_record')(limits);
  const SmsRecord = require('./sms_record')(limits);

  /**
   * Fetch a single record keyed by `key`, parse the result using `parser`.
   *
   * @param {String} key
   * @param {Function} parser
   * @returns {Promise} resolves to a Record when complete
   */
  async function fetchRecord(key, parser) {
    const record = await mc.getAsync(key).then(parser, parser);
    record.key = key;
    return record;
  }

  /**
   * Fetch a set of records
   *
   * @param {Object} config
   *  @param {String} [object.ip] ip address to fetch
   *  @param {String} [object.email] email address to fetch
   *  @param {String} [object.phoneNumber] phone number to fetch
   *  @param {String} [object.uid] uid to fetch
   * @returns {Promise} resolves to an object with the following keys:
   *  `ipRecord`, `reputation`, `emailRecord`, `ipEmailRecord`, `smsRecord`, and `uidRecord`
   */
  async function fetchRecords(config) {
    const records = {};

    const { ip, email, phoneNumber, uid } = config;

    if (ip) {
      records.ipRecord = await fetchRecord(ip, IpRecord.parse);
      records.reputation = await reputationService.get(ip);
    }

    // The /checkIpOnly endpoint has no email (or phoneNumber)
    if (email) {
      records.emailRecord = await fetchRecord(email, EmailRecord.parse);
    }

    if (ip && email) {
      records.ipEmailRecord = await fetchRecord(
        ip + email,
        IpEmailRecord.parse
      );
    }

    // Check against SMS records to make sure that this request can send to this phone number
    if (phoneNumber) {
      records.smsRecord = await fetchRecord(phoneNumber, SmsRecord.parse);
    }

    if (uid) {
      records.uidRecord = await fetchRecord(uid, UidRecord.parse);
    }

    return records;
  }

  /**
   * Save a record
   *
   * @param {Record} record
   * @returns
   */
  function setRecord(record) {
    // don't set 'reputations' from reputationSevice
    if (record && record.getMinLifetimeMS) {
      const lifetime = Math.max(
        recordLifetimeSeconds,
        record.getMinLifetimeMS() / 1000
      );
      return mc.setAsync(
        record.key,
        marshallRecordForStorage(record),
        lifetime
      );
    }
  }

  /**
   * Marshall a record for persistent storage
   *
   * @param {Record} record
   * @returns {Object}
   */
  function marshallRecordForStorage(record) {
    const marshalled = {};

    for (const key of Object.keys(record)) {
      if (key !== 'key' && typeof record[key] !== 'function') {
        marshalled[key] = record[key];
      }
    }

    return marshalled;
  }

  /**
   * Save records
   *
   * @param {Record[]} records to save.
   * @returns {Promise} Resolves when complete
   */
  function setRecords(...records) {
    return Promise.all(records.map(record => setRecord(record)));
  }

  return {
    fetchRecord,
    fetchRecords,
    setRecord,
    setRecords,
  };
};
