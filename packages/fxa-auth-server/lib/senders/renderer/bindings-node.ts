/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readFileSync, existsSync } from 'fs';
import { JSDOM } from 'jsdom';
import { RendererBindings, RendererOpts, TemplateContext } from './bindings';

import ejs from 'ejs';
import mjml2html from 'mjml';
import { join } from 'path';

/**
 * Represents default set of bindings for fluent localizer. Used for nodejs
 * processes.
 */
export class NodeRendererBindings extends RendererBindings {
  readonly opts: RendererOpts;

  constructor(opts?: Partial<RendererOpts>) {
    super();

    // Backfill options with (email) defaults
    this.opts = Object.assign(
      {
        templates: {
          basePath: join(__dirname, '../emails'),
          cssPath: join(__dirname, '../emails/css'),
        },
        ejs: {
          root: join(__dirname, '../emails'),
        },
        mjml: {
          validationLevel: 'strict',
          filePath: __dirname,
          // (#10018) Ignore mj-includes since we don't test template styles
          // This is going to cause issues
          ignoreIncludes: typeof global.it === 'function',
          minify: true,
        },
        translations: {
          basePath: join(__dirname, '../../../public/locales'),
        },
      },
      opts
    );

    // Make sure config is legit
    this.validateConfig();
  }

  protected validateConfig() {
    if (!existsSync(this.opts.translations.basePath)) {
      throw new Error('Invalid ftl translations basePath');
    }
  }

  async fetchResource(path: string): Promise<string> {
    const raw = readFileSync(path, {
      encoding: 'utf8',
    });

    return raw;
  }

  protected renderEjs(
    template: string,
    context: TemplateContext,
    body?: string
  ) {
    return ejs.render(template, { ...context, body: body }, this.opts.ejs);
  }

  protected produceRootElement(html: string) {
    const document = new JSDOM(html).window.document;
    return document.documentElement;
  }

  protected mjml2html(mjml: string): string {
    return mjml2html(mjml, this.opts.mjml).html;
  }
}
