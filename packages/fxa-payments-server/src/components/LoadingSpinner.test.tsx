import React from 'react';
import { render, cleanup } from '@testing-library/react';
import 'jest-dom/extend-expect';

import { LoadingSpinner } from './LoadingSpinner';

afterEach(cleanup);

it('renders as expected', () => {
  const { queryByTestId } = render(<LoadingSpinner />);
  const result = queryByTestId('loading-spinner');
  expect(result).toBeInTheDocument();
});
