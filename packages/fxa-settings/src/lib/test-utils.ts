/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen } from '@testing-library/react';

export const MAC_FIREFOX_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:151.0) Gecko/20100101 Firefox/151.0';
export const WINDOWS_FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0';

export const typeByTestIdFn = (testId: string) => async (x: string) => {
  await act(async () => {
    const input = screen.getByTestId(testId);
    input.focus();
    fireEvent.input(input, {
      target: { value: x },
    });
  });
};

export const typeByLabelText = (labelText: string) => async (x: string) => {
  const input = await screen.findByLabelText(labelText, { exact: false });
  await act(async () => {
    input.focus();
    fireEvent.input(input, {
      target: { value: x },
    });
  });
};
