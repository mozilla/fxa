import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { NewUserEmailForm } from './index';

describe('NewUserEmailForm test', () => {
  it('renders as expected', () => {
    const { queryByTestId } = render(
      <NewUserEmailForm getString={(id: string) => id} />
    );
    const form = queryByTestId('new-user-email-form');
    expect(form).toBeInTheDocument();

    const signInCopy = queryByTestId('sign-in-copy');
    expect(signInCopy).toBeInTheDocument();

    const firstEmail = queryByTestId('new-user-email');
    expect(firstEmail).toBeInTheDocument();

    const secondEmail = queryByTestId('new-user-confirm-email');
    expect(secondEmail).toBeInTheDocument();

    const subscribeCheckbox = queryByTestId(
      'new-user-subscribe-product-updates'
    );
    expect(subscribeCheckbox).toBeInTheDocument();

    const assuranceCopy = queryByTestId('assurance-copy');
    expect(assuranceCopy).toBeInTheDocument();
  });

  it('shows error when invalid email is input to first field', () => {
    const { getByTestId, queryByText } = render(
      <NewUserEmailForm getString={(id: string) => id} />
    );
    const firstEmail = getByTestId('new-user-email');
    fireEvent.change(firstEmail, { target: { value: 'invalid-email' } });
    fireEvent.blur(firstEmail);
    expect(queryByText('new-user-email-validate')).toBeVisible();
  });

  it('shows no error when valid email is input to first field', () => {
    const { getByTestId, queryByText } = render(
      <NewUserEmailForm getString={(id: string) => id} />
    );
    const firstEmail = getByTestId('new-user-email');
    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.blur(firstEmail);
    expect(queryByText('new-user-email-validate')).toBeFalsy();
  });

  it('shows error when emails do not match', () => {
    const { getByTestId, queryByText } = render(
      <NewUserEmailForm getString={(id: string) => id} />
    );
    const firstEmail = getByTestId('new-user-email');
    const secondEmail = getByTestId('new-user-confirm-email');
    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.change(secondEmail, {
      target: { value: 'not.the.same@email.com' },
    });
    fireEvent.blur(secondEmail);
    expect(queryByText('new-user-email-validate-confirm')).toBeVisible();
  });

  it('shows no error when emails match', () => {
    const { getByTestId, queryByText } = render(
      <NewUserEmailForm getString={(id: string) => id} />
    );
    const firstEmail = getByTestId('new-user-email');
    const secondEmail = getByTestId('new-user-confirm-email');
    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.blur(firstEmail);
    fireEvent.change(secondEmail, { target: { value: 'valid@email.com' } });
    fireEvent.blur(secondEmail);
    expect(queryByText('new-user-email-validate-confirm')).toBeFalsy();
  });
});
