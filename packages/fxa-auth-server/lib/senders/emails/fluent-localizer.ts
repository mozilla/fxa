/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages } from '@fluent/langneg';
import { JSDOM } from 'jsdom';
import path from 'path';
import { renderWithOptionalLayout, context } from './renderer';
import { loadFtlFiles } from './load-ftl-files';
import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';

const OTHER_EN_LOCALES = ['en-NZ', 'en-SG', 'en-MY'];
const baseDir = path.join(__dirname);

class FluentLocalizer {
  localeContentMap: Record<any, any>;
  constructor() {
    this.localeContentMap = loadFtlFiles(baseDir);
  }

  async localizeEmail(
    templateName: string,
    layoutName: string,
    mailSubject: string,
    variables: Record<any, any>,
    acceptLanguage: string
  ) {
    const htmlDocument = renderWithOptionalLayout(
      templateName,
      { ...variables, ...context },
      layoutName
    );

    const { document } = new JSDOM(htmlDocument).window;

    const userLocales: Array<string> = [];

    const parseLocales = acceptLanguage.split(',');
    for (let locale of parseLocales) {
      locale = locale.replace(/^\s*/, '').replace(/\s*$/, '');
      const [lang, qual] = locale.split(';');
      userLocales.push(lang);
    }

    const currentLocales = negotiateLanguages(
      [...userLocales],
      [...OTHER_EN_LOCALES, ...availableLocales],
      {
        defaultLocale: 'en-US',
      }
    );

    const fetchResource = (locale: string) => {
      const response = this.localeContentMap[locale]
        ? this.localeContentMap[locale]
        : '';
      return response;
      // We couldn't fetch any strings; just return nothing and fluent will fall
      // back to the default locale if needed.
    };

    async function* generateBundles(currentLocales: Array<string>) {
      let bundle = new FluentBundle(currentLocales);
      for (const locale of currentLocales) {
        let source = await fetchResource(locale);
        let resource = new FluentResource(source);
        bundle.addResource(resource);
      }
      yield bundle;
    }

    const l10n = new DOMLocalization(currentLocales, generateBundles);

    l10n.connectRoot(document.documentElement);

    await l10n.translateRoots();

    const subject = await l10n.formatValue(mailSubject);
    return {
      html: document.documentElement.outerHTML,
      // The following snippet strips out the html and is not able to preserve the links.
      // So potentially we will either modify the same snippet or think of some other way around
      // text: document.documentElement
      //   .querySelector('body')
      //   ?.textContent?.replace(/(^[ \t]*\n)|(^[ \t]*)/gm, ''),
      localizedSubject: subject,
    };
  }
}
module.exports = FluentLocalizer;
