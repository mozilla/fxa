/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act, wait } from '@testing-library/react';
import { DocumentNode } from '@apollo/client';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import {
  MockedCache,
  renderWithRouter,
  mockEmail,
  mockAccountQuery,
} from '../../models/_mocks';
import {
  UnitRowSecondaryEmail,
  RESEND_EMAIL_CODE_MUTATION,
  MAKE_EMAIL_PRIMARY_MUTATION,
  DELETE_EMAIL_MUTATION,
} from '.';

const mockEmailMutations = (mutationName: string, query: DocumentNode) => ({
  success: (email: string) => ({
    request: {
      query,
      variables: { input: { email } },
    },
    result: {
      data: {
        [mutationName]: {
          clientMutationId: null,
        },
      },
    },
  }),
  error: (email: string) => ({
    request: {
      query,
      variables: { input: { email } },
    },
    error: new Error('Gossamer Thin'),
  }),
});

const mock = {
  resendEmailCode: mockEmailMutations(
    'resendSecondaryEmailCode',
    RESEND_EMAIL_CODE_MUTATION
  ),
  makeEmailPrimary: mockEmailMutations(
    'updatePrimaryEmail',
    MAKE_EMAIL_PRIMARY_MUTATION
  ),
  deleteEmail: mockEmailMutations(
    'deleteSecondaryEmail',
    DELETE_EMAIL_MUTATION
  ),
};

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
      expect(screen.getByTestId('secondary-email-delete')).toBeInTheDocument();
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
      expect(screen.getByTestId('secondary-email-delete')).toBeInTheDocument();
    });

    it('can refresh from unverified to verified', async () => {
      const initialEmails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, false),
      ];
      const expectedEmails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, true),
      ];

      renderWithRouter(
        <MockedCache
          account={{ emails: initialEmails }}
          mocks={[mockAccountQuery({ emails: expectedEmails })]}
        >
          <UnitRowSecondaryEmail />
        </MockedCache>
      );

      expect(screen.getByTestId('unverified-text')).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-refresh'));
      });
      expect(screen.queryByTestId('unverified-text')).not.toBeInTheDocument();
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
      expect(screen.getAllByTestId('secondary-email-delete')).toHaveLength(3);
    });
  });

  describe('resendSecondaryEmailCode', () => {
    it('navigates to the emails/verify route on success', async () => {
      const primaryEmail = mockEmail('somethingdifferent@example.com');

      const emails = [
        { ...primaryEmail },
        mockEmail('johndope2@example.com', false, false),
      ];
      const mocks = [mock.resendEmailCode.success('johndope2@example.com')];

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
      const mocks = [mock.resendEmailCode.error('johndope2@example.com')];

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
        screen.queryByTestId('alert-bar-message-success')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('alert-bar-message-error').textContent
      ).toContain('Sorry');
    });
  });

  describe('updatePrimaryEmail', () => {
    it('displays a success message in the AlertBar', async () => {
      const emails = [
        mockEmail('somethingdifferent@example.com'),
        mockEmail('johndope2@example.com', false, true),
      ];
      const mocks = [mock.makeEmailPrimary.success('johndope2@example.com')];

      renderWithRouter(
        <AlertBarRootAndContextProvider>
          <MockedCache
            {...{ mocks, account: { emails }, session: { verified: true } }}
          >
            <UnitRowSecondaryEmail />
          </MockedCache>
        </AlertBarRootAndContextProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-make-primary'));
      });
      expect(
        screen.queryByTestId('alert-bar-message-error')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('alert-bar-message-success').textContent
      ).toContain('johndope2@example.com');
    });

    it('displays an error message in the AlertBar', async () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, true),
      ];
      const mocks = [mock.makeEmailPrimary.error('johndope2@example.com')];

      renderWithRouter(
        <AlertBarRootAndContextProvider>
          <MockedCache
            {...{ mocks, account: { emails }, session: { verified: true } }}
          >
            <UnitRowSecondaryEmail />
          </MockedCache>
        </AlertBarRootAndContextProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-make-primary'));
      });
      expect(
        screen.queryByTestId('alert-bar-message-success')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('alert-bar-message-error').textContent
      ).toContain('Sorry');
    });
  });

  describe('deleteSecondaryEmail', () => {
    it('displays a success message in the AlertBar', async () => {
      const primaryEmail = mockEmail('somethingdifferent@example.com');
      const emails = [
        { ...primaryEmail },
        mockEmail('johndope2@example.com', false, false),
      ];
      const mocks = [mock.deleteEmail.success('johndope2@example.com')];

      renderWithRouter(
        <AlertBarRootAndContextProvider>
          <MockedCache
            {...{
              mocks,
              account: { primaryEmail, emails },
              session: { verified: true },
            }}
          >
            <UnitRowSecondaryEmail />
          </MockedCache>
        </AlertBarRootAndContextProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-delete'));
      });
      await wait();
      expect(
        screen.queryByTestId('alert-bar-message-error')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('alert-bar-message-success').textContent
      ).toContain('johndope2@example.com');
    });

    it('displays an error message in the AlertBar', async () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope2@example.com', false, false),
      ];
      const mocks = [mock.deleteEmail.error('johndope2@example.com')];

      renderWithRouter(
        <AlertBarRootAndContextProvider>
          <MockedCache
            {...{ mocks, account: { emails }, session: { verified: true } }}
          >
            <UnitRowSecondaryEmail />
          </MockedCache>
        </AlertBarRootAndContextProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-delete'));
      });
      expect(
        screen.queryByTestId('alert-bar-message-success')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('alert-bar-message-error').textContent
      ).toContain('Sorry');
    });
  });
});
