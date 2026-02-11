/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = class NodemailerMock {
  constructor(config) {
    this.messageId = 0;
    this.failureRate = config.failureRate;
  }

  sendMail(emailConfig, callback) {
    if (Math.random() > this.failureRate) {
      this.messageId++;
      callback(null, {
        message: 'good',
        messageId: this.messageId,
      });
    } else {
      callback(new Error('uh oh'));
    }
  }

  close() {}
};
