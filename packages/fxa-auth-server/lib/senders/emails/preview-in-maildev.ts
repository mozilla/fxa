/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import nodemailer = require('nodemailer');
import * as templates from './templates';
import { render, context } from './renderer';

const transporter = nodemailer.createTransport({
  port: 9999,
  host: 'localhost',
  tls: {
    rejectUnauthorized: false,
  },
});

const message = {
  from: 'noreply@domain.com',
  to: 'testuser+testbox@testuser.com',
  subject: 'Your Friendly Reminder: How To Complete Your Sync Setup',
  text: 'Please confirm your email',
};

let templateName: keyof typeof templates;
for (templateName in templates) {
  const htmlTemplate = render(templateName, context);

  transporter.sendMail(
    { ...message, html: htmlTemplate },
    (error: any, info: any) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    }
  );
}
