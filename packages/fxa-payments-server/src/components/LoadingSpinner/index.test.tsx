import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { LoadingSpinner } from './index';
import { renderWithLocalizationProvider } from '../../lib/test-utils';

afterEach(cleanup);

it('renders as expected', () => {
  const { queryByTestId } = renderWithLocalizationProvider(<LoadingSpinner />);
  const result = queryByTestId('loading-spinner');
  expect(result).toBeInTheDocument();
});
