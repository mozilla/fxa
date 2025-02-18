/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'server-only';
import { Injectable } from '@nestjs/common';
import { LocalizerBase } from './localizer.base';
import type { ILocalizerBindings } from './localizer.interfaces';
import supportedLanguages from '../supported-languages.json';
import { FluentBundle } from '@fluent/bundle';
import { LocalizerRsc } from './localizer.rsc';
import { JSDOM } from 'jsdom';
import { parseAcceptLanguage } from '../l10n.utils';

@Injectable()
export class LocalizerRscFactory extends LocalizerBase {
  private readonly bundles: Map<string, FluentBundle> = new Map();
  private fetchedMessages: Record<string, string> = {};
  private document: any = null;
  constructor(bindings: ILocalizerBindings) {
    super(bindings);
  }

  async init() {
    await this.fetchFluentBundles();
    this.document = new JSDOM().window.document;
  }

  private async fetchFluentBundles() {
    this.fetchedMessages = await this.fetchMessages(supportedLanguages);
    const bundleGenerator = this.createBundleGenerator(this.fetchedMessages);
    for (const bundle of bundleGenerator(supportedLanguages)) {
      this.bundles.set(bundle.locales[0], bundle);
    }
  }

  private parseMarkup() {
    return (str: string): Array<Node> => {
      if (!str.includes('<') && !str.includes('>')) {
        return [{ nodeName: '#text', textContent: str } as Node];
      }
      const wrapper = this.document.createElement('span');
      wrapper.innerHTML = str;
      return Array.from(wrapper.childNodes);
    };
  }

  createLocalizerRsc(acceptLanguages?: string | null, selectedLocale?: string) {
    if (!this.bundles.size || !this.document) {
      throw new Error(
        'Ensure factory is initialized before creating LocalizerRsc instances.'
      );
    }
    const supportedBundles: FluentBundle[] = [];
    const currentLocales = parseAcceptLanguage(
      acceptLanguages,
      undefined,
      selectedLocale
    );
    currentLocales.forEach((locale) => {
      const bundle = this.bundles.get(locale);
      if (bundle) {
        supportedBundles.push(bundle);
      }
    });

    return new LocalizerRsc(supportedBundles, this.parseMarkup());
  }

  getFetchedMessages(
    acceptLanguages?: string | null,
    selectedLangauge?: string
  ) {
    const filteredFetchedMessages: Record<string, string> = {};
    const currentLocales = parseAcceptLanguage(
      acceptLanguages,
      undefined,
      selectedLangauge
    );
    currentLocales.forEach((locale) => {
      const msgs = this.fetchedMessages[locale];
      if (msgs) {
        filteredFetchedMessages[locale] = msgs;
      }
    });
    return filteredFetchedMessages;
  }
}
