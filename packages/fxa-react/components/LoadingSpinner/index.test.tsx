import React from 'react';
import { render, screen } from '@testing-library/react';

import { LoadingSpinner, SpinnerType } from './index';

it('renders defaults as expected', () => {
  render(<LoadingSpinner />);
  const result = screen.queryByTestId('loading-spinner');
  const spinnerType = screen.queryByTestId('loading-spinner-blue');
  expect(result).toBeInTheDocument();
  expect(spinnerType).toBeInTheDocument();
});

it('renders with custom spinner classNames', () => {
  render(<LoadingSpinner imageClassName="testclass" />);
  const result = screen.queryByTestId('loading-spinner');
  const spinnerImage = screen.queryByTestId('loading-spinner-blue');
  expect(result).toBeInTheDocument();
  expect(spinnerImage).toHaveClass('testclass');
});

it('renders blue spinner as expected', () => {
  render(<LoadingSpinner spinnerType={SpinnerType.Blue} />);
  const result = screen.queryByTestId('loading-spinner');
  const spinnerType = screen.queryByTestId('loading-spinner-blue');
  expect(result).toBeInTheDocument();
  expect(spinnerType).toBeInTheDocument();
});

it('renders blue spinner as expected', () => {
  render(<LoadingSpinner spinnerType={SpinnerType.White} />);
  const result = screen.queryByTestId('loading-spinner');
  const spinnerType = screen.queryByTestId('loading-spinner-white');
  expect(result).toBeInTheDocument();
  expect(spinnerType).toBeInTheDocument();
});
