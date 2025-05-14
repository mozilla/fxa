/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'server-only';
import {
  FluentBundle,
  FluentDateTime,
  FluentNumber,
  FluentVariable,
} from '@fluent/bundle';
import type { MarkupParser } from '@fluent/react';
// @fluent/react's default export bundles all code in a single scope, so just
// importing <ReactLocalization> from there will run createContext,
// which is not allowed in server components. To avoid that, we import directly
// from the included ES module code. There is the risk that @fluent/react
// updates break that.
// Src + TY: https://github.com/mozilla/blurts-server/blob/main/src/app/functions/server/l10n.ts
import { ReactLocalization } from '@fluent/react/esm/localization';
import { Fragment, ReactElement, createElement } from 'react';
import {
  getLocalizedCurrency,
  getLocalizedCurrencyString,
  getLocalizedDate,
  getLocalizedDateString,
} from '../l10n.formatters';

/**
 * This class is largely a wrapper around the ReactLocalization class, to adapt it's functionality
 * to function as desired in React Server Components.
 *
 * A few formatters, from l10n.formatters, are also wrapped by this class to work around some
 * unexpected behavior during Next.js hot refreshes.
 */
export class LocalizerRsc {
  private l10n: ReactLocalization;
  constructor(
    bundles: Iterable<FluentBundle>,
    parseMarkup?: MarkupParser | null,
    reportError?: (error: Error) => void
  ) {
    this.l10n = new ReactLocalization(bundles, parseMarkup, reportError);
  }

  private createFragment(id: string) {
    return createElement(Fragment, null, id);
  }
  /**
   * Localize react element with a fallback element.
   * Caution - Ensure the correct fallback value is provided
   * NB! - Fallback needs to match same format as expected else Hydration error might occur
   */
  getFragmentWithSource(
    id: string,
    args: {
      vars?: Record<string, FluentVariable>;
      elems?: Record<string, ReactElement>;
      attrs?: Record<string, boolean>;
    },
    fallback: ReactElement
  ) {
    // If bundle for id is not found, use the fallback as sourceElement for getElement
    const sourceElement = this.l10n.getBundle(id)
      ? this.createFragment(id)
      : fallback;

    return this.l10n.getElement(sourceElement, id, args);
  }

  /**
   * Localize react element without a fallback element. If id is invalid, or localization failed, a React fragment with
   * the value of "id" as text content will be returned.
   */
  getFragment(
    id: string,
    args: {
      vars?: Record<string, FluentVariable>;
      elems?: Record<string, ReactElement>;
      attrs?: Record<string, boolean>;
    }
  ) {
    return this.l10n.getElement(this.createFragment(id), id, args);
  }

  getString(id: string, fallback: string): string;
  getString(
    id: string,
    vars: Record<string, FluentVariable> | null,
    fallback: string
  ): string;
  getString(
    id: string,
    varsOrFallback: Record<string, FluentVariable> | null | string,
    fallback?: string
  ): string {
    if (typeof varsOrFallback === 'string') {
      return this.l10n.getString(id, undefined, varsOrFallback);
    } else {
      return this.l10n.getString(id, varsOrFallback, fallback);
    }
  }

  getLocalizedCurrency(
    amountInCents: number | null,
    currency: string
  ): FluentNumber {
    return getLocalizedCurrency(amountInCents, currency);
  }

  getLocalizedCurrencyString(amountInCents: number | null, currency: string, locale: string) {
    return getLocalizedCurrencyString(amountInCents, currency, locale);
  }

  getLocalizedDate(unixSeconds: number, numericDate = false): FluentDateTime {
    return getLocalizedDate(unixSeconds, numericDate);
  }

  getLocalizedDateString(unixSeconds: number, numericDate = false): string {
    return getLocalizedDateString(unixSeconds, numericDate);
  }
}
