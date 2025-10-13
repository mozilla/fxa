/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'server-only';
import { Injectable } from '@nestjs/common';
import { LocalizerBase } from './localizer.base';
import type { ILocalizerBindings } from './localizer.interfaces';
import supportedLanguages from '../supported-languages.json';
import { parseAcceptLanguage } from '../l10n.utils';
import { LocalizerDom } from './localizer.dom';

@Injectable()
export class LocalizerDomFactory extends LocalizerBase {
  private fetchedMessages: Record<string, string> = {};
  constructor(bindings: ILocalizerBindings) {
    super(bindings);
  }

  async init() {
    await this.fetchFluentMessages();
  }

  private async fetchFluentMessages() {
    this.fetchedMessages = await this.fetchMessages(supportedLanguages);
  }

  createLocalizerDom(
    acceptLanguages?: string | null,
    selectedLocale?: string
  ): LocalizerDom {
    const bundleGenerator = this.createBundleGenerator(this.fetchedMessages);
    const currentLocales = parseAcceptLanguage(
      acceptLanguages,
      undefined,
      selectedLocale
    );
    return new LocalizerDom(currentLocales, bundleGenerator);
  }
}
