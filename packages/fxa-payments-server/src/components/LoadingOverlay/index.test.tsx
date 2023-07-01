import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { LoadingOverlay } from './index';
import { renderWithLocalizationProvider } from '../../lib/test-utils';

afterEach(cleanup);

it('renders as null isLoading=false', () => {
  const { queryByTestId } = renderWithLocalizationProvider(
    <LoadingOverlay isLoading={false} />
  );
  const result = queryByTestId('loading-overlay');
  expect(result).not.toBeInTheDocument();
});

it('renders as expected when isLoading=true', () => {
  const { queryByTestId } = renderWithLocalizationProvider(
    <LoadingOverlay isLoading={true} />
  );
  const result = queryByTestId('loading-overlay');
  expect(result).toBeInTheDocument();
});
