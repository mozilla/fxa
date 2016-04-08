/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')

module.exports = function (config) {
  var messageId = 0;

  function ensureOutputDirExists(outputDir) {
    var dirStats
    try {
      dirStats = fs.statSync(config.outputDir)
    } catch (e) {
      fs.mkdirSync(outputDir);
      return;
    }

    if (! dirStats.isDirectory()) {
      console.error(outputDir + ' is not a directory');
      process.exit(1)
    }
  }

  return {
    sendMail: function (emailConfig, callback) {
      if (config.outputDir) {

        ensureOutputDirExists(config.outputDir)

        var language = emailConfig.headers['Content-Language']

        var outputPath = path.join(config.outputDir, language + '.' + emailConfig.to)

        var textPath = outputPath + '.txt'
        fs.writeFileSync(textPath, emailConfig.text)

        var htmlPath = outputPath + '.html'
        fs.writeFileSync(htmlPath, emailConfig.html)
      }

      if (Math.random() > config.failureRate) {
        messageId++
        callback(null, {
          message: 'good',
          messageId: messageId
        })
      } else {
        callback(new Error('uh oh'))
      }
    },

    close: function () {}
  };
};
