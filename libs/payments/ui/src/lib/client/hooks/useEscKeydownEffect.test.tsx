/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEscKeydownEffect } from './useEscKeydownEffect';

describe('useEscKeydownEffect', () => {
  it('calls the handler when the Escape key is pressed', async () => {
    const onEsc = jest.fn();
    renderHook(() => useEscKeydownEffect(onEsc));

    await userEvent.keyboard('{Escape}');

    expect(onEsc).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler for non-Escape keys', async () => {
    const onEsc = jest.fn();
    renderHook(() => useEscKeydownEffect(onEsc));

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('a');

    expect(onEsc).not.toHaveBeenCalled();
  });

  it('removes the event listener on unmount', async () => {
    const onEsc = jest.fn();
    const { unmount } = renderHook(() => useEscKeydownEffect(onEsc));

    unmount();

    await userEvent.keyboard('{Escape}');

    expect(onEsc).not.toHaveBeenCalled();
  });
});
