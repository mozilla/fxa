import React from 'react';
import { render, screen } from '@testing-library/react';

import { LoadingSpinner } from './index';

it('renders as expected', () => {
  render(<LoadingSpinner />);
  const result = screen.queryByTestId('loading-spinner');
  expect(result).toBeInTheDocument();
});
