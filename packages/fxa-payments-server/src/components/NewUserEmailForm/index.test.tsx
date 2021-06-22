import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { NewUserEmailForm } from './index';

describe('NewUserEmailForm test', () => {
  it('renders as expected', () => {
    const { queryByTestId } = render(<NewUserEmailForm />);
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
});
