/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import { join } from 'path';
import ejs = require('ejs');
import mjml2html = require('mjml');
import * as templates from './templates';
import * as layouts from './layouts';

const mjmlConfig: Record<any, any> = {
  validationLevel: 'strict',
};

const ejsConfig: Record<any, any> = {
  root: __dirname,
};
const TEMPLATES_DIR = './lib/senders/emails/';

function compile(
  context: Record<any, any>,
  templateName: string,
  subTemplate?: Record<any, string>
) {
  // Ignore MJML includes since we don't test the styles of the templates.
  // Futher context in PR #10018
  const ignoreIncludes = typeof global.it === 'function';

  let template: ejs.TemplateFunction, templateText: string;

  if (subTemplate) {
    template = ejs.compile(
      layouts[templateName as keyof typeof layouts].render(subTemplate.mjml)
    );
    const layoutText = fs
      .readFileSync(join(TEMPLATES_DIR, 'layouts', templateName, 'index.txt'))
      .toString();

    templateText = ejs.render(
      layoutText,
      { ...context, body: subTemplate.text },
      ejsConfig
    );
  } else {
    template = ejs.compile(
      templates[templateName as keyof typeof templates].render()
    );
    templateText = fs
      .readFileSync(join(TEMPLATES_DIR, 'templates', templateName, 'index.txt'))
      .toString();
  }
  const plainText = ejs.render(templateText, context, ejsConfig);
  const mjmlTemplate = template(context);
  const htmlTemplate = mjml2html(mjmlTemplate, {
    ...mjmlConfig,
    ignoreIncludes,
  }).html;

  return { htmlTemplate, plainText };
}

export function renderWithOptionalLayout(
  templateName: string,
  context: Record<any, any>,
  layoutName?: string
) {
  context.templateName = templateName;
  if (layoutName) {
    const subTemplate = {
      mjml: templates[templateName as keyof typeof templates].render(),
      text: fs
        .readFileSync(
          join(TEMPLATES_DIR, 'templates', templateName, 'index.txt')
        )
        .toString(),
    };
    return compile(context, layoutName, subTemplate);
  } else return compile(context, templateName);
}
