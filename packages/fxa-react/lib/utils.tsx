/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle, FluentDateTime, FluentVariable } from '@fluent/bundle';
import { Message, Pattern } from '@fluent/bundle/esm/ast';
import { Localized, LocalizedProps, ReactLocalization } from '@fluent/react';
import React from 'react';

// There maybe situations where we are navigating away from the react app. For example when
// directing back to an RP or the content-server. Let's use this function to make it clear this behavior is
// intentional.
export function hardNavigate(
  href: string,
  additionalQueryParams = {},
  includeCurrentQueryParams = false
) {
  // If there are any query params in the href, we automatically include them in the new url.
  let searchParams = new URLSearchParams();
  if (href.includes('?')) {
    searchParams = new URLSearchParams(href.substring(href.indexOf('?')));
  }

  if (includeCurrentQueryParams) {
    const currentSearchParams = new URLSearchParams(window.location.search);
    currentSearchParams.forEach((value, key) => {
      if (!searchParams.has(key)) {
        searchParams.append(key, value);
      }
    });
  }

  if (additionalQueryParams) {
    const additionalSearchParams = new URLSearchParams(additionalQueryParams);
    additionalSearchParams.forEach((value, key) => {
      searchParams.append(key, value);
    });
  }

  if (href.includes('?')) {
    href = href.substring(0, href.indexOf('?'));
  }
  const stringifiedSearchParams = searchParams.toString();
  window.location.href =
    stringifiedSearchParams.length > 0
      ? `${href}?${stringifiedSearchParams}`
      : href;
}

export enum LocalizedDateOptions {
  NumericDate,
  NumericDateAndTime,
  MediumDateStyle,
}

/**
 * This method is used to provide Fluent with a localizable value that can be formatted per .ftl file based on localization requirements
 *
 * @param milliseconds
 * @param numericDate
 */
export const getLocalizedDate = (
  milliseconds: number,
  dateOptions: LocalizedDateOptions
): FluentDateTime => {
  let options: Intl.DateTimeFormatOptions | undefined;

  switch (dateOptions) {
    case LocalizedDateOptions.NumericDate:
      options = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      };
      break;
    case LocalizedDateOptions.NumericDateAndTime:
      options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      };
      break;
    case LocalizedDateOptions.MediumDateStyle:
      options = {
        dateStyle: 'medium',
      };
      break;
    default:
      options = undefined;
  }

  return new FluentDateTime(milliseconds, options);
};

export type FtlMsgProps = {
  children: React.ReactNode;
} & LocalizedProps;

export const FtlMsg = (props: FtlMsgProps) => (
  <Localized {...props}>{props.children}</Localized>
);

export class FtlMsgResolver {
  /**
   * @param l10n - The current l10n instance. This can be resolved via a call to useLocalization().
   * @param strict - Indicates if an error should be generated in the event the message cannot be resolved
   */
  constructor(
    public readonly l10n: ReactLocalization,
    public readonly strict: boolean
  ) {}

  /**
   * A wrapper around l10n.getString that provides more safety. When strict is true, using this function ensures:
   *  - The fallback text is in alignment with the default 'en' text
   *  - There are no missing parameters
   *  - There are no straight quotes
   *
   * Note, this requires that the default 'en' bundle was loaded and is available.
   *
   * @param id - The id of the message to fetch
   * @param fallbackText - The fallback text for the message
   * @param args - Any arguments for parameterization of message.
   * @returns The formatted language translation string.
   */
  public getMsg(
    id: string,
    fallbackText: string,
    args?: Record<string, FluentVariable>
  ) {
    // If strict, perform checks to validate that state of request is valid.
    if (this.strict) {
      if (!id) {
        throw new Error('An l10n id must be provided.');
      }

      // Find an 'en' bundle with the message id. The 'en' bundle should be the default and always exist.
      const enBundles = [...this.l10n.bundles].filter((x) =>
        x?.locales?.includes('en')
      );

      if (enBundles.length === 0) {
        throw new Error(
          `No 'en' bundles loaded. The 'en' bundle is the default and should always be loaded.`
        );
      }

      // Make sure en bundle has the target message
      const enBundle = enBundles.find((x) => x.hasMessage(id));
      const enMessage = enBundle?.getMessage(id);
      if (!enBundle || !enMessage) {
        throw new Error(
          `Could not locate message in en bundle. Message id: ${id}`
        );
      }

      // Make sure the fallback text and message render cleanly.
      checkMessage(enBundle, enMessage, fallbackText, args);
    }

    // If the above checks pass, we can safely return the language string.
    return this.l10n.getString(id, args, fallbackText);
  }
}

/**
 * Validates a message. Checks that:
 *  - fallback text matches ftl text
 *  - there are not straight quotes
 *  - there are no missing ftlArgs
 * @param bundle - The default bundle, typically a bundle with 'en' locale.
 * @param message - The fluent message to check.
 * @param fallbackText - The fallback text
 * @param ftlArgs - Arguments for updating parameterized messages
 */
export function checkMessage(
  bundle: FluentBundle,
  message: Message,
  fallbackText: string | null,
  ftlArgs?: Record<string, FluentVariable>
) {
  if (!fallbackText) {
    throw new Error('Fallback text must be provided.');
  }

  // nested attributes can happen when we define something like:
  // `profile-picture =
  //   .header = Picture`
  const nestedAttrValues = Object.values(message?.attributes || {});

  if (
    message === undefined ||
    (message.value === null && nestedAttrValues.length === 0)
  ) {
    throw new Error(`Invalid message. Message has no value.`);
  }

  if (message.value) {
    _checkPattern(bundle, message.value, fallbackText, ftlArgs);
  }

  if (nestedAttrValues) {
    nestedAttrValues.forEach((nestedAttrValue) =>
      _checkPattern(bundle, nestedAttrValue, fallbackText, ftlArgs)
    );
  }
}

function _checkPattern(
  bundle: FluentBundle,
  pattern: Pattern,
  fallbackText: string,
  ftlArgs?: Record<string, FluentVariable>
) {
  const errors: Error[] = [];
  const ftlMsg = bundle.formatPattern(pattern, ftlArgs, errors);

  // Try to render the message, and check for any errors. This will catch things like missing parameters.
  if (errors.length > 0) {
    throw new Error(
      `Errors encountered formatting fluent message. Fluent errors: ${errors
        .map((x) => x.message)
        .join('\n')}`
    );
  }

  // We allow for .includes because fallback text comes from `textContent` within the `FtlMsg` wrapper which may contain
  // more than one component and string. Also note that strings must be 'cleaned' because the ftlMsg may have invisible
  // control characters that can break the includes check.
  if (!_clean(fallbackText).includes(_clean(ftlMsg))) {
    throw new Error(
      `Fallback text does not match Fluent message.\nFallback text: ${fallbackText}\nFluent message: ${ftlMsg}`
    );
  }

  let inDomOverlay = false;
  for (let i = 0; i < ftlMsg.length; i++) {
    if (!inDomOverlay && ftlMsg[i] === '<') {
      // Start of dom overlay tag
      inDomOverlay = true;
    } else if (inDomOverlay && ftlMsg[i] === '>') {
      // End of dom overlay tag
      inDomOverlay = false;
    } else if (inDomOverlay && ftlMsg[i] === '<') {
      throw new Error(
        `Fluent message contains a '<' character inside a dom overlay tag. Check that dom overlay is well formed. Fluent message: ${ftlMsg}`
      );
    } else if (!inDomOverlay && ftlMsg[i] === '>') {
      throw new Error(
        `Fluent message contains a '>' character that doesn't appear to be part of a dom tag. Either encode with html entity or check dom overlay is well formed. Fluent message: ${ftlMsg}`
      );
    } else if (!inDomOverlay && ftlMsg[i] === "'") {
      throw new Error(
        `Fluent message contains a straight apostrophe (') and must be updated to its curly equivalent (’). Fluent message: ${ftlMsg}`
      );
    } else if (!inDomOverlay && ftlMsg[i] === '"') {
      throw new Error(
        `Fluent message contains a straight quote (") and must be updated to its curly equivalent (“”). Fluent message: ${ftlMsg}`
      );
    }
  }

  // Edge case non-closed dom overlay tag
  if (inDomOverlay) {
    throw new Error(
      `Fluent message contains start of dom overlay with no end tag. Ensue dom overlay is well formed. Fluent message: ${ftlMsg}`
    );
  }
}

/**
 * Removes any hidden control characters from strings.
 * @param msg - message to clean
 * @returns clean version of message
 */
function _clean(msg: string) {
  return msg.replace(
    /[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,
    ''
  );
}
