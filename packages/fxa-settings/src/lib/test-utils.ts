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
