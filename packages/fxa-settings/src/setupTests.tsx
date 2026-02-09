/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactLocalization } from '@fluent/react';
import '@testing-library/jest-dom';
import { getFtlBundleSync } from 'fxa-react/lib/test-utils';
import { FtlMsgProps } from 'fxa-react/lib/utils';
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

// react-pdf required TextEncoder for EncodeStream
// See https://github.com/diegomura/react-pdf/issues/2054#issue-1407270392
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
    subtle: crypto.webcrypto.subtle,
  },
});

// Suppress noisy console output during tests.
// - Glean SDK telemetry pings and init warnings
// - Model validation warnings from tests with intentionally invalid data
// - Apollo cache warnings from incomplete mock data
//
// Set SHOW_CONSOLE_NOISE=1 to disable filtering for debugging:
//   SHOW_CONSOLE_NOISE=1 yarn test --watchAll=false
if (!process.env.SHOW_CONSOLE_NOISE) {
  const wrap = <T extends (...args: any[]) => void>(
    fn: T,
    filter: (msg: string) => boolean
  ): T =>
    ((...args: any[]) => {
      if (filter(String(args[0]))) return;
      fn(...args);
    }) as unknown as T;

  const isGlean = (m: string) => m.includes('(Glean');
  const isModelValidation = (m: string) =>
    m.includes('Model Validation Errors');
  const isMissingField = (m: string) => m.includes('Missing field');
  // jsdom does not implement requestSubmit; this is a known limitation
  // that produces noisy errors when clicking submit buttons in tests.
  const isJsdomNotImplemented = (m: string) =>
    m.includes('Not implemented: HTMLFormElement.prototype.requestSubmit');

  console.info = wrap(console.info, isGlean);
  console.warn = wrap(console.warn, (m) => isGlean(m) || isModelValidation(m));
  console.error = wrap(console.error, (m) =>
    isMissingField(m) || isJsdomNotImplemented(m)
  );
}

jest.mock('fxa-react/lib/utils', () => {
  const originalModule = jest.requireActual('fxa-react/lib/utils');

  return {
    __esModule: true,
    ...originalModule,
    FtlMsg: (props: FtlMsgProps) => (
      <span data-testid="ftlmsg-mock" id={props.id}>
        {props.children}
      </span>
    ),
  };
});

const mockBundle = getFtlBundleSync('settings', 'en');
const l10n = new ReactLocalization([mockBundle], undefined, () => {});
const mockL10n = { l10n, test: 'what!' };
jest.mock('@fluent/react', () => {
  const originalModule = jest.requireActual('@fluent/react');
  return {
    __esModule: true,
    ...originalModule,
    useLocalization: () => {
      return mockL10n;
    },
  };
});
