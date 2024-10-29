/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: This file handled with browser ESLint bindings
// instead of NodeJS for DOM typings support
/* eslint-env browser */

import { RendererBindings, RendererOpts, TemplateContext } from './bindings';

// When rendering templates in storybook, use the mjml-browser implementation
import mjml2html from 'mjml-browser';

/**
 * Unfortunately, importing the ejs package won't work from a browser context,
 * so per their docs, we must use the 'official' build. Currently this is
 * automically pulled in by the install-ejs.sh script and is invoked before
 * storybook starts up.
 */
import ejs from '../../../vendor/ejs';
import { transformMjIncludeTags } from '../emails/mjml-browser-helper';

/**
 * Allows ejs to import requested files. This gets invoked when include() is
 * used in a template. Note that this function MUST be synchronous.
 */
ejs.fileLoader = function (filePath: string) {
  const request = new XMLHttpRequest();

  // `false` makes the request synchronous
  request.open('GET', './lib/senders/emails' + filePath, false);
  request.send(null);

  if (request.status === 200) {
    return request.responseText;
  }

  return '';
};

/**
 * Bindings needed to render in story book. Can be used for browser context.
 */
export class BrowserRendererBindings extends RendererBindings {
  readonly opts: RendererOpts;

  constructor(opts?: Partial<RendererOpts>) {
    super();

    // Backfill partial with defaults
    this.opts = Object.assign(
      {
        templates: {
          basePath: './lib/senders/emails',
          cssPath: './css',
        },
        ejs: {},
        mjml: {
          validationLevel: 'strict',
        },
        translations: {
          basePath: './public/locales',
        },
      },
      opts
    );
  }

  renderEjs(
    template: string,
    context: Pick<
      TemplateContext,
      'acceptLanguage' | 'templateValues' | 'layout'
    >,
    body?: string
  ) {
    return ejs.render(template, { ...context, body: body }, this.opts.ejs);
  }

  protected produceRootElement(html: string) {
    const root = window.document.createElement('html');
    root.innerHTML = html;
    return root;
  }

  async fetchResource(path: string) {
    const resp = await fetch(path);
    return await resp.text();
  }

  protected mjml2html(mjml: string): string {
    // Work around the fact that mjml-browser doesn't support mj-include tags
    mjml = transformMjIncludeTags(mjml);
    // Re-render to pull in css files
    mjml = this.renderEjs(mjml, {});
    return mjml2html(mjml, this.opts.mjml).html;
  }
}
