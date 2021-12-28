/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages } from '@fluent/langneg';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import { render, TemplateContext } from './renderer';
import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';
import { readFileSync } from 'fs';
import { PatternElement, VariableReference } from '@fluent/bundle/esm/ast';

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

function fetchMessages(locale: string) {
  try {
    return readFileSync(`${baseDir}/${locale}/auth.ftl`, { encoding: 'utf8' });
  } catch (e) {
    // We couldn't fetch any strings; just return nothing and fluent will fall
    // back to the default locale if needed.
    return '';
  }
}

class FluentLocalizer {
  async localizeEmail(context: TemplateContext) {
    const { acceptLanguage, template, layout } = context;
    const parsedLocales = acceptLanguage.split(',');
    const userLocales: string[] = [];

    for (let locale of parsedLocales) {
      locale = locale.replace(/^\s*/, '').replace(/\s*$/, '');
      const [lang] = locale.split(';');
      userLocales.push(lang);
    }

    const currentLocales = negotiateLanguages(
      [...userLocales],
      [...OTHER_EN_LOCALES, ...availableLocales],
      {
        defaultLocale: 'en',
      }
    );

    const fetched = currentLocales
      .filter((l) => !OTHER_EN_LOCALES.includes(l))
      .reduce<Record<string, string>>(
        (obj, locale) =>
          Object.assign(obj, { [locale]: fetchMessages(locale) }),
        {}
      );

    let selectedLocale: string = 'en';
    async function* generateBundles(currentLocales: string[]) {
      for (const locale of currentLocales) {
        const source = fetched[locale];
        if (source !== '') {
          selectedLocale = locale;
          const bundle = new FluentBundle(locale, {
            useIsolating: false,
          });
          const resource = new FluentResource(source);
          bundle.addResource(resource);
          yield bundle;
        }
      }
    }

    const l10n = new DOMLocalization(currentLocales, generateBundles);

    context = { ...context, ...context.templateValues };
    if (template !== '_storybook') {
      context.subject = await l10n.formatValue(`${template}-subject`, context);
    }

    // metadata.mjml needs a localized version of `action`,
    // but only if oneClickLink is present.
    if (context.oneClickLink) {
      context.action = await l10n.formatValue(`${template}-action`, context);
    }

    const { html, text } = render(template, context, layout);
    const { document } = new JSDOM(html).window;
    document.title = context.subject;

    // Since all language strings start as english, we will use
    // the english bundle as the source of truth for variable names.
    const baseBundle = new FluentBundle('en', { useIsolating: false });
    baseBundle.addResource(new FluentResource(fetched['en']));

    // Loop over translatable elements
    for (const x of document.querySelectorAll('[data-l10n-id]')) {
      // Get the l10n-id
      const attr = l10n.getAttributes(x);

      // Determine the varialbes contained in the language string,
      // and auto generate a context (ie data-l10n-args).
      const localContext: any = {};
      const message = baseBundle.getMessage(attr.id);
      if (message && message.value instanceof Array) {
        message.value
          .map((x: PatternElement) => (x as VariableReference).name)
          .forEach((x) => {
            if (x && context[x]) {
              localContext[x] = context[x];
            }
          });
      }

      // Apply the context
      l10n.setAttributes(x, attr.id, localContext);
    }

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
      const { key, val } = splitPlainTextLine(plainTextArr[i]);

      if (key && val) {
        plainTextArr[i] = (await l10n.formatValue(key, context)) || val;
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

const reSplitLine = /(?<key>[a-zA-Z0-9-_]+)\s*=\s*"(?<val>.*)?"/;
export function splitPlainTextLine(plainText: string) {
  const matches = reSplitLine.exec(plainText);
  const key = matches?.groups?.key;
  const val = matches?.groups?.val;

  return { key, val };
}

export default FluentLocalizer;
