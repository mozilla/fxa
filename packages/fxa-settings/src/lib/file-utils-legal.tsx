/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from './config';
import { determineLocale } from '@fxa/shared/l10n';

export enum LegalDocFile {
  privacy = 'mozilla_accounts_privacy_notice',
  terms = 'firefox_cloud_services_tos',
}

/**
 * Fetches legal document markdown directly from the legal docs CDN.
 * This replaces the previous GraphQL-based approach.
 */
export const fetchLegalMd = async (
  _unused: unknown, // Previously apolloClient, kept for backward compatibility
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

    // Get available locales for this document
    const availableLocales = await getAvailableLocales(legalDocsUrl, file);
    if (!availableLocales || availableLocales.length === 0) {
      return { markdown: '' };
    }

    // Determine the best locale to use
    const bestLocale = determineLocale(locale, availableLocales)?.replace(
      '_',
      '-'
    );

    // Try to fetch the document with locale fallbacks
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
  } catch {
    return '';
  }
}
