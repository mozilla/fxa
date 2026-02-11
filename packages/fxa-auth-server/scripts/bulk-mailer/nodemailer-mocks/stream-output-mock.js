/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const NodemailerMock = require('./nodemailer-mock');

module.exports = class StreamOutputMock extends NodemailerMock {
  constructor(config) {
    super(config);

    this.stream = config.stream || process.stdout;
  }

  sendMail(emailConfig, callback) {
    this.stream.write('-----------------------------------\n');
    this.stream.write(`headers: ${emailConfig.to}\n`);
    this.stream.write('-----------------------------------\n');
    this.stream.write(`${JSON.stringify(emailConfig.headers, null, 2)}\n`);
    this.stream.write('-----------------------------------\n');
    this.stream.write(`html: ${emailConfig.to}\n`);
    this.stream.write('-----------------------------------\n');
    this.stream.write(`${emailConfig.html}\n`);
    this.stream.write('-----------------------------------\n');
    this.stream.write(`text: ${emailConfig.to}\n`);
    this.stream.write('-----------------------------------\n');
    this.stream.write(`${emailConfig.text}\n`);
    this.stream.write('===================================\n\n');

    return super.sendMail(emailConfig, callback);
  }
};
