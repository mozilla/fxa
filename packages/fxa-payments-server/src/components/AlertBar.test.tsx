import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AlertBar } from './AlertBar';

afterEach(cleanup);

it('renders as expected', () => {
  const { queryByTestId } = render(
    <AlertBar>
      <div data-testid="children">Hi mom</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).toHaveClass('alert');
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('accepts an alternate className', () => {
  const { queryByTestId } = render(
    <AlertBar className="foo">
      <div data-testid="children">Hi mom</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).not.toHaveClass('alert');
  expect(queryByTestId('alert-container')).toHaveClass('foo');
  expect(queryByTestId('children')).toBeInTheDocument();
});
