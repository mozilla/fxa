/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages } from '@fluent/langneg';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import { render, TemplateContext } from './renderer';
import { loadFtlFiles } from './load-ftl-files';
import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';

const OTHER_EN_LOCALES = ['en-NZ', 'en-SG', 'en-MY'];

const RTL_LOCALES = [
  'ar',
  'ckb',
  'dv',
  'he',
  'ks',
  'ps',
  'fa',
  'syr',
  'ur',
  'ug',
];

const baseDir = join(__dirname, '../../../public/locales');

class FluentLocalizer {
  localeContentMap: Record<any, any>;
  constructor() {
    this.localeContentMap = loadFtlFiles(baseDir);
  }

  async localizeEmail(context: TemplateContext) {
    const { acceptLanguage, template, layout } = context;
    const userLocales: Array<string> = [];
    const parseLocales = acceptLanguage.split(',');

    for (let locale of parseLocales) {
      locale = locale.replace(/^\s*/, '').replace(/\s*$/, '');
      const [lang] = locale.split(';');
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

      // If we can't fetch any strings; just return nothing and
      // fluent will fall back to the default locale if needed.
      return response;
    };

    let selectedLocale: string = 'en-US';
    async function* generateBundles(currentLocales: Array<string>) {
      let bundle = new FluentBundle(currentLocales, { useIsolating: false });
      for (const locale of currentLocales) {
        let source = await fetchResource(locale);
        if (source !== '' && locale !== 'en-US') {
          selectedLocale = locale;
        }
        let resource = new FluentResource(source);
        bundle.addResource(resource);
      }
      yield bundle;
    }

    const l10n = new DOMLocalization(currentLocales, generateBundles);

    context = { ...context, ...context.templateValues };
    context.subject = await l10n.formatValue(`${template}-subject`, context);

    // metadata.mjml needs a localized version of `action`,
    // but only if oneClickLink is present.
    if (context.oneClickLink) {
      context.action = await l10n.formatValue(`${template}-action`, context);
    }

    const { html, text } = render(template, context, layout);
    const { document } = new JSDOM(html).window;
    document.title = context.subject;

    l10n.connectRoot(document.documentElement);
    await l10n.translateRoots();

    const isLocaleRenderedRtl = RTL_LOCALES.includes(selectedLocale);
    if (isLocaleRenderedRtl) {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('rtl');
    }

    // localize the plaintext files
    const plainTextArr = text.split('\n');
    for (let i in plainTextArr) {
      // match the lines that are of format key = "value" since we will be extracting the key
      // to pass down to fluent
      const arr = plainTextArr[i].match(/([a-zA-z-]*\s=\s"([^"]+)")/g) || '';
      if (arr[0]) {
        let [key, val] = [
          arr[0].substring(0, arr[0].indexOf('=') - 1),
          arr[0].substring(arr[0].indexOf('=') + 2),
        ];
        val = val.replace(/"/g, '');
        // get the value from fluent using the extracted key
        const localizedValue = await l10n.formatValue(key, context);
        plainTextArr[i] = localizedValue ? localizedValue : val;
      }
    }
    // convert back to string and
    // strip excessive line breaks
    const localizedPlainText = plainTextArr
      .join('\n')
      .replace(/(\n){2,}/g, '\n\n');

    return {
      html: document.documentElement.outerHTML,
      text: localizedPlainText,
      subject: context.subject,
    };
  }
}
export default FluentLocalizer;
