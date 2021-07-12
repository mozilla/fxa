/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ejs = require('ejs');
import mjml2html = require('mjml');
import * as templates from './templates';
import * as layouts from './layouts';
import path = require('path');
const config = require('../../../config').getProperties();

const mjmlConfig: Record<any, any> = {
  validationLevel: 'soft',
  // ignoreIncludes: config.env === 'test' ? true : false,
};

export const context = {
  buttonText: 'Sync another device',
  onDesktopOrTabletDevice: true,
  anotherDeviceUrl:
    config.contentServer.url +
    '/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device',
  preHeader: 'random headers',
  privacyUrl: config.smtp.privacyUrl,
  supportUrl: config.smtp.supportUrl,
  oneClickLink: true,
  iosUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png',
  androidUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/google-play.png',
  subject: 'Reminder to sync your device',
  cssBaseDir: `${__dirname}/css`,
};

function compile(
  context: Record<any, any>,
  templateName: string,
  subTemplate?: string
) {
  let template: ejs.TemplateFunction;
  if (subTemplate) {
    template = ejs.compile(
      layouts[templateName as keyof typeof layouts].render(subTemplate)
    );
  } else {
    template = ejs.compile(
      templates[templateName as keyof typeof templates].render()
    );
  }
  const mjmlTemplate = template(context);
  const htmlTemplate = mjml2html(mjmlTemplate, mjmlConfig).html;
  return htmlTemplate;
}

export function renderWithOptionalLayout(
  templateName: string,
  context: Record<any, any>,
  layoutName?: string
) {
  if (layoutName) {
    const subTemplate =
      templates[templateName as keyof typeof templates].render();
    return compile(context, layoutName, subTemplate);
  } else return compile(context, templateName);
}
