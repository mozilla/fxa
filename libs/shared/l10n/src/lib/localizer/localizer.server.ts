import { FluentBundle } from '@fluent/bundle';
import { LocalizerBase } from './localizer.base';
import { Injectable } from '@nestjs/common';
import supportedLanguages from '../supported-languages.json';
import type { ILocalizerBindings } from './localizer.interfaces';

@Injectable()
export class LocalizerServer extends LocalizerBase {
  private readonly bundles: Map<string, FluentBundle> = new Map();
  constructor(bindings: ILocalizerBindings) {
    super(bindings);
  }

  async populateBundles() {
    const fetchedMessages = await this.fetchMessages(supportedLanguages);
    const bundleGenerator = this.createBundleGenerator(fetchedMessages);
    for await (const bundle of bundleGenerator(supportedLanguages)) {
      this.bundles.set(bundle.locales[0], bundle);
    }
  }

  getBundle(locale: string) {
    const bundle = this.bundles.get(locale);
    if (!bundle) {
      // If no bundle is found, return an empty bundle
      return new FluentBundle(locale, {
        useIsolating: false,
      });
    }

    return bundle;
  }
}
