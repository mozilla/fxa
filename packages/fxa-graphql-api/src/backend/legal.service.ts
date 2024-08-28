/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';

import { AppConfig } from '../config';
import { determineLocale } from '@fxa/shared/l10n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalService {
  private legalDocsUrl: string;

  constructor(configService: ConfigService<AppConfig>) {
    this.legalDocsUrl = configService.get(
      'legalDocsUrl'
    ) as AppConfig['legalDocsUrl'];
  }

  public async getDoc(locale: string, file: string) {
    if (/^[a-zA-Z-_]{1,500}$/.test(file) === false) {
      throw new Error(`Invalid file name`);
    }

    // Determine the best local to use, given the available ones
    const availableLocales = await this.getAvailableLocales(file);
    if (!availableLocales) {
      return { markdown: '' };
    }

    locale = determineLocale(locale, availableLocales)?.replace('_', '-');

    // Try to get the document from the external legal-docs repo. Note that
    // since this is an external repo which might be in a transient state some
    // fallback logic has been added. For example, de-DE would turn into de if
    // the de-DE document did not exist.
    let markdown = await this.tryGetDoc(locale, file);
    if (!markdown && locale !== locale.replace('-.*', '')) {
      markdown = await this.tryGetDoc(locale.replace('-.*', ''), file);
    }
    if (!markdown && locale !== 'en') {
      markdown = await this.tryGetDoc('en', file);
    }

    return { markdown };
  }

  private async tryGetDoc(locale: string, file: string) {
    const url = `${this.legalDocsUrl}/${locale}/${file}.md`;
    const resp = await fetch(url);
    const resText = await resp.text();

    // The response should be markdown. Html is returned if the file is not found.
    if (resText.includes('<!DOCTYPE html>')) {
      return '';
    }
    return resText;
  }

  private async getAvailableLocales(file: string) {
    const url = `${this.legalDocsUrl}/${file}_locales.json`;
    const response = await fetch(`${url}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    try {
      const availableLocales = await response.json();
      return availableLocales as string[];
    } catch {
      return '';
    }
  }
}
