/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization, Localization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { determineLocale, parseAcceptLanguage } from '@fxa/shared/l10n';

export type LocalizerOpts = {
  translations: {
    basePath: string;
  };
  templates: {
    cssPath: string;
  };
};

export interface ILocalizerBindings {
  opts: LocalizerOpts;
  fetchResource(path: string): Promise<string>;
  renderEjs(ejsTemplate: string, context: any): string;
  renderTemplate(
    template: string,
    context: any,
    layout?: string,
    target?: ComponentTarget
  ): Promise<{ text: string; rootElement: Element }>;
}

export type ComponentTarget = 'index' | 'strapi';

export interface ILocalizerBindings {
  opts: LocalizerOpts;
  fetchResource(path: string): Promise<string>;
  renderEjs(ejsTemplate: string, context: any): string;
  renderTemplate(
    template: string,
    context: any,
    layout?: string,
    target?: ComponentTarget
  ): Promise<{ text: string; rootElement: Element }>;
}

/**
 * Represents a Fluent (FTL) message
 * @param id - unique identifier for the message
 * @param message - a fallback message in case the localized string cannot be found
 * @param vars - optional arguments to be interpolated into the localized string
 */
export interface FtlIdMsg {
  id: string;
  message: string;
  vars?: Record<string, string>;
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
      console.log(
        '[DEBUG FLUENT] generateBundles called with locales:',
        currentLocales
      );
      console.log('[DEBUG FLUENT] fetched keys:', Object.keys(fetched));
      for (const locale of currentLocales) {
        const source = fetched[locale];
        console.log(
          `[DEBUG FLUENT] Processing locale "${locale}", source length:`,
          source?.length || 0
        );
        if (source) {
          const bundle = new FluentBundle(locale, {
            useIsolating: false,
          });
          const resource = new FluentResource(source);
          const errors = bundle.addResource(resource);
          console.log(
            `[DEBUG FLUENT] Added resource for "${locale}", errors:`,
            errors
          );
          yield bundle;
        } else {
          console.log(`[DEBUG FLUENT] No source for locale "${locale}"`);
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
    }/emails.ftl`;
    console.log(
      `[DEBUG FETCH] Attempting to fetch emails.ftl for locale "${locale}":`,
      authPath
    );
    try {
      const emailsContent = await this.bindings.fetchResource(authPath);
      console.log(
        `[DEBUG FETCH] Successfully fetched emails.ftl, length:`,
        emailsContent.length
      );
      results.push(emailsContent);
    } catch (err) {
      console.error(`[DEBUG FETCH] FAILED to fetch emails.ftl:`, err);
      throw err;
    }

    const brandingPath = `${this.bindings.opts.translations.basePath}/${
      locale || 'en'
    }/branding.ftl`;
    console.log(
      `[DEBUG FETCH] Attempting to fetch branding.ftl:`,
      brandingPath
    );
    try {
      const brandingContent = await this.bindings.fetchResource(brandingPath);
      console.log(
        `[DEBUG FETCH] Successfully fetched branding.ftl, length:`,
        brandingContent.length
      );
      results.push(brandingContent);
    } catch (err) {
      console.error(`[DEBUG FETCH] FAILED to fetch branding.ftl:`, err);
      throw err;
    }

    const combined = results.join('\n\n\n');
    console.log(
      `[DEBUG FETCH] Combined FTL length for "${locale}":`,
      combined.length
    );
    return combined;
  }

  async localizeStrings(
    acceptLanguage = 'en',
    ftlIdMsgs: FtlIdMsg[]
  ): Promise<LocalizedStrings> {
    const { l10n } = await this.setupLocalizer(acceptLanguage);

    const localizedFtlIdMsgs = await Promise.all(
      ftlIdMsgs.map(async (ftlIdMsg) => {
        const { id, message, vars } = ftlIdMsg;
        let localizedMessage;
        try {
          localizedMessage = (await l10n.formatValue(id, vars)) || message;
        } catch (e) {
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
