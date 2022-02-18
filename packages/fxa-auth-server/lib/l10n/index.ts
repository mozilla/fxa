/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization, Localization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { negotiateLanguages } from '@fluent/langneg';
import { LocalizerBindings } from './bindings';
import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';
import { EN_GB_LOCALES } from 'fxa-shared/l10n/otherLanguages';

export interface FtlIdMsg {
  id: string;
  message: string;
}

class Localizer {
  protected readonly bindings: LocalizerBindings;

  constructor(bindings: LocalizerBindings) {
    this.bindings = bindings;
  }

  protected async fetchMessages(currentLocales: string[]) {
    let fetchedPending: Record<string, Promise<string>> = {};
    let fetched: Record<string, string> = {};
    for (const locale of currentLocales) {
      fetchedPending[locale] = this.fetchTranslatedMessages(locale);
    }

    // All we're doing here is taking `{ localeName: pendingLocaleMessagesPromise }` objects and
    // parallelizing the promise resolutions instead of waiting for them to finish syncronously. We
    // then return the result in the same `{ localeName: messages }` format for fulfilled promises.
    const fetchedLocales = await Promise.allSettled(
      Object.keys(fetchedPending).map(async (locale) => ({
        locale,
        fetchedLocale: await fetchedPending[locale],
      }))
    );

    fetchedLocales.forEach((fetchedLocale) => {
      if (fetchedLocale.status === 'fulfilled') {
        fetched[fetchedLocale.value.locale] = fetchedLocale.value.fetchedLocale;
      }
    });
    return fetched;
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

  async getLocalizerDeps(acceptLanguage: string) {
    const currentLocales = parseAcceptLanguage(acceptLanguage);
    const selectedLocale = currentLocales[0] || 'en';
    const messages = await this.fetchMessages(currentLocales);
    const generateBundles = this.createBundleGenerator(messages);
    return { currentLocales, messages, generateBundles, selectedLocale };
  }

  async setupDomLocalizer(acceptLanguage: string) {
    const { currentLocales, generateBundles, selectedLocale } =
      await this.getLocalizerDeps(acceptLanguage);
    const l10n = new DOMLocalization(currentLocales, generateBundles);
    return { l10n, selectedLocale };
  }

  async setupLocalizer(acceptLanguage: string) {
    const { currentLocales, generateBundles, selectedLocale } =
      await this.getLocalizerDeps(acceptLanguage);
    const l10n = new Localization(currentLocales, generateBundles);
    return { l10n, selectedLocale };
  }

  /**
   * Returns the set of translated strings for the specified locale.
   * @param locale Locale to use, defaults to en.
   */
  protected async fetchTranslatedMessages(locale?: string) {
    // note: 'en' auth.ftl only exists for browser bindings / Storybook
    // the fallback English strings within the templates will be shown in other envs
    const path = `${this.bindings.opts.translations.basePath}/${
      locale || 'en'
    }/auth.ftl`;

    return this.bindings.fetchResource(path);
  }

  // NOTE: not currently used, will be implemented in FXA-4623
  protected async localizeString(
    acceptLanguage: string,
    { id, message }: FtlIdMsg
  ) {
    const { l10n } = await this.setupLocalizer(acceptLanguage);
    return (await l10n.formatValue(id, message)) || message;
  }
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
   * We use the 'matching' strategy because the default strategy, 'filtering', will load all
   * English locales with dialects included, e.g. `en-CA`, even when the user prefers 'en' or
   * 'en-US', which would then be shown instead of the English (US) fallback text.
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

export default Localizer;
