/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import { MockedCache, renderWithRouter, mockEmail } from '../../models/_mocks';
import { UnitRowSecondaryEmail, RESEND_SECONDARY_EMAIL_CODE_MUTATION } from '.';

const mockGqlSuccess = (email: string) => ({
  request: {
    query: RESEND_SECONDARY_EMAIL_CODE_MUTATION,
    variables: { input: { email } },
  },
  result: {
    data: {
      resendSecondaryEmailCode: {
        clientMutationId: null,
      },
    },
  },
});

const mockGqlError = (email: string) => ({
  request: {
    query: RESEND_SECONDARY_EMAIL_CODE_MUTATION,
    variables: { input: { email } },
  },
  error: new Error('Aw shucks'),
});

describe('UnitRowSecondaryEmail', () => {
  describe('no secondary email set', () => {
    it('renders as expected', () => {
      renderWithRouter(
        <MockedCache>
          <UnitRowSecondaryEmail />
        </MockedCache>
      );

      expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
        'None'
      );
      expect(screen.getByTestId('unit-row-route')).toHaveAttribute(
        'href',
        '/beta/settings/emails'
      );
      expect(
        screen.getByTestId('secondary-email-default-content')
      ).toBeInTheDocument();
      expect(screen.getByTestId('link-recovery-key')).toHaveAttribute(
        'href',
        '#recovery-key'
      );
    });
  });

  describe('one secondary email set', () => {
    it('renders as expected when unverified', () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, false),
      ];
      renderWithRouter(
        <MockedCache account={{ emails }}>
          <UnitRowSecondaryEmail />
        </MockedCache>
      );

      expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
        'johndope2@example.com'
      );
      expect(
        screen.getByTestId('resend-secondary-email-code-button')
      ).toBeInTheDocument();
      expect(screen.getByTestId('unverified-text')).toBeInTheDocument();
      expect(screen.getByTestId('unit-row-actions')).toBeEmptyDOMElement();
    });

    it('renders as expected when verified', () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false),
      ];
      renderWithRouter(
        <MockedCache account={{ emails }}>
          <UnitRowSecondaryEmail />
        </MockedCache>
      );

      expect(
        screen.queryByTestId('resend-secondary-email-code-button')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('unverified-text')).not.toBeInTheDocument();
      expect(
        screen.getByTestId('secondary-email-default-content')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('secondary-email-make-primary')
      ).toBeInTheDocument();
    });
  });

  describe('multiple secondary emails set', () => {
    it('renders as expected and with verified email text only present on the last verified', () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false),
        mockEmail('johndope3@example.com', false),
        mockEmail('johndope4@example.com', false),
      ];
      renderWithRouter(
        <MockedCache account={{ emails }}>
          <UnitRowSecondaryEmail />
        </MockedCache>
      );
      const unitRowContents = screen.getAllByTestId('unit-row-content');
      const unitRowHeaderValues = screen.getAllByTestId(
        'unit-row-header-value'
      );
      const secondaryEmails = emails.filter((email) => !email.isPrimary);

      expect(
        screen.getAllByTestId('secondary-email-make-primary')
      ).toHaveLength(3);
      expect(
        screen.getAllByTestId('secondary-email-default-content')
      ).toHaveLength(1);

      expect(unitRowContents[unitRowContents.length - 1]).toContainElement(
        screen.getByTestId('secondary-email-default-content')
      );

      expect(unitRowHeaderValues).toHaveLength(3);
      secondaryEmails.forEach((email, index) => {
        expect(unitRowHeaderValues[index].textContent).toContain(email.email);
      });
    });

    it('renders multiple unverified as expected', () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, false),
        mockEmail('johndope3@example.com', false),
        mockEmail('johndope4@example.com', false, false),
      ];
      renderWithRouter(
        <MockedCache account={{ emails }}>
          <UnitRowSecondaryEmail />
        </MockedCache>
      );

      expect(
        screen.getAllByTestId('secondary-email-make-primary')
      ).toHaveLength(1);
      expect(
        screen.getAllByTestId('secondary-email-default-content')
      ).toHaveLength(1);
      expect(
        screen.getAllByTestId('resend-secondary-email-code-button')
      ).toHaveLength(2);
      expect(screen.getAllByTestId('unverified-text')).toHaveLength(2);
    });
  });

  describe('resendSecondaryEmailCode', () => {
    it('navigates to the emails/verify route on success', async () => {
      const primaryEmail = mockEmail('somethingdifferent@example.com');

      const emails = [
        { ...primaryEmail },
        mockEmail('johndope2@example.com', false, false),
      ];
      const mocks = [mockGqlSuccess('johndope2@example.com')];

      const { history } = renderWithRouter(
        <MockedCache {...{ mocks, account: { emails } }}>
          <AlertBarRootAndContextProvider>
            <UnitRowSecondaryEmail />
          </AlertBarRootAndContextProvider>
        </MockedCache>
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId('resend-secondary-email-code-button')
        );
      });
      await wait();

      expect(history.location.pathname).toEqual('/beta/settings/emails/verify');
    });

    it('displays an error message in the AlertBar', async () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, false),
      ];
      const mocks = [mockGqlError('johndope2@example.com')];

      renderWithRouter(
        <AlertBarRootAndContextProvider>
          <MockedCache {...{ mocks, account: { emails } }}>
            <UnitRowSecondaryEmail />
          </MockedCache>
        </AlertBarRootAndContextProvider>
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId('resend-secondary-email-code-button')
        );
      });
      await wait();
      expect(
        screen.queryByTestId('resend-secondary-email-code-success')
      ).not.toBeInTheDocument();

      expect(
        screen.getByTestId('resend-secondary-email-code-error').textContent
      ).toContain('Aw shucks');
    });
  });
});
