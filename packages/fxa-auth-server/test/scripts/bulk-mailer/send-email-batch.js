/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sendEmailBatch = require('../../../scripts/bulk-mailer/send-email-batch');
const sinon = require('sinon');

describe('send-email-batch', () => {
  const batch = ['a', 'b', 'c'];

  const sender = sinon.spy(userRecord => {
    if (userRecord === 'c') {
      return Promise.reject(new Error('problem sending'));
    } else {
      return Promise.resolve();
    }
  });
  const log = {
    error: sinon.spy(),
    info: sinon.spy(),
  };

  before(() => {
    return sendEmailBatch(batch, sender, log);
  });

  it('calls log as expected', () => {
    assert.equal(log.info.callCount, 2);
    assert.equal(log.info.args[0][0], 'send.success');
    assert.equal(log.info.args[1][0], 'send.success');

    assert.isTrue(log.error.calledOnce);
    assert.equal(log.error.args[0][0], 'send.error');
  });

  it('calls the sender as expected', () => {
    assert.equal(sender.callCount, 3);
    assert.equal(sender.args[0][0], 'a');
    assert.equal(sender.args[1][0], 'b');
    assert.equal(sender.args[2][0], 'c');
  });
});
