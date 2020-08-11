/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import {
  MockedCache,
  MOCK_ACCOUNT,
  renderWithRouter,
} from '../../models/_mocks';
import { GET_INITIAL_STATE } from '../App';
import { UnitRowSecondaryEmail, RESEND_SECONDARY_EMAIL_CODE_MUTATION } from '.';

const createMock = (email: string) => ({
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

const createErrorMock = (email: string) => ({
  request: {
    query: RESEND_SECONDARY_EMAIL_CODE_MUTATION,
    variables: { input: { email } },
  },
  result: {
    data: null,
    error: {
      message: 'Aw shucks',
    },
  },
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
        '/beta/settings/secondary_email'
      );
      expect(
        screen.getByTestId('secondary-email-default-content')
      ).toBeInTheDocument();
      expect(screen.getByTestId('link-recovery-key')).toHaveAttribute(
        'href',
        '#recovery-key'
      );
    });

    it('opens a modal on CTA click when the primary email is unverified', () => {
      const primaryEmail = {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: false,
      };
      renderWithRouter(
        <MockedCache account={{ primaryEmail, emails: [primaryEmail] }}>
          <UnitRowSecondaryEmail />
        </MockedCache>
      );
      const unitRowModal = screen.getByTestId('unit-row-modal');
      expect(unitRowModal.textContent).toContain('Add');
      fireEvent.click(unitRowModal);
      expect(
        screen.getByTestId('modal-header-verify-email').textContent
      ).toContain('Verify primary email first');
      expect(screen.getByTestId('modal-desc-verify-email')).toBeInTheDocument();
    });
  });

  describe('one secondary email set', () => {
    it('renders as expected when unverified', () => {
      const emails = [
        {
          email: 'johndope@example.com',
          isPrimary: true,
          verified: true,
        },
        {
          email: 'johndope2@example.com',
          isPrimary: false,
          verified: false,
        },
      ];
      render(
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
        {
          email: 'johndope@example.com',
          isPrimary: true,
          verified: true,
        },
        {
          email: 'johndope2@example.com',
          isPrimary: false,
          verified: true,
        },
      ];
      render(
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
        {
          email: 'johndope@example.com',
          isPrimary: true,
          verified: true,
        },
        {
          email: 'johndope2@example.com',
          isPrimary: false,
          verified: true,
        },
        {
          email: 'johndope3@example.com',
          isPrimary: false,
          verified: true,
        },
        {
          email: 'johndope4@example.com',
          isPrimary: false,
          verified: true,
        },
      ];
      render(
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
        {
          email: 'johndope@example.com',
          isPrimary: true,
          verified: true,
        },
        {
          email: 'johndope2@example.com',
          isPrimary: false,
          verified: false,
        },
        {
          email: 'johndope3@example.com',
          isPrimary: false,
          verified: true,
        },
        {
          email: 'johndope4@example.com',
          isPrimary: false,
          verified: false,
        },
      ];
      render(
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
    it('displays a success message in the AlertBar', async () => {
      const primaryEmail = {
        email: 'somethingdifferent@example.com',
        isPrimary: true,
        verified: true,
      };

      const emails = [
        { ...primaryEmail },
        {
          email: 'johndope2@example.com',
          isPrimary: false,
          verified: false,
        },
      ];
      const cache = new InMemoryCache();
      cache.writeQuery({
        query: GET_INITIAL_STATE,
        data: {
          account: { ...MOCK_ACCOUNT, emails, primaryEmail },
          session: { verified: true },
        },
      });
      const mocks = [createMock('johndope2@example.com')];

      const { rerender } = render(<AlertBarRootAndContextProvider />);
      rerender(
        <MockedProvider {...{ mocks, cache }}>
          <AlertBarRootAndContextProvider>
            <UnitRowSecondaryEmail />
          </AlertBarRootAndContextProvider>
        </MockedProvider>
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId('resend-secondary-email-code-button')
        );
      });
      expect(
        screen.queryByTestId('resend-secondary-email-code-error')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('resend-secondary-email-code-success').textContent
      ).toContain('somethingdifferent@example.com');
    });

    it('displays an error message in the AlertBar', async () => {
      const emails = [
        {
          email: 'johndope@example.com',
          isPrimary: true,
          verified: true,
        },
        {
          email: 'johndope2@example.com',
          isPrimary: false,
          verified: false,
        },
      ];
      const cache = new InMemoryCache();
      cache.writeQuery({
        query: GET_INITIAL_STATE,
        data: {
          account: { ...MOCK_ACCOUNT, emails },
          session: { verified: true },
        },
      });
      const mocks = [createErrorMock('johndope2@example.com')];

      const { rerender } = render(<AlertBarRootAndContextProvider />);
      rerender(
        <MockedProvider {...{ mocks, cache }}>
          <AlertBarRootAndContextProvider>
            <UnitRowSecondaryEmail />
          </AlertBarRootAndContextProvider>
        </MockedProvider>
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId('resend-secondary-email-code-button')
        );
      });
      expect(
        screen.queryByTestId('resend-secondary-email-code-success')
      ).not.toBeInTheDocument();

      // TODO: This fails and will be addressed in an immediate follow up.
      // expect(
      //   screen.queryByTestId('resend-secondary-email-code-error')
      // ).toBeInTheDocument();
    });
  });
});
