/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * Read an array of user records from `userRecordsPath`
 *
 * @param {String} userRecordsPath JSON file that contains user records
 * @returns {Promise} resolves to an array of user records when complete
 */
module.exports = async function readUserRecords(userRecordsPath) {
  const records = require(userRecordsPath);

  if (!records || !records.length) {
    throw new Error('No records found');
  }

  return records;
};
