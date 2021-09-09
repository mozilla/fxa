/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readFileSync } from 'fs';
import { join } from 'path';
import ejs = require('ejs');
import mjml2html = require('mjml');

type TemplateComponent = 'layouts' | 'templates' | 'partials';
export type TemplateContext = Record<string, any>;

const TEMPLATES_DIR = './lib/senders/emails/';
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
  const basePath = join(TEMPLATES_DIR, type, name);
  return {
    mjml: readFileSync(join(basePath, 'index.mjml'), 'utf8'),
    text: readFileSync(join(basePath, 'index.txt'), 'utf8'),
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

function renderMjml(mjml: string) {
  try {
    return mjml2html(mjml, mjmlConfig).html;
  } catch (error: any) {
    // Make this all happen in a single line so it reports to sentry
    throw new Error(`${error.message} - ${mjml}`.replace(/(\r\n|\n|\r)/gm, ''));
  }
}

export function render(
  templateName: string,
  context: TemplateContext,
  layoutName?: string
) {
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
    rendered = { html: renderMjml(mjml), text };
  } else {
    const { mjml, text } = renderEjs(templateName, 'templates', context);
    rendered = { html: renderMjml(mjml), text };
  }

  return rendered;
}
