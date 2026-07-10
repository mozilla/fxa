/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from './config';
import { determineLocale } from '@fxa/shared/l10n';
import * as Sentry from '@sentry/browser';

export enum LegalDocFile {
  privacy = 'mozilla_accounts_privacy_notice',
  terms = 'firefox_cloud_services_tos',
}

/**
 * Fetches legal document markdown directly from the legal docs CDN.
 */
export const fetchLegalMd = async (
  locale: string,
  file: string
): Promise<{
  markdown?: string;
  error?: string;
}> => {
  const errorMsg = `Something went wrong. Try again later.`;

  // Validate file name to prevent path traversal
  if (/^[a-zA-Z-_]{1,500}$/.test(file) === false) {
    return { error: 'Invalid file name' };
  }

  try {
    const legalDocsUrl = config.servers.legalDocs.url;

    const availableLocales = await getAvailableLocales(legalDocsUrl, file);
    if (!availableLocales || availableLocales.length === 0) {
      return { markdown: '' };
    }

    const bestLocale = determineLocale(locale, availableLocales)?.replace(
      '_',
      '-'
    );

    let markdown = await tryGetDoc(legalDocsUrl, bestLocale, file);

    // Fallback: try base locale (e.g., 'de' instead of 'de-DE')
    if (!markdown && bestLocale !== bestLocale.replace(/-.*/, '')) {
      markdown = await tryGetDoc(
        legalDocsUrl,
        bestLocale.replace(/-.*/, ''),
        file
      );
    }

    // Final fallback: try English
    if (!markdown && bestLocale !== 'en') {
      markdown = await tryGetDoc(legalDocsUrl, 'en', file);
    }

    if (markdown) {
      return { markdown };
    }

    throw new Error(errorMsg);
  } catch (err) {
    Sentry.captureException(err);
    return { error: errorMsg };
  }
};

/**
 * Fetches the list of available locales for a legal document.
 */
async function getAvailableLocales(
  legalDocsUrl: string,
  file: string
): Promise<string[] | null> {
  try {
    const url = `${legalDocsUrl}/${file}_locales.json`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const availableLocales = await response.json();
    return availableLocales as string[];
  } catch {
    return null;
  }
}

/**
 * Attempts to fetch a legal document for a specific locale.
 */
async function tryGetDoc(
  legalDocsUrl: string,
  locale: string,
  file: string
): Promise<string> {
  try {
    const url = `${legalDocsUrl}/${locale}/${file}.md`;
    const response = await fetch(url);

    if (!response.ok) {
      return '';
    }

    const text = await response.text();

    // The response should be markdown. HTML is returned if the file is not found.
    if (text.includes('<!DOCTYPE html>')) {
      return '';
    }

    return text;
  } catch (err) {
    Sentry.captureException(err);
    return '';
  }
}
