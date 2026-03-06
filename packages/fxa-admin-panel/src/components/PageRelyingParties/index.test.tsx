/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import PageRelyingParties from '.';
import { MOCK_RP_ALL_FIELDS, MOCK_RP_FALSY_FIELDS } from './mocks';
import { IClientConfig } from '../../../interfaces';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { mockConfigBuilder } from '../../lib/config';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { adminApi } from '../../lib/api';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);

const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGuard.getGroup(AdminPanelGroup.AdminProd),
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => ({
    guard: mockGuard,
    user: mockConfig.user,
    setUser: () => {},
  }),
}));

jest.mock('../../lib/api', () => ({
  adminApi: {
    getRelyingParties: jest.fn(),
    createRelyingParty: jest.fn(),
    updateRelyingParty: jest.fn(),
    deleteRelyingParty: jest.fn(),
    rotateRelyingPartySecret: jest.fn(),
    deletePreviousRelyingPartySecret: jest.fn(),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding and shows loading text', () => {
  (adminApi.getRelyingParties as jest.Mock).mockResolvedValue([]);
  renderWithLocalizationProvider(<PageRelyingParties />);
  const rpHeading = screen.getByRole('heading', { level: 2 });
  expect(rpHeading).toHaveTextContent('Relying Parties');
  screen.getByText('Loading...');
});

it('renders as expected with zero relying parties', async () => {
  (adminApi.getRelyingParties as jest.Mock).mockResolvedValue([]);
  renderWithLocalizationProvider(<PageRelyingParties />);
  await screen.findByText('No relying parties were found', { exact: false });
});

it('renders as expected with a relying party containing all fields', async () => {
  (adminApi.getRelyingParties as jest.Mock).mockResolvedValue([
    MOCK_RP_ALL_FIELDS,
  ]);
  renderWithLocalizationProvider(<PageRelyingParties />);
  await screen.findByText(MOCK_RP_ALL_FIELDS.id);
  screen.getByText(MOCK_RP_ALL_FIELDS.id);
  screen.getByText(MOCK_RP_ALL_FIELDS.name);
  screen.getByText(MOCK_RP_ALL_FIELDS.redirectUri);
  screen.getByText(MOCK_RP_ALL_FIELDS.allowedScopes!);
  screen.getByText('1970', { exact: false });
  expect(screen.getAllByText('true')).toHaveLength(4);
});

it('creates a new relying party via UI', async () => {
  jest.useFakeTimers();
  (adminApi.getRelyingParties as jest.Mock)
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([]);
  (adminApi.createRelyingParty as jest.Mock).mockResolvedValue({
    id: 'new-id',
    secret: 'SECRET123',
  });

  const { container } = renderWithLocalizationProvider(<PageRelyingParties />);
  await screen.findByText('Create!');
  fireEvent.click(screen.getByText('Create!'));
  fireEvent.change(screen.getByPlaceholderText('name'), {
    target: { value: 'New RP' },
  });
  fireEvent.change(
    screen.getByPlaceholderText('http://mozilla.com/rp/logo.png'),
    { target: { value: 'http://mozilla.com/rp/logo.png' } }
  );
  fireEvent.change(screen.getByPlaceholderText('http://mozilla.com/rp/login'), {
    target: { value: 'http://mozilla.com/rp/login' },
  });

  const canGrant = container.querySelector(
    'select[name="canGrant"]'
  ) as HTMLSelectElement;
  const publicClient = container.querySelector(
    'select[name="publicClient"]'
  ) as HTMLSelectElement;
  const trusted = container.querySelector(
    'select[name="trusted"]'
  ) as HTMLSelectElement;
  fireEvent.change(canGrant, { target: { value: 'false' } });
  fireEvent.change(publicClient, { target: { value: 'false' } });
  fireEvent.change(trusted, { target: { value: 'false' } });

  fireEvent.change(screen.getByPlaceholderText('profile'), {
    target: { value: 'profile email' },
  });
  fireEvent.change(screen.getByPlaceholderText('Enter notes about RP.'), {
    target: { value: 'Brand new' },
  });

  // Submit
  fireEvent.click(screen.getByTestId('rp-update'));

  // Status transitions
  await screen.findByText('Pending');
  await screen.findByText('Success!');

  // Back to the collapsed Add section
  await screen.findByText(
    'To finalize this new RP, a couple more steps are needed'
  );
  await screen.findByText(
    'gcloud pubsub topics create rpQueue-new-id --message-retention-duration=2678400s'
  );
  await screen.findByText('client_secret: SECRET123');
  fireEvent.click(screen.getByText('Got it!'));

  await screen.findByText('Create!');

  jest.useRealTimers();
});

it('updates an existing relying party via UI', async () => {
  jest.useFakeTimers();
  const rp = { ...MOCK_RP_ALL_FIELDS };
  (adminApi.getRelyingParties as jest.Mock)
    .mockResolvedValueOnce([rp])
    .mockResolvedValueOnce([rp]);
  (adminApi.updateRelyingParty as jest.Mock).mockResolvedValue(true);

  renderWithLocalizationProvider(<PageRelyingParties />);

  await screen.findByText(rp.name);
  fireEvent.click(screen.getByText('🖊️ Edit'));
  // Change notes only
  fireEvent.change(screen.getByPlaceholderText('Enter notes about RP.'), {
    target: { value: 'updated-notes' },
  });
  fireEvent.click(screen.getByTestId('rp-update'));

  await screen.findByText('pending');
  await screen.findByText('Success!');
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
  // Back to view mode
  await screen.findByText(rp.name);
  jest.useRealTimers();
});

it('deletes an existing relying party via UI', async () => {
  jest.useFakeTimers();
  const rp = { ...MOCK_RP_ALL_FIELDS };
  (adminApi.getRelyingParties as jest.Mock)
    .mockResolvedValueOnce([rp])
    .mockResolvedValueOnce([rp]);
  (adminApi.deleteRelyingParty as jest.Mock).mockResolvedValue(true);

  renderWithLocalizationProvider(<PageRelyingParties />);

  await screen.findByText(rp.name);
  fireEvent.click(screen.getByText('🗑️ Delete'));

  fireEvent.change(screen.getByPlaceholderText('Enter Relying Party Name'), {
    target: { value: rp.name },
  });
  fireEvent.click(screen.getByTestId('rp-delete'));

  await screen.findByText('Success!');
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
  await screen.findByText(rp.name);
  jest.useRealTimers();
});

it('filters relying parties by name and id', async () => {
  const rp1 = { ...MOCK_RP_ALL_FIELDS };
  const rp2 = { ...MOCK_RP_FALSY_FIELDS };
  (adminApi.getRelyingParties as jest.Mock).mockResolvedValue([rp1, rp2]);
  renderWithLocalizationProvider(<PageRelyingParties />);

  // Both are visible initially
  await screen.findByText(rp1.name);
  await screen.findByText(rp2.name);

  // Filter by name substring (case-sensitive includes)
  fireEvent.change(
    screen.getByPlaceholderText('Filter by relying party name or ID.'),
    { target: { value: 'Send' } }
  );
  fireEvent.click(screen.getByTestId('rp-filter'));

  // rp1 matches, rp2 should be filtered out
  await screen.findByText(rp1.name);
  expect(screen.queryByText(rp2.name)).toBeNull();

  // Filter by id substring
  fireEvent.change(
    screen.getByPlaceholderText('Filter by relying party name or ID.'),
    { target: { value: rp2.id.slice(0, 6) } }
  );
  fireEvent.click(screen.getByTestId('rp-filter'));

  await screen.findByText(rp2.name);
  expect(screen.queryByText(rp1.name)).toBeNull();
});

it('renders as expected with a relying party containing falsy fields', async () => {
  (adminApi.getRelyingParties as jest.Mock).mockResolvedValue([
    MOCK_RP_FALSY_FIELDS,
  ]);
  renderWithLocalizationProvider(<PageRelyingParties />);
  expect(await screen.findAllByText('false')).toHaveLength(4);
  screen.getByText('(empty string)');
  screen.getByText('NULL');
});

it('rotates relying party secret', async () => {
  (adminApi.getRelyingParties as jest.Mock)
    .mockResolvedValueOnce([MOCK_RP_ALL_FIELDS])
    .mockResolvedValueOnce([MOCK_RP_ALL_FIELDS])
    .mockResolvedValueOnce([
      { ...MOCK_RP_ALL_FIELDS, hasPreviousSecret: true },
    ]);
  (adminApi.rotateRelyingPartySecret as jest.Mock).mockResolvedValue({
    secret: 'SECRET123',
  });
  (adminApi.deletePreviousRelyingPartySecret as jest.Mock).mockResolvedValue(
    true
  );

  renderWithLocalizationProvider(<PageRelyingParties />);

  await screen.findByText(MOCK_RP_ALL_FIELDS.name);

  fireEvent.click(await screen.getByText('🔑 Rotate Secret'));

  // Cancel button works
  fireEvent.click(screen.getByText('Cancel'));

  // Should require valid RP name
  await screen.findByText(MOCK_RP_ALL_FIELDS.name);
  fireEvent.click(screen.getByText('🔑 Rotate Secret'));
  fireEvent.change(screen.getByPlaceholderText('Enter Relying Party Name'), {
    target: { value: '123' },
  });
  fireEvent.click(screen.getByText('Submit'));
  await screen.findByText("You must confirm the relying party's name!");

  // Should rotate secret
  fireEvent.change(screen.getByPlaceholderText('Enter Relying Party Name'), {
    target: { value: MOCK_RP_ALL_FIELDS.name },
  });
  fireEvent.click(screen.getByText('Submit'));
  await screen.findByText('client_secret: SECRET123');
  fireEvent.click(screen.getByText('Got it!'));

  // Should require valid RP name
  await screen.findByText(MOCK_RP_ALL_FIELDS.name);

  fireEvent.click(screen.getByText('❌ Revoke Previous Secret'));
  fireEvent.change(screen.getByPlaceholderText('Enter Relying Party Name'), {
    target: { value: '123' },
  });
  fireEvent.click(screen.getByText('Submit'));
  await screen.findByText("You must confirm the relying party's name!");

  // Should revoke secret
  fireEvent.change(screen.getByPlaceholderText('Enter Relying Party Name'), {
    target: { value: MOCK_RP_ALL_FIELDS.name },
  });
  fireEvent.click(screen.getByText('Submit'));
  await screen.findByText('Success!');
});
