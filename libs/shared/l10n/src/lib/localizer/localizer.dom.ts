/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'server only';

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle } from '@fluent/bundle';
import { mapBundleSync } from '@fluent/sequence';
import * as Sentry from '@sentry/nestjs';

export class LocalizerDom {
  private l10n: DOMLocalization;
  constructor(
    resourceIds: string[],
    generateBundles: (locales: string[]) => Iterable<FluentBundle>
  ) {
    this.l10n = new DOMLocalization(resourceIds, generateBundles);
  }

  connectRoot(root: HTMLElement) {
    this.l10n.connectRoot(root);
  }

  translateRoots() {
    return this.l10n.translateRoots();
  }

  formatValue(id: string, args?: Record<string, any>) {
    return this.l10n.formatValue(id, args);
  }

  // getString is ported over from ReactLocalization to provide fallback-compatible translations
  getString(id: string, vars: Record<string, any>, fallback?: string) {
    const bundle = mapBundleSync(this.l10n.bundles, id);
    if (bundle) {
      const msg = bundle.getMessage(id);
      if (msg && msg.value) {
        const errors: Array<Error> | null = [];
        const value = bundle.formatPattern(msg.value, vars, errors);
        for (const error of errors) {
          Sentry.captureException(error);
        }
        return value;
      }
    } else {
      const bundlesAreEmpty = Boolean(
        this.l10n.bundles[Symbol.iterator]().next().done
      );
      if (bundlesAreEmpty) {
        Sentry.captureException(
          new Error(
            'Attempting to get a string when no localization bundles are present.'
          )
        );
      } else {
        Sentry.captureException(
          new Error(
            `The id "${id}" did not match any messages in the localization bundles.`
          )
        );
      }
    }
    return fallback || id;
  }
}
