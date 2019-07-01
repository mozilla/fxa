/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Listens for events from the DataFlow fraud detection pipeline.
 *
 * Events currently are only logged to ensure the PubSub subscription
 * is connected and events are being received as expected.
 *
 * Next steps are:
 * 1. Log discrepancies between events DataFlow sends and whether we think
 *    think the same action should be taken, e.g., if DataFlow says an
 *    IP address should be blocked, then block it.
 * 2. Once the discrepancy volume is sufficiently low, start to
 *    act on DataFlow events.
 * 3. Once we build confidence in the DataFlow events, remove duplicate
 *    rules from the content server and rely upon DataFlow.
 */

module.exports = function(config, log, fetchRecords) {
  if (!config.dataflow.enabled) {
    // no-op if not enabled
    return;
  }

  const { projectId, subscriptionName } = config.dataflow.gcpPubSub;

  if (!projectId) {
    throw new Error(
      'Missing configuration option, `dataflow.gcpPubSub.projectId`'
    );
  }

  if (!subscriptionName) {
    throw new Error(
      'Missing configuration option, `dataflow.gcpPubSub.subscriptionName`'
    );
  }

  const { PubSub } = require('@google-cloud/pubsub');
  const pubsub = new PubSub({ projectId });
  let messageCount = 0;

  const subscription = pubsub.subscription(subscriptionName);
  subscription.on('message', messageHandler);
  subscription.on('error', error => {
    log.error({
      op: 'dataflow.subscription.error',
      error: String(error),
    });
  });

  const UNEXPECTED_BLOCK_CHECKS = {
    rl_login_failure_sourceaddress_accountid: isIpEmailBlockUnexpected,
    rl_sms_sourceaddress: isIpBlockUnexpected,
    rl_sms_accountid: isEmailBlockUnexpected,
    rl_email_recipient: isEmailBlockUnexpected,
    rl_statuscheck: isIpBlockUnexpected,
    // accountid in this instance is a uid and we don't have a UidIpBlock, trying for just a UID block
    rl_verifycode_sourceaddress_accountid: isUidBlockUnexpected,
  };

  // Returned for testing
  return {
    checkForUnexpectedBlock,
    messageHandler,
    parseMessage,
    processMessage,
  };

  /**
   * Ack, log, and process a message
   *
   * @param {Object} message
   * @param {Function} [_processMessage=processMessage] message processing method
   */
  function messageHandler(message, _processMessage = processMessage) {
    message.ack();

    log.info({
      op: 'dataflow.message',
      count: messageCount,
      id: message.id,
      // message.data is a Buffer, convert to a string
      data: message.data.toString(),
      attributes: message.attributes,
    });

    messageCount++;

    _processMessage(message);
  }

  /**
   * Parse a message and check the metadata for any unexpected rate limits
   *
   * @param {Object} message
   * @param {Function} [_parseMessage=parseMessage]
   * @param {Function} [_checkForUnexpectedBlock=checkForUnexpectedBlock]
   */
  function processMessage(
    message,
    _parseMessage = parseMessage,
    _checkForUnexpectedBlock = checkForUnexpectedBlock
  ) {
    let block;

    try {
      block = _parseMessage(message);
    } catch (err) {
      log.error({
        op: 'dataflow.message.invalid',
        reason: err.message,
      });
    }

    if (block) {
      _checkForUnexpectedBlock(block);
    }
  }

  /**
   * Parse a message that arrives from PubSub, returning
   * the information about the DataFlow block.
   *
   * @param {Object} message
   * @returns {Object}
   */
  function parseMessage(message) {
    if (!message) {
      throw new Error('missing message');
    }
    if (!message.data) {
      throw new Error('missing message data');
    }
    if (!Buffer.isBuffer(message.data)) {
      throw new Error('message data is not a Buffer');
    }

    // message.data is a Buffer
    const body = message.data.toString();
    const parsedBody = JSON.parse(body);

    if (!parsedBody.metadata) {
      throw new Error('missing metadata');
    }

    if (!Array.isArray(parsedBody.metadata)) {
      throw new Error('metadata is not an Array');
    }

    const block = {};

    // See https://docs.google.com/document/d/1ESuraiNM5nPlicQ5zLFwOYZktTV-i8tqwbnwmxdJzyk
    // for expected metadata fields
    parsedBody.metadata.forEach(({ key, value }) => {
      if (typeof key === 'undefined') {
        throw new Error('missing metadata key');
      }
      if (typeof value === 'undefined') {
        throw new Error(`missing metadata value: ${key}`);
      }
      block[key] = value;
    });

    return block;
  }

  /**
   * Check for unexpected DataFlow blocks.
   * Logs whenever an unexpected block is found.
   *
   * @param {Object} block
   */
  async function checkForUnexpectedBlock(block) {
    const { customs_category: category } = block;

    if (!category) {
      log.error({
        op: 'dataflow.customs_category.missing',
      });
      return;
    }

    const isBlockUnexpected = UNEXPECTED_BLOCK_CHECKS[category];
    if (!isBlockUnexpected) {
      log.error({
        op: 'dataflow.customs_category.unknown',
        customs_category: category,
      });
      return;
    }

    if (await isBlockUnexpected(block)) {
      log.info(
        Object.assign({}, block, {
          op: 'dataflow.block.unexpected',
        })
      );
    } else {
      log.info(
        Object.assign({}, block, {
          op: 'dataflow.block.expected',
        })
      );
    }
  }

  async function isIpEmailBlockUnexpected(block) {
    const { sourceaddress: ip, accountid: email } = block;

    const { ipEmailRecord } = await fetchRecords({ ip, email });

    return !(ipEmailRecord && ipEmailRecord.shouldBlock());
  }

  async function isIpBlockUnexpected(block) {
    const { sourceaddress: ip } = block;

    const { ipRecord } = await fetchRecords({ ip });

    return !(ipRecord && ipRecord.shouldBlock());
  }

  async function isEmailBlockUnexpected(block) {
    const { accountid: email } = block;
    const { emailRecord } = await fetchRecords({ email });

    return !(emailRecord && emailRecord.shouldBlock());
  }

  async function isUidBlockUnexpected(block) {
    const { uid } = block;

    const { uidRecord } = await fetchRecords({ uid });

    return !(uidRecord && uidRecord.isRateLimited());
  }
};
