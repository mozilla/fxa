import React from 'react';
import { render } from '@testing-library/react';
import LogoLockup from '.';

// TODO: functional test for `data-testid="logo-text"` to be
// hidden at mobile

describe('LogoLockup', () => {
  it('renders as expected', () => {
    const { getByTestId } = render(<LogoLockup>Firefox account</LogoLockup>);
    expect(getByTestId('logo')).toBeInTheDocument();
    expect(getByTestId('logo-text').textContent).toContain('Firefox account');
  });
});
