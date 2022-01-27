/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages } from '@fluent/langneg';
import { LocalizerBindings, TemplateContext } from './localizer-bindings';
import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';
import { EN_GB_LOCALES } from 'fxa-shared/l10n/otherLanguages';

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

class FluentLocalizer {
  private readonly bindings: LocalizerBindings;

  constructor(bindings: LocalizerBindings) {
    this.bindings = bindings;
  }

  protected async fetchMessages(currentLocales: string[]) {
    const fetched: Record<string, string> = {};
    for (const locale of currentLocales) {
      fetched[locale] = await this.bindings.fetchLocalizationMessages(locale);
    }
    return fetched;
  }

  protected getSelectedLocale(currentLocales: string[]) {
    return currentLocales[0] || 'en';
  }

  protected createBundleGenerator(fetched: Record<string, string>) {
    async function* generateBundles(currentLocales: string[]) {
      for (const locale of currentLocales) {
        const source = fetched[locale];
        if (source) {
          const bundle = new FluentBundle(locale, {
            useIsolating: false,
          });
          const resource = new FluentResource(source);
          bundle.addResource(resource);
          yield bundle;
        }
      }
    }

    return generateBundles;
  }

  async setupLocalizer(acceptLanguage: string) {
    const currentLocales = parseAcceptLanguage(acceptLanguage);
    const messages = await this.fetchMessages(currentLocales);
    const selectedLocale = this.getSelectedLocale(currentLocales);
    const generateBundles = this.createBundleGenerator(messages);
    const l10n = new DOMLocalization(currentLocales, generateBundles);

    return { currentLocales, messages, generateBundles, selectedLocale, l10n };
  }

  async localizeEmail(context: TemplateContext) {
    const { acceptLanguage, template, layout } = context;
    const { l10n, selectedLocale } = await this.setupLocalizer(acceptLanguage);

    context = { ...context, ...context.templateValues };
    if (template !== '_storybook') {
      // TODO: #11471 Improve dynamically rendered actions & subjects in email.js, etc.
      if (
        template === 'postRemoveTwoStepAuthentication' ||
        template === 'verifyLoginCode'
      ) {
        context.subject = await l10n.formatValue(
          `${template}-subject-line`,
          context
        );
      } else {
        context.subject = await l10n.formatValue(
          `${template}-subject`,
          context
        );
      }
    }

    // metadata.mjml needs a localized version of `action`,
    // but only if oneClickLink is present.
    if (context.oneClickLink) {
      context.action = await l10n.formatValue(`${template}-action`, context);
    }

    const { text, rootElement } = await this.bindings.renderTemplate(
      template,
      context,
      layout
    );

    l10n.connectRoot(rootElement);
    await l10n.translateRoots();

    const isLocaleRenderedRtl = RTL_LOCALES.includes(selectedLocale);
    if (isLocaleRenderedRtl) {
      const body = rootElement.getElementsByTagName('body')[0];
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
      html: rootElement.outerHTML,
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

export function parseAcceptLanguage(acceptLanguage: string) {
  const parsedLocales = acceptLanguage.split(',');
  const userLocales: string[] = [];

  for (let locale of parsedLocales) {
    locale = locale.replace(/^\s*/, '').replace(/\s*$/, '');
    let [lang] = locale.split(';');

    if (EN_GB_LOCALES.includes(lang)) {
      lang = 'en-GB';
    }

    if (!userLocales.includes(lang)) {
      userLocales.push(lang);
    }
  }

  /*
   * We use the 'matching' strategy because the default strategy, 'filtering', will load all English locales
   * with dialects included, e.g. `en-CA`, even when the user prefers 'en' or 'en-US', which would then be
   * shown instead of the English (US) fallback text.
   */
  const currentLocales = negotiateLanguages(
    [...userLocales],
    [...availableLocales],
    {
      defaultLocale: 'en',
      strategy: 'matching',
    }
  );

  return currentLocales;
}

export default FluentLocalizer;
