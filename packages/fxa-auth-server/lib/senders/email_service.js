/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const request = require('request')

module.exports = (config) => {
  function sendMail(emailConfig, cb) {
    // Email service requires that all headers are strings.
    const headers = {}
    for (const header in emailConfig.headers) {
      headers[header] = emailConfig.headers[header].toString()
    }
    const options = {
      url: `http://${config.emailService.host}:${config.emailService.port}/send`,
      method: 'POST',
      json: true,
      body: {
        cc: emailConfig.cc,
        to: emailConfig.to,
        subject: emailConfig.subject,
        headers,
        body: {
          text: emailConfig.text,
          html: emailConfig.html
        }
      }
    }

    request(options, function(err, res, body) {
      cb(err, {
        messageId: body.messageId,
        message: err ? err.message : body.message
      })
    })
  }

  function close() {

  }

  return {
    sendMail,
    close
  }
}
