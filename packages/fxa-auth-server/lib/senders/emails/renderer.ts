/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ejs = require('ejs');
import mjml2html = require('mjml');
import * as templates from './templates';
const config = require('../../../config').getProperties();

export const context = {
  buttonText: 'Sync another device',
  onDesktopOrTabletDevice: true,
  baseURL: config.contentServer.url,
  anotherDeviceURL:
    '/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device',
  iosURL: config.smtp.iosUrl,
  androidURL: config.smtp.androidUrl,
};

export function render(
  templateName: keyof typeof templates,
  context: Record<any, any>
) {
  const template = ejs.compile(templates[templateName].render());
  const mjmlTemplate = template(context);
  return mjml2html(mjmlTemplate).html;
}
