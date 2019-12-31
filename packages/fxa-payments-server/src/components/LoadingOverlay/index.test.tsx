import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { LoadingOverlay } from './index';

afterEach(cleanup);

it('renders as null isLoading=false', () => {
  const { queryByTestId } = render(<LoadingOverlay isLoading={false} />);
  const result = queryByTestId('loading-overlay');
  expect(result).not.toBeInTheDocument();
});

it('renders as expected when isLoading=true', () => {
  const { queryByTestId } = render(<LoadingOverlay isLoading={true} />);
  const result = queryByTestId('loading-overlay');
  expect(result).toBeInTheDocument();
});
