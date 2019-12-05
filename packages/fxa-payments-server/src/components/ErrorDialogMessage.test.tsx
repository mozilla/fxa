import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ErrorDialogMessage from './ErrorDialogMessage';

afterEach(cleanup);

it('renders as expected', () => {
  const { queryByTestId, getByTestId, queryByText } = render(
    <ErrorDialogMessage
      title="yikes"
      error={{ message: 'oops' }}
      testid="thing"
    />
  );
  expect(queryByTestId('dialog-message-container')).toHaveClass('blocker');
  expect(queryByTestId('thing')).toBeInTheDocument();
  expect(getByTestId('thing').textContent).toEqual('yikes');
  expect(queryByText('oops')).toBeInTheDocument();
});

it('calls onDismiss on click outside', () => {
  const onDismiss = jest.fn();
  const { container, getByTestId } = render(
    <ErrorDialogMessage
      title="yikes"
      error={{ message: 'oops' }}
      onDismiss={onDismiss}
    />
  );
  fireEvent.click(getByTestId('dialog-message-content'));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.click(container);
  expect(onDismiss).toHaveBeenCalled();
});
