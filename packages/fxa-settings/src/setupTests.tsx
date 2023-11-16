/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactLocalization } from '@fluent/react';
import '@testing-library/jest-dom';
import { getFtlBundleSync } from 'fxa-react/lib/test-utils';
import { FtlMsgProps } from 'fxa-react/lib/utils';
import { TextEncoder, TextDecoder } from 'util';

// react-pdf required TextEncoder for EncodeStream
// See https://github.com/diegomura/react-pdf/issues/2054#issue-1407270392
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

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
