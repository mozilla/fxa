/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readFileSync, existsSync } from 'fs';
import { JSDOM } from 'jsdom';
import {
  LocalizerBindings,
  LocalizerOpts,
  TemplateContext,
} from './localizer-bindings';

import ejs from 'ejs';
import mjml2html from 'mjml';
import { join } from 'path';

/**
 * Represents default set of bindings for fluent localizer. Used for nodejs
 * processes.
 */
export class NodeLocalizerBindings extends LocalizerBindings {
  protected readonly opts: LocalizerOpts;

  constructor(opts?: Partial<LocalizerOpts>) {
    super();

    // Backfill options with defaults
    this.opts = Object.assign(
      {
        templates: {
          basePath: __dirname,
        },
        ejs: {
          root: __dirname,
        },
        mjml: {
          validationLevel: 'strict',
          filePath: __dirname,
          // (#10018) Ignore mj-includes since we don't test template styles
          // This is going to cause issues
          ignoreIncludes: typeof global.it === 'function',
          minify: true,
        },
        l10n: {
          basePath: join(__dirname, '../../../public/locales'),
        },
      },
      opts
    );

    // Make sure config is legit
    this.validateConfig();
  }

  protected validateConfig() {
    if (!existsSync(this.opts.l10n.basePath)) {
      throw new Error('Invalid l10n basePath');
    }
  }

  protected async fetchResource(path: string): Promise<string> {
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
