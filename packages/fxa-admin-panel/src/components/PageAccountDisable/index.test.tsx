/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageAccountDisable } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockDisableResults } from './mocks';
import { adminApi } from '../../lib/api';
import { AccountDisableStatus } from 'fxa-admin-server/src/types';

jest.mock('../../lib/api', () => ({
  adminApi: {
    disableAccounts: jest.fn(),
  },
}));

const disableAccounts = adminApi.disableAccounts as jest.Mock;

beforeEach(() => {
  disableAccounts.mockResolvedValue(mockDisableResults);
});

afterEach(() => {
  jest.clearAllMocks();
});

const submitButton = () =>
  screen.getByRole('button', { name: 'Disable Accounts' });

it('renders the heading', () => {
  renderWithLocalizationProvider(<PageAccountDisable />);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
    'Disable Accounts'
  );
});

it('says that OAuth access tokens stay valid until they expire', () => {
  renderWithLocalizationProvider(<PageAccountDisable />);
  expect(
    screen.getByText(/Its OAuth access tokens stay valid until they expire\./)
  ).toBeInTheDocument();
});

it('sends trimmed locators split on commas and newlines, without blanks', async () => {
  const user = userEvent.setup();
  renderWithLocalizationProvider(<PageAccountDisable />);

  await user.type(
    screen.getByRole('textbox', { name: 'Emails or UIDs' }),
    ' foo@example.com ,{Enter}{Enter}f9416ce3703e4916a4cd6b1e665a3f1a,'
  );
  await user.click(submitButton());

  expect(disableAccounts).toHaveBeenCalledWith([
    'foo@example.com',
    'f9416ce3703e4916a4cd6b1e665a3f1a',
  ]);
});

it('shows a summary of the statuses', async () => {
  const user = userEvent.setup();
  renderWithLocalizationProvider(<PageAccountDisable />);

  await user.type(
    screen.getByRole('textbox', { name: 'Emails or UIDs' }),
    'foo@example.com'
  );
  await user.click(submitButton());

  expect(await screen.findByRole('status')).toHaveTextContent(
    '1 account disabled, 1 failed, 1 account not found'
  );
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('reads locators from a text file and sends them in batches of 1000', async () => {
  const user = userEvent.setup();
  renderWithLocalizationProvider(<PageAccountDisable />);
  const locators = Array.from({ length: 1500 }, (_, i) => `u${i}@example.com`);
  const content = locators.join('\n');
  const file = new File([content], 'accounts.txt', { type: 'text/plain' });
  // jsdom's File has no text(); browsers do.
  file.text = async () => content;

  await user.upload(screen.getByLabelText('Text file:'), file);
  await user.click(submitButton());

  await waitFor(() => expect(disableAccounts).toHaveBeenCalledTimes(2));
  expect(disableAccounts).toHaveBeenNthCalledWith(1, locators.slice(0, 1000));
  expect(disableAccounts).toHaveBeenNthCalledWith(2, locators.slice(1000));
});

it('splits long locators into batches of at most 90,000 bytes', async () => {
  const user = userEvent.setup();
  disableAccounts.mockImplementation(async (locators: string[]) =>
    locators.map((locator) => ({
      locator,
      status: AccountDisableStatus.Success,
    }))
  );
  renderWithLocalizationProvider(<PageAccountDisable />);
  const locators = Array.from(
    { length: 1000 },
    (_, i) => `${String(i).padStart(4, '0')}${'a'.repeat(108)}@example.com`
  );
  const content = locators.join('\n');
  const file = new File([content], 'accounts.txt', { type: 'text/plain' });
  file.text = async () => content;

  await user.upload(screen.getByLabelText('Text file:'), file);
  await user.click(submitButton());

  expect(await screen.findByRole('status')).toHaveTextContent(
    '1000 accounts disabled, 0 failed, 0 accounts not found'
  );
  const batches: string[][] = disableAccounts.mock.calls.map(([b]) => b);
  expect(batches.length).toBeGreaterThan(1);
  expect(batches.flat()).toEqual(locators);
  const bodyBytes = batches.map(
    (batch) =>
      new TextEncoder().encode(JSON.stringify({ locators: batch })).length
  );
  expect(Math.max(...bodyBytes)).toBeLessThanOrEqual(90_000);
});

it('refuses a file larger than 15MB without a request', async () => {
  const user = userEvent.setup();
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  renderWithLocalizationProvider(<PageAccountDisable />);
  const file = new File([new Uint8Array(15 * 1024 * 1024 + 1)], 'big.txt', {
    type: 'text/plain',
  });

  await user.upload(screen.getByLabelText('Text file:'), file);
  await user.click(submitButton());

  expect(alert).toHaveBeenCalledWith('Choose a file of 15MB or less!');
  expect(disableAccounts).not.toHaveBeenCalled();
});

it('names the failed batch as unknown and keeps the earlier summary', async () => {
  const user = userEvent.setup();
  disableAccounts
    .mockResolvedValueOnce(mockDisableResults)
    .mockRejectedValueOnce(new Error('Forbidden'));
  renderWithLocalizationProvider(<PageAccountDisable />);
  const content = Array.from(
    { length: 2500 },
    (_, i) => `u${i}@example.com`
  ).join('\n');
  const file = new File([content], 'accounts.txt', { type: 'text/plain' });
  file.text = async () => content;

  await user.upload(screen.getByLabelText('Text file:'), file);
  await user.click(submitButton());

  expect(
    await screen.findByText(
      'The request for entries 1001 to 2000 of 2500 failed, so their outcome is unknown. Later entries were not submitted. Error: Forbidden'
    )
  ).toBeInTheDocument();
  expect(disableAccounts).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('status')).toHaveTextContent(
    '1 account disabled, 1 failed, 1 account not found'
  );
});

it('does not mention later entries when the last batch fails', async () => {
  const user = userEvent.setup();
  disableAccounts.mockRejectedValue(new Error('Forbidden'));
  renderWithLocalizationProvider(<PageAccountDisable />);

  await user.type(
    screen.getByRole('textbox', { name: 'Emails or UIDs' }),
    'foo@example.com'
  );
  await user.click(submitButton());

  expect(
    await screen.findByText(
      'The request for entries 1 to 1 of 1 failed, so their outcome is unknown. Error: Forbidden'
    )
  ).toBeInTheDocument();
});

it('announces a failed request as an alert', async () => {
  const user = userEvent.setup();
  disableAccounts.mockRejectedValue(new Error('Forbidden'));
  renderWithLocalizationProvider(<PageAccountDisable />);

  await user.type(
    screen.getByRole('textbox', { name: 'Emails or UIDs' }),
    'foo@example.com'
  );
  await user.click(submitButton());

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The request for entries 1 to 1 of 1 failed'
  );
});

it('shows an error and sends nothing when the file cannot be read', async () => {
  const user = userEvent.setup();
  renderWithLocalizationProvider(<PageAccountDisable />);
  const file = new File(['foo@example.com'], 'accounts.txt', {
    type: 'text/plain',
  });
  file.text = () => Promise.reject(new Error('NotReadableError'));

  await user.upload(screen.getByLabelText('Text file:'), file);
  await user.click(submitButton());

  expect(
    await screen.findByText(
      'Could not read the file, no entries were submitted: Error: NotReadableError'
    )
  ).toBeInTheDocument();
  expect(disableAccounts).not.toHaveBeenCalled();
  expect(submitButton()).toBeEnabled();
});
