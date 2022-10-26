/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Switch from '.';

describe('Switch', () => {
  const switchProps = {
    isSubmitting: false,
    isOn: true,
    handler: () => {},
    id: 'boop',
    localizedLabel: <Localized id="">Label for screenreaders</Localized>,
  };

  it('has expected attributes when on', () => {
    render(<Switch {...switchProps} />);
    const button = screen.getByLabelText('Label for screenreaders');

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('role', 'switch');

    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('id', 'boop');
    expect(button).toHaveAttribute('title', 'Turn off');
    expect(screen.getByTestId('slider-status')).toHaveTextContent('on');
  });

  it('has expected attributes when off', () => {
    render(<Switch {...switchProps} isOn={false} />);
    const button = screen.getByRole('switch');

    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button).toHaveAttribute('title', 'Turn on');
    expect(screen.getByTestId('slider-status')).toHaveTextContent('off');
  });

  it('has expected attributes when submitting', () => {
    render(<Switch {...switchProps} isSubmitting />);
    const button = screen.getByRole('switch');

    // should be 'true' until submission completes
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Submitting…');
    expect(screen.getByTestId('slider-status').firstChild).toHaveClass(
      'invisible'
    );
  });

  it('calls handler onclick', () => {
    const handler = jest.fn();
    render(<Switch {...switchProps} {...{ handler }} />);
    const button = screen.getByRole('switch');

    fireEvent.click(button);
    expect(handler).toHaveBeenCalled();
  });
});
