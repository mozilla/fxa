/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useFocusOnTriggeringElementOnClose } from './hooks';

describe('useFocusOnTriggeringElementOnClose', () => {
  const Subject = ({ revealed }: { revealed?: boolean }) => {
    const triggerElement = useRef<HTMLButtonElement>(null);
    useFocusOnTriggeringElementOnClose(revealed, triggerElement);

    return (
      <button ref={triggerElement} data-testid="trigger-element">
        Hi
      </button>
    );
  };

  it('changes focus as expected', () => {
    const { rerender, getByTestId } = render(<Subject revealed />);
    rerender(<Subject revealed={false} />);

    expect(document.activeElement).toBe(getByTestId('trigger-element'));
  });

  it('does nothing if `revealed` is not passed in', () => {
    const { rerender, getByTestId } = render(<Subject />);
    rerender(<Subject />);

    expect(document.activeElement).not.toBe(getByTestId('trigger-element'));
  });
});
