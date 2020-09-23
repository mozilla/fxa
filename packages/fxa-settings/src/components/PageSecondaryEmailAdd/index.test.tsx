/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedCache, renderWithRouter, mockEmail } from '../../models/_mocks';
import { PageSecondaryEmailAdd, CREATE_SECONDARY_EMAIL_MUTATION } from '.';
import { GraphQLError } from 'graphql';

const mockGqlSuccess = (email: string) => ({
  request: {
    query: CREATE_SECONDARY_EMAIL_MUTATION,
    variables: { input: { email } },
  },
  result: {
    errors: [new GraphQLError('Email Address already added')],
  },
});

describe('PageSecondaryEmailAdd', () => {
  describe('no secondary email set', () => {
    it('renders as expected', () => {
      renderWithRouter(
        <MockedCache>
          <PageSecondaryEmailAdd />
        </MockedCache>
      );

      expect(screen.getByTestId('secondary-email-input').textContent).toContain(
        'Enter email address'
      );
      expect(screen.getByTestId('cancel-button').textContent).toContain(
        'Cancel'
      );
      expect(screen.getByTestId('save-button').textContent).toContain('Save');
    });

    it('Enables "save" button once valid email is input', () => {
      renderWithRouter(
        <MockedCache>
          <PageSecondaryEmailAdd />
        </MockedCache>
      );

      expect(screen.getByTestId('save-button')).toHaveAttribute('disabled');

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'fake@example.com' } });

      expect(screen.getByTestId('save-button')).not.toHaveAttribute('disabled');
    });

    it('Do not Enable "save" button if invalid email is input', () => {
      renderWithRouter(
        <MockedCache>
          <PageSecondaryEmailAdd />
        </MockedCache>
      );

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'fake@' } });

      expect(screen.getByTestId('save-button')).toHaveAttribute('disabled');
    });
  });

  describe('createSecondaryEmailCode', () => {
    it('displays an error message in the tooltip', async () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, false),
      ];
      const mocks = [mockGqlSuccess('johndope2@example.com')];
      renderWithRouter(
        <MockedCache account={{ emails }} {...{ mocks }}>
          <PageSecondaryEmailAdd />
        </MockedCache>
      );
      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'johndope2@example.com' } });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-button'));
      });

      expect(screen.queryByTestId('tooltip')).toBeInTheDocument();

      expect(
        screen.queryByText('Email Address already added')
      ).toBeInTheDocument();
    });
  });
});
