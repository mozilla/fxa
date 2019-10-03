/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const SALT_SIZE = 16;
const SALT_STRING_LENGTH = SALT_SIZE * 2;

module.exports = {
  /**
   * Create flow data.
   *
   * @param key String
   * @param userAgent String
   * @returns {{flowBeginTime: number, flowId: string}}
   */
  create(key, userAgent) {
    const salt = crypto.randomBytes(SALT_SIZE).toString('hex');
    return createFlowEventData(key, salt, Date.now());
  },

  /**
   * Check whether a flowId is valid.
   *
   * @param key String
   * @param flowId String
   * @param flowBeginTime Number
   * @returns Boolean
   */
  validate(key, flowId, flowBeginTime) {
    const salt = flowId.substr(0, SALT_STRING_LENGTH);
    const expected = createFlowEventData(key, salt, flowBeginTime);

    return getFlowSignature(flowId) === getFlowSignature(expected.flowId);
  },
};

function createFlowEventData(key, ...data) {
  const [salt, flowBeginTime] = data;
  data[1] = flowBeginTime.toString(16);

  // Incorporate a hash of request metadata into the flow id,
  // so that receiving servers can cross-check the metrics bundle.
  const flowSignature = crypto
    .createHmac('sha256', key)
    .update(data.join('\n'))
    .digest('hex')
    .substr(0, SALT_STRING_LENGTH);

  return {
    flowBeginTime,
    flowId: salt + flowSignature,
  };
}

function getFlowSignature(flowId) {
  return flowId.substr(SALT_STRING_LENGTH);
}
