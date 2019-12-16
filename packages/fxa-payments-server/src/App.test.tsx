import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { defaultAppContextValue } from './lib/test-utils';
import { AppErrorBoundary, AppErrorDialog } from './App';
import { AppContext } from './lib/AppContext';

jest.mock('./lib/sentry');

// TODO: backfill general App component tests
// describe('App', () => {});

describe('App/AppErrorBoundary', () => {
  beforeEach(() => {
    // HACK: Swallow the exception thrown by BadComponent - it bubbles up
    // unnecesarily to jest and makes noise.
    jest.spyOn(console, 'error');
    (global.console.error as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    (global.console.error as jest.Mock).mockRestore();
  });

  it('renders children that do not cause exceptions', () => {
    const GoodComponent = () => <p data-testid="good-component">Hi</p>;
    const { queryByTestId } = render(
      <AppContext.Provider value={defaultAppContextValue()}>
        <AppErrorBoundary>
          <GoodComponent />
        </AppErrorBoundary>
      </AppContext.Provider>
    );
    expect(queryByTestId('error-loading-app')).not.toBeInTheDocument();
  });

  it('renders a general error dialog on exception in child component', () => {
    const BadComponent = () => {
      throw new Error('bad');
    };
    const { queryByTestId } = render(
      <AppContext.Provider value={defaultAppContextValue()}>
        <AppErrorBoundary>
          <BadComponent />
        </AppErrorBoundary>
      </AppContext.Provider>
    );
    expect(queryByTestId('error-loading-app')).toBeInTheDocument();
  });
});

describe('App/AppErrorDialog', () => {
  it('renders a general error dialog', () => {
    const { queryByTestId } = render(
      <AppErrorDialog error={new Error('bad')} />
    );
    expect(queryByTestId('error-loading-app')).toBeInTheDocument();
  });
});
