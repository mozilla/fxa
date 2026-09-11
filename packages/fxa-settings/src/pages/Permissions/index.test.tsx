/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Permissions, { PermissionRow, viewName } from '.';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const onContinue = jest.fn();
const onCancel = jest.fn();

const renderPermissions = (
  rows: PermissionRow[] = [
    { scope: 'profile:email', value: 'user@example.com' },
  ]
) =>
  renderWithLocalizationProvider(
    <Permissions serviceName="321Done" {...{ rows, onContinue, onCancel }} />
  );

beforeEach(() => {
  jest.clearAllMocks();
});

it('emits the page view event', () => {
  renderPermissions();
  expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
});

it('names the relying party in the heading', () => {
  renderPermissions();
  expect(
    screen.getByRole('heading', { name: '321Done wants access to:' })
  ).toBeInTheDocument();
});

it('renders a row per scope, with its value', () => {
  renderPermissions([
    { scope: 'profile:email', value: 'user@example.com' },
    { scope: 'profile:display_name', value: 'Test User' },
  ]);

  expect(
    screen.getByTestId('permissions-row-profile-email')
  ).toBeInTheDocument();
  expect(
    screen.getByTestId('permissions-row-profile-display_name')
  ).toBeInTheDocument();
  expect(screen.getByText('Email address')).toBeInTheDocument();
  expect(screen.getByText('user@example.com')).toBeInTheDocument();
  expect(screen.getByText('Display name')).toBeInTheDocument();
  expect(screen.getByText('Test User')).toBeInTheDocument();
});

it('renders only the scopes it was given', () => {
  renderPermissions([{ scope: 'profile:email', value: 'user@example.com' }]);
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(
    screen.queryByTestId('permissions-row-profile-display_name')
  ).not.toBeInTheDocument();
});

it('says Not set when the account has no value for a scope', () => {
  renderPermissions([{ scope: 'profile:display_name', value: undefined }]);
  expect(screen.getByText('Display name')).toBeInTheDocument();
  expect(screen.getByText('Not set')).toBeInTheDocument();
});

it('calls onContinue when the user continues', () => {
  renderPermissions();
  fireEvent.click(screen.getByTestId('permissions-continue-button'));
  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(onCancel).not.toHaveBeenCalled();
});

it('calls onCancel when the user cancels', () => {
  renderPermissions();
  fireEvent.click(screen.getByTestId('permissions-cancel-button'));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onContinue).not.toHaveBeenCalled();
});

it('offers no way to de-select a scope', () => {
  renderPermissions([
    { scope: 'profile:email', value: 'user@example.com' },
    { scope: 'profile:display_name', value: 'Test User' },
  ]);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});
