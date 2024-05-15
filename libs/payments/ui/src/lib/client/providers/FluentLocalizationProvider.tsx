/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { FluentBundle, FluentResource } from '@fluent/bundle';
import {
  LocalizationProvider,
  MarkupParser,
  ReactLocalization,
} from '@fluent/react';

export function FluentLocalizationProvider({
  fetchedMessages,
  children,
}: {
  fetchedMessages: Record<string, string>;
  children: React.ReactNode;
}) {
  const bundles: FluentBundle[] = [];

  Object.keys(fetchedMessages).forEach((locale) => {
    const source = fetchedMessages[locale];
    if (source) {
      const bundle = new FluentBundle(locale, {
        useIsolating: false,
      });
      const resource = new FluentResource(source);
      bundle.addResource(resource);
      bundles.push(bundle);
    }
  });

  // To enable server-side rendering, all tags are converted to plain text nodes.
  // They will be upgraded to regular HTML elements in the browser:
  const parseMarkup: MarkupParser | undefined =
    typeof document === 'undefined'
      ? (str: string) => [
          {
            nodeName: '#text',
            textContent: str.replace(/<(.*?)>/g, ''),
          } as Node,
        ]
      : undefined;

  const l10n = new ReactLocalization(bundles, parseMarkup);

  return <LocalizationProvider l10n={l10n}>{children}</LocalizationProvider>;
}
