import React from 'react';
import LogoLockup from '.';
import { renderWithLocalizationProvider } from '../../lib/test-utils/localizationProvider';

// TODO: functional test for `data-testid="logo-text"` to be
// hidden at mobile

describe('LogoLockup', () => {
  it('renders as expected', () => {
    const { getByTestId } = renderWithLocalizationProvider(
      <LogoLockup>Firefox account</LogoLockup>
    );
    expect(getByTestId('logo')).toBeInTheDocument();
    expect(getByTestId('logo-text').textContent).toContain('Firefox account');
  });
});
