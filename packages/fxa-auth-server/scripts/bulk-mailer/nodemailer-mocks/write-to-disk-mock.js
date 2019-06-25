/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const fs = require('fs');
const path = require('path');
const NodemailerMock = require('./nodemailer-mock');

module.exports = class WriteToDiskMock extends NodemailerMock {
  constructor(config) {
    super(config);

    ensureOutputDirExists(config.outputDir);
    this.outputDir = config.outputDir;
  }

  sendMail(emailConfig, callback) {
    const targets = [emailConfig.to].concat(emailConfig.cc || []);
    targets.forEach(email => {
      const outputPath = path.join(this.outputDir, email);

      const textPath = `${outputPath}.txt`;
      fs.writeFileSync(textPath, emailConfig.text);

      const htmlPath = `${outputPath}.html`;
      fs.writeFileSync(htmlPath, emailConfig.html);

      const headersPath = `${outputPath}.headers`;
      fs.writeFileSync(
        headersPath,
        JSON.stringify(emailConfig.headers, null, 2)
      );
    });

    return super.sendMail(emailConfig, callback);
  }
};

function ensureOutputDirExists(outputDir) {
  let dirStats;
  try {
    dirStats = fs.statSync(outputDir);
  } catch (e) {
    fs.mkdirSync(outputDir);
    return;
  }

  if (!dirStats.isDirectory()) {
    throw new Error(`${outputDir} is not a directory`);
  }
}
