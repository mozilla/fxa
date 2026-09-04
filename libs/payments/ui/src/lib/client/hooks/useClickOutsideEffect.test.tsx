/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useClickOutsideEffect } from './useClickOutsideEffect';

function TestComponent({ onClickOutside }: { onClickOutside: () => void }) {
  const ref = useClickOutsideEffect<HTMLDivElement>(onClickOutside);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        Inside content
      </div>
      <div data-testid="outside">Outside content</div>
    </div>
  );
}

describe('useClickOutsideEffect', () => {
  it('calls the handler when clicking outside the referenced element', async () => {
    const user = userEvent.setup();
    const onClickOutside = jest.fn();

    render(<TestComponent onClickOutside={onClickOutside} />);

    await user.click(screen.getByTestId('outside'));

    expect(onClickOutside).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler when clicking inside the referenced element', async () => {
    const user = userEvent.setup();
    const onClickOutside = jest.fn();

    render(<TestComponent onClickOutside={onClickOutside} />);

    await user.click(screen.getByTestId('inside'));

    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it('removes the event listener on unmount', async () => {
    const user = userEvent.setup();
    const onClickOutside = jest.fn();

    const { unmount } = render(
      <TestComponent onClickOutside={onClickOutside} />
    );

    unmount();

    await user.click(document.body);

    expect(onClickOutside).not.toHaveBeenCalled();
  });
});
