/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FetchLegalDoc } from '../../components/LegalWithMarkdown';

export const fetchLegalDoc: FetchLegalDoc = async (locale, legalDocFile) => {
  for (const fallback of [locale, locale.replace(/-.*/, ''), 'en']) {
    let markdown = await fetchDoc(fallback, legalDocFile);

    // We can assume that the first line of the markdown file is a heading.
    if (markdown.trim().startsWith('#')) {
      return { markdown };
    }
  }
  return { error: 'Not found' };
};

async function fetchDoc(locale: string, legalDocFile: string) {
  const path = `/legal-docs/${locale}/${legalDocFile}.md`;
  const response = await fetch(path);
  if (response.ok) {
    return await response.text();
  }
  return '';
}
