/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readFileSync } from 'fs';
import path from 'path';
import ejs = require('ejs');
import mjml2html = require('mjml');
import { Logger } from 'mozlog';

type TemplateComponent = 'layouts' | 'templates' | 'partials';
export type TemplateContext = Record<string, any>;

const TEMPLATES_DIR = path.resolve(__dirname, '.');
const mjmlConfig: Parameters<typeof mjml2html>[1] = {
  validationLevel: 'strict',
  filePath: __dirname,
  // (#10018) Ignore mj-includes since we don't test template styles
  // This is going to cause issues
  ignoreIncludes: typeof global.it === 'function',
};
const ejsConfig: ejs.Options & { async?: never } = {
  root: __dirname,
};

function getComponentContents(
  name: string,
  type: TemplateComponent
): { mjml: string; text: string } {
  const basePath = path.join(TEMPLATES_DIR, type, name);
  return {
    mjml: readFileSync(path.join(basePath, 'index.mjml'), 'utf8'),
    text: readFileSync(path.join(basePath, 'index.txt'), 'utf8'),
  };
}

function renderEjs(
  name: string,
  type: TemplateComponent,
  context: TemplateContext,
  body?: { mjml: string; text: string }
) {
  const { mjml, text } = getComponentContents(name, type);

  return {
    mjml: ejs.render(mjml, { ...context, body: body?.mjml }, ejsConfig),
    text: ejs.render(text, { ...context, body: body?.text }, ejsConfig),
  };
}

export function render(
  log: Logger,
  templateName: string,
  context: TemplateContext,
  layoutName?: string
) {
  try {
    let rendered: { html: string; text: string };
    context = { ...context, templateName };

    if (layoutName) {
      const renderedBody = renderEjs(templateName, 'templates', context);
      const { mjml, text } = renderEjs(
        layoutName,
        'layouts',
        context,
        renderedBody
      );
      log.debug('Raw MJML', { mjml });
      rendered = { html: mjml2html(mjml, mjmlConfig).html, text };
    } else {
      const { mjml, text } = renderEjs(templateName, 'templates', context);
      log.debug('Raw MJML', { mjml });
      rendered = { html: mjml2html(mjml, mjmlConfig).html, text };
    }

    return rendered;
  } catch (error: any) {
    log.debug('Issue rendering email', { error });
    throw error;
  }
}
