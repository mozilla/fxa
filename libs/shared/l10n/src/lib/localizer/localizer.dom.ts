/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization } from '@fluent/dom';
import { FluentBundle } from '@fluent/bundle';
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

  async formatValue(id: string, args?: Record<string, any>, fallback?: string) {
    try {
      return (await this.l10n.formatValue(id, args)) ?? fallback;
    } catch (e) {
      Sentry.captureException(e);
      return fallback || id;
    }
  }
}
