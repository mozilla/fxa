/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle, FluentResource, FluentVariable } from '@fluent/bundle';
import { queries, Screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { checkMessage } from '../utils';

type PackageName = 'settings' | 'payments' | null;

function getFtlPath(packageName: string | null, locale: string) {
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
  return ftlPath;
}

/**
 * Get the specified FTL file/bundle.
 * @packageName Which package to load the bundle for
 * @locale Which locale FTL bundle to load. 'en' will load `test/[name].ftl` and other
 * locales pull from the cloned l10n repo in `public`.
 */
export async function getFtlBundle(packageName: PackageName, locale = 'en') {
  const path = getFtlPath(packageName, locale);
  const messages = await fs.promises.readFile(path, 'utf-8');
  return _createFtlBundle(messages, locale);
}

/**
 * Get the specified FTL file/bundle synchronously. Note, this should be avoided. Using the asynchronous version, getFtlBundle, is preferred.
 * @param packageName Which package to load the bundle for
 * @param locale Which locale FTL bundle to load. 'en' will load `test/[name].ftl` and other
 * locales pull from the cloned l10n repo in `public`.
 * @returns
 */
export function getFtlBundleSync(packageName: PackageName, locale = 'en') {
  const path = getFtlPath(packageName, locale);
  const messages = fs.readFileSync(path, 'utf-8');
  return _createFtlBundle(messages, locale);
}

function _createFtlBundle(messages: string, locale: string) {
  const resource = new FluentResource(messages);
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addResource(resource);
  return bundle;
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

  if (!ftlBundleMsg) {
    throw new Error(`Could not retrieve Fluent message tied to ID: ${ftlId}`);
  }

  if (!fallbackText) {
    throw new Error('No fallback text exists. Fallback text required!');
  }

  checkMessage(bundle, ftlBundleMsg, fallbackText, ftlArgs);
}
