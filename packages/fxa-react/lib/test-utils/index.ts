/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import path from 'path';
import fs from 'fs';
import { FluentBundle, FluentResource, FluentVariable } from '@fluent/bundle';
import { Pattern } from '@fluent/bundle/esm/ast';
import { queries, Screen } from '@testing-library/react';

type PackageName = 'settings' | 'payments' | null;

// Testing locales other than the default will load bundles from the l10n repo.
async function getFtlFromPackage(packageName: PackageName, locale: string) {
  let ftlPath: string;

  switch (packageName) {
    case 'settings':
      if (locale === 'en') {
        ftlPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'fxa-settings',
          'test',
          'settings.ftl'
        );
      } else {
        // TODO: Not currently used, but probably want to add one translation test
        ftlPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'fxa-settings',
          'public',
          'locales',
          locale,
          'settings.ftl'
        );
      }
      break;
    case 'payments':
      if (locale === 'en') {
        ftlPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'fxa-payments-server',
          'test',
          'payments.ftl'
        );
      } else {
        // TODO: Not currently used, but probably want to add one translation test
        ftlPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'fxa-payments-server',
          'public',
          'locales',
          locale,
          'payments.ftl'
        );
      }
      break;
    default:
      ftlPath = path.join(__dirname, 'test.ftl');
      break;
  }
  return fs.promises.readFile(ftlPath, 'utf8');
}

/**
 * Get the specified FTL file/bundle.
 * @packageName Which package to load the bundle for
 * @locale Which locale FTL bundle to load. 'en' will load `test/[name].ftl` and other
 * locales pull from the cloned l10n repo in `public`.
 */
export async function getFtlBundle(packageName: PackageName, locale = 'en') {
  const messages = await getFtlFromPackage(packageName, locale);
  const resource = new FluentResource(messages);
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addResource(resource);
  return bundle;
}

function testMessage(
  bundle: FluentBundle,
  pattern: Pattern,
  fallbackText: string | null,
  ftlArgs?: Record<string, FluentVariable>
) {
  const ftlMsg = bundle.formatPattern(pattern, ftlArgs);

  // We allow for .includes because fallback text comes from `textContent` within the
  // `FtlMsg` wrapper which may contain more than one component and string
  if (!fallbackText?.includes(ftlMsg)) {
    throw Error(
      `Fallback text does not match Fluent message.\nFallback text: ${fallbackText}\nFluent message: ${ftlMsg}`
    );
  }

  if (ftlMsg.includes("'")) {
    throw Error(
      `Fluent message contains a straight apostrophe (') and must be updated to its curly equivalent (’). Fluent message: ${ftlMsg}`
    );
  }

  if (ftlMsg.includes('"')) {
    throw Error(
      `Fluent message contains a straight quote (") and must be updated to its curly equivalent (“”). Fluent message: ${ftlMsg}`
    );
  }
}

/**
 * Convenience function for running `testL10n` against all mocked `FtlMsg`s
 * (`data-testid='ftlmsg-mock'`) found.
 * @param screen
 * @param bundle Fluent bundle created during test setup
 */
export function testAllL10n(
  { getAllByTestId }: Screen<typeof queries>,
  bundle: FluentBundle
) {
  const ftlMsgMocks = getAllByTestId('ftlmsg-mock');
  ftlMsgMocks.forEach((ftlMsgMock) => {
    testL10n(ftlMsgMock, bundle);
  });
}

/**
 * Takes in a mocked FtlMsg and tests that:
 *  * Fluent IDs and message are present in the Fluent bundle
 *  * Fluent messages match fallback text
 *  * Fluent messages don't contain any straight apostrophes or quotes
 *  * Variables are provided
 * @param ftlMsgMock Mocked version of `FtlMsg` (`data-testid='ftlmsg-mock'`)
 * @param bundle Fluent bundle created during test setup
 * @param ftlArgs Optional Fluent variables to be passed into the message
 */
export function testL10n(
  ftlMsgMock: HTMLElement,
  bundle: FluentBundle,
  ftlArgs?: Record<string, FluentVariable>
) {
  const ftlId = ftlMsgMock.getAttribute('id')!;
  const fallbackText = ftlMsgMock.textContent;
  const ftlBundleMsg = bundle.getMessage(ftlId);

  // nested attributes can happen when we define something like:
  // `profile-picture =
  //   .header = Picture`
  const nestedAttrValues = Object.values(ftlBundleMsg?.attributes || {});

  if (
    ftlBundleMsg === undefined ||
    (ftlBundleMsg.value === null && nestedAttrValues.length === 0)
  ) {
    throw Error(`Could not retrieve Fluent message tied to ID: ${ftlId}`);
  }

  if (ftlBundleMsg.value) {
    testMessage(bundle, ftlBundleMsg.value, fallbackText, ftlArgs);
  }

  if (nestedAttrValues) {
    nestedAttrValues.forEach((nestedAttrValue) =>
      testMessage(bundle, nestedAttrValue, fallbackText, ftlArgs)
    );
  }
}
