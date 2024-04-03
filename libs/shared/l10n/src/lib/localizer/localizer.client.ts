import { ReactLocalization } from '@fluent/react';
import { determineLocale } from '../determine-locale';
import { parseAcceptLanguage } from '../parse-accept-language';
import { LocalizerBase } from './localizer.base';
import { ILocalizerBindings } from './localizer.interfaces';

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
