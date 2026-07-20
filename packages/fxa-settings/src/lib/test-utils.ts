/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen } from '@testing-library/react';

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

/**
 * Creates an instance of type T lazily. This can be useful for mocking.
 * @param factory Produces instance of T
 * @returns Single instance of type T
 */
export function lazy<T>(factory: () => T): () => T {
  let value: T | undefined;
  return () => {
    if (value === undefined) {
      value = factory();
    }
    return value;
  };
}
