/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readFileSync } from 'fs';
import { join } from 'path';
import ejs = require('ejs');
import mjml2html = require('mjml');

type TemplateComponent = 'layouts' | 'templates' | 'partials';
export type TemplateContext = Record<string, any>;

const TEMPLATES_DIR = __dirname;
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

export function render(
  template: string,
  context: TemplateContext,
  layout?: string
) {
  let rendered: { html: string; text: string };
  context = { ...context, template };

  if (layout) {
    const renderedBody = renderEjs(template, 'templates', context);
    const { mjml, text } = renderEjs(layout, 'layouts', context, renderedBody);
    rendered = { html: mjml2html(mjml, mjmlConfig).html, text };
  } else {
    const { mjml, text } = renderEjs(template, 'templates', context);
    rendered = { html: mjml2html(mjml, mjmlConfig).html, text };
  }

  return rendered;
}
