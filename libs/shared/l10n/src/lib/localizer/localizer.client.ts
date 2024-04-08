/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ReactLocalization } from '@fluent/react';
import { LocalizerBase } from './localizer.base';
import { ILocalizerBindings } from './localizer.interfaces';
import { determineLocale, parseAcceptLanguage } from '../l10n.utils';

export class LocalizerClient extends LocalizerBase {
  constructor(bindings: ILocalizerBindings) {
    super(bindings);
  }

  async setupReactLocalization(
    acceptLanguage: string,
    reportError?: (error: Error) => void
  ) {
    const currentLocales = parseAcceptLanguage(acceptLanguage);
    const selectedLocale = determineLocale(acceptLanguage);
    const messages = await this.fetchMessages(currentLocales);
    const generateBundles = this.createBundleGenerator(messages);
    const l10n = new ReactLocalization(
      generateBundles(currentLocales),
      undefined,
      reportError
    );
    return { l10n, selectedLocale };
  }
}
