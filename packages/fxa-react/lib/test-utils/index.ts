/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle, FluentResource, FluentVariable } from '@fluent/bundle';
import { queries, Screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { checkMessage } from '../utils';

type PackageName = 'settings' | 'payments' | 'react' | null;

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
    case 'react':
      if (locale === 'en') {
        ftlPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'fxa-react',
          'test',
          'react.ftl'
        );
      } else {
        // TODO: Not currently used, but probably want to add one translation test
        ftlPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'fxa-react',
          'public',
          'locales',
          locale,
          'react.ftl'
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
  bundle: FluentBundle,
  ftlArgs?: Record<string, FluentVariable>
) {
  const ftlMsgMocks = getAllByTestId('ftlmsg-mock');
  ftlMsgMocks.forEach((ftlMsgMock) => {
    testL10n(ftlMsgMock, bundle, ftlArgs);
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

  const ftlChildAttrs: Record<string, string> | undefined =
    _getElementAttrs(ftlMsgMock);
  const ftlMsgAttrs: Record<string, boolean> = _getFtlMsgAttrs(ftlMsgMock);

  if (ftlChildAttrs) {
    const attrsMissingFallback: String[] = _getAttrsMissingFallback(
      ftlMsgAttrs,
      ftlChildAttrs
    );
    if (ftlChildAttrs && attrsMissingFallback.length > 0) {
      throw new Error(
        `An FtlMsg with ’id=${ftlId}’ is missing fallback text for the following attribute(s): ${attrsMissingFallback}`
      );
    }
  }

  if (!ftlBundleMsg) {
    throw new Error(`Could not retrieve Fluent message tied to ID: ${ftlId}`);
  }

  if (!ftlChildAttrs && !fallbackText) {
    throw new Error(
      `Fallback text is missing. Fallback text is required for ftl messages and their attributes.`
    );
  }

  checkMessage(bundle, ftlBundleMsg, fallbackText, ftlArgs, ftlChildAttrs);
}

/**
 * Takes in a mocked FtlMsg and retrives the FTL message's attributes (if any):
 * @param ftlMsgMock Mocked version of `FtlMsg` (`data-testid='ftlmsg-mock'`)
 */
function _getFtlMsgAttrs(ftlMsgMock: HTMLElement) {
  const key = Object.keys(ftlMsgMock)[1];
  const ftlMsgObj = Object(ftlMsgMock)[key];
  const ftlMsgAttrs = Object(ftlMsgObj['data-attrs']);

  if (Object.keys(ftlMsgAttrs).length === 0) {
    return undefined;
  } else {
    return ftlMsgAttrs;
  }
}

/**
 * Takes in a mocked FtlMsg and retrives the element's attributes (if any):
 * @param ftlMsgMock Mocked version of `FtlMsg` (`data-testid='ftlmsg-mock'`)
 */
function _getElementAttrs(ftlMsgMock: HTMLElement) {
  const key = Object.keys(ftlMsgMock)[1];
  const ftlMsgObj = Object(ftlMsgMock)[key];
  const ftlChildProps = Object(ftlMsgObj.children.props);

  if (Object.keys(ftlChildProps).length === 0 || ftlChildProps.children) {
    return undefined;
  } else {
    return ftlChildProps;
  }
}

/**
 * Takes the FtlMessages required attributes and the elements attributes,
 * and checks that all required attributes have fallback text
 * @param ftlAttributes Attributes with boolean values indicating if l10n is required
 * @param elemAttributes Attributes and values to use as fallback
 * @return Array of attributes missing fallback text
 */
function _getAttrsMissingFallback(
  ftlAttributes: Record<string, boolean>,
  elemAttributes: Record<string, string>
) {
  let attributesWithMissingFallback: String[] = [];
  if (ftlAttributes !== (undefined || null)) {
    Object.keys(ftlAttributes).forEach((key) => {
      if (ftlAttributes[key] && elemAttributes[key] === '') {
        attributesWithMissingFallback.push(key);
      }
    });
  }
  return attributesWithMissingFallback;
}
