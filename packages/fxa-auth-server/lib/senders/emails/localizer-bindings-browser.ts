/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  LocalizerBindings,
  LocalizerOpts,
  TemplateContext,
} from './localizer-bindings';

// When rendering templates in storybook, use the mjml-browser implementation
import mjml2html from 'mjml-browser';

// NOTE: Unfortunately, importing the ejs package won't work from a browser
// context, so per their docs, import official build. This is less than ideal,
// because we are now blind to the version of the package.
//
// A better solution would be great! Consider automating build before
// startup, and base it on installed verison of package.
import ejs from '../../../bin/ejs';

// Overload required or client side errors out.
ejs.fileLoader = function (filePath: string) {
  return filePath;
};

/**
 * Bindings needed to render in story book. Can be used for browser context.
 */
export class BrowserLocalizerBindings extends LocalizerBindings {
  protected readonly opts: LocalizerOpts;

  constructor(opts?: Partial<LocalizerOpts>) {
    super();

    // Backfill partial with defaults
    this.opts = Object.assign(
      {
        templates: {
          basePath: '/lib/senders/emails',
        },
        ejs: {},
        mjml: {
          validationLevel: 'strict',
          ignoreIncludes: typeof global.it === 'function',
        },
        l10n: {
          basePath: '/public/locales',
        },
      },
      opts
    );
  }

  protected renderEjs(
    template: string,
    context: TemplateContext,
    body?: string
  ) {
    return ejs.render(template, { ...context, body: body }, this.opts.ejs);
  }

  protected produceRootElement(html: string) {
    const root = window.document.createElement('html');
    root.innerHTML = html;
    return root;
  }

  protected async fetchResource(path: string) {
    const resp = await fetch(path);
    return await resp.text();
  }

  protected mjml2html(mjml: string): string {
    return mjml2html(mjml, this.opts.mjml).html;
  }
}
