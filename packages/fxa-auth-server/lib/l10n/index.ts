/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization, Localization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { determineLocale, parseAcceptLanguage } from '@fxa/shared/l10n';
import { ILocalizerBindings } from './interfaces/ILocalizerBindings';

export interface FtlIdMsg {
  id: string;
  message: string;
}

interface LocalizedStrings {
  [id: string]: string;
}

class Localizer {
  protected readonly bindings: ILocalizerBindings;

  constructor(bindings: ILocalizerBindings) {
    this.bindings = bindings;
  }

  protected async fetchMessages(currentLocales: string[]) {
    const fetchedPending: Record<string, Promise<string>> = {};
    const fetched: Record<string, string> = {};
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

  async getLocalizerDeps(acceptLanguage?: string) {
    const currentLocales = parseAcceptLanguage(acceptLanguage || '');
    const selectedLocale = determineLocale(acceptLanguage || '');
    const messages = await this.fetchMessages(currentLocales);
    const generateBundles = this.createBundleGenerator(messages);
    return { currentLocales, messages, generateBundles, selectedLocale };
  }

  async setupDomLocalizer(acceptLanguage?: string) {
    const { currentLocales, generateBundles, selectedLocale } =
      await this.getLocalizerDeps(acceptLanguage);
    const l10n = new DOMLocalization(currentLocales, generateBundles);
    return { l10n, selectedLocale };
  }

  async setupLocalizer(acceptLanguage?: string) {
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
    const results: string[] = [];

    // Note: 'en' auth.ftl only exists for browser bindings / Storybook. The fallback
    // English strings within the templates are tested and are shown in other envs
    const authPath = `${this.bindings.opts.translations.basePath}/${
      locale || 'en'
    }/auth.ftl`;
    results.push(await this.bindings.fetchResource(authPath));

    const brandingPath = `${this.bindings.opts.translations.basePath}/${
      locale || 'en'
    }/branding.ftl`;
    results.push(await this.bindings.fetchResource(brandingPath));

    return results.join('\n\n\n');
  }

  async localizeStrings(
    acceptLanguage = 'en',
    ftlIdMsgs: FtlIdMsg[]
  ): Promise<LocalizedStrings> {
    const { l10n } = await this.setupLocalizer(acceptLanguage);

    const localizedFtlIdMsgs = await Promise.all(
      ftlIdMsgs.map(async (ftlIdMsg) => {
        const { id, message } = ftlIdMsg;
        let localizedMessage;
        try {
          localizedMessage = (await l10n.formatValue(id, message)) || message;
        } catch {
          localizedMessage = message;
        }
        return Promise.resolve({
          [id]: localizedMessage,
        });
      })
    );

    return Object.assign({}, ...localizedFtlIdMsgs);
  }
}

export default Localizer;
