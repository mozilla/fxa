/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages } from '@fluent/langneg';
import { LocalizerBindings, TemplateContext } from './localizer-bindings';
import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';
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

class FluentLocalizer {
  private readonly bindings: LocalizerBindings;

  constructor(bindings: LocalizerBindings) {
    this.bindings = bindings;
  }

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

    const fetched: Record<string, string> = {};
    for (const locale of currentLocales.filter(
      (l) => !OTHER_EN_LOCALES.includes(l)
    )) {
      fetched[locale] = await this.bindings.fetchLocalizationMessages(locale);
    }

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
      // TODO: #11471 Improve dynamically rendered actions & subjects in email.js, etc.
      if (template === 'postRemoveTwoStepAuthentication') {
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

    // Look up template variables in current context, and apply them automatically
    // as l10n args. Because translations originate from text in 'en', use this as
    // the source of truth for variable names.
    // const baseBundle = new FluentBundle('en', { useIsolating: false });
    // baseBundle.addResource(new FluentResource(fetched['en']));
    // for (const element of rootElement.querySelectorAll('[data-l10n-id]')) {
    //   const attr = l10n.getAttributes(element);
    //   const args: any = {};
    //   const message = baseBundle.getMessage(attr.id);

    //   if (message) {

    //     // TODO: Require that all data-l10n-id values are present in en file.
    //     // if (!message) {
    //     //   throw new Error('Missing data-l10n-id detected. l10n-id=' + attr.id);
    //     // }

    //     if (message && message.value instanceof Array) {
    //       message.value
    //         .map((x: PatternElement) => (x as VariableReference).name)
    //         .forEach((x) => {
    //           if (x && context[x]) {
    //             args[x] = context[x];
    //           }
    //         });
    //     }
    //     l10n.setAttributes(element, attr.id, args);
    //   }
    // }

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

export default FluentLocalizer;
