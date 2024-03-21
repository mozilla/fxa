import { FluentBundle, FluentVariable } from '@fluent/bundle';
import { LocalizerBase } from './localizer.base';
import { Injectable } from '@nestjs/common';
import supportedLanguages from '../supported-languages.json';
import type { ILocalizerBindings } from './localizer.interfaces';
import { promises as fsPromises, existsSync } from 'fs';
import { join } from 'path';
import type { LocalizerOpts } from './localizer.models';
import { DEFAULT_LOCALE } from '../l10n';
import { determineLocale } from '../determine-locale';

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

  getLocaleFromRequest(
    searchParams: { locale?: string },
    acceptLanguage: string | null,
    supportedLanguages?: string[]
  ) {
    if (searchParams.locale) {
      return determineLocale(searchParams?.locale, supportedLanguages);
    }

    if (acceptLanguage) {
      return determineLocale(acceptLanguage, supportedLanguages);
    }

    return DEFAULT_LOCALE;
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

  getFormattedMsg(
    locale: string,
    msgId: string,
    fallback: string,
    args?: Record<string, FluentVariable> | null
  ) {
    const errors: Error[] = [];
    const bundle = this.getBundle(locale);
    const msg = bundle.getMessage(msgId);
    if (msg?.value) {
      const formattedText = bundle.formatPattern(msg.value, args, errors);
      if (formattedText && !errors.length) {
        return formattedText;
      }
    }
    return fallback;
  }
}

export class LocalizerBindingsServer implements ILocalizerBindings {
  readonly opts: LocalizerOpts;
  constructor(opts?: LocalizerOpts) {
    this.opts = Object.assign(
      {
        translations: {
          basePath: join(__dirname, '../../public/locales'),
        },
      },
      opts
    );

    // Make sure config is legit
    this.validateConfig();
  }

  protected async validateConfig() {
    if (!existsSync(this.opts.translations.basePath)) {
      throw new Error('Invalid ftl translations basePath');
    }
  }

  async fetchResource(path: string): Promise<string> {
    return fsPromises.readFile(path, {
      encoding: 'utf8',
    });
  }
}
