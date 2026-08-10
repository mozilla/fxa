/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { ButtonDownloadRecoveryKey, getFilename } from '.';
import { downloadTextFile } from '../../lib/download';
import * as Sentry from '@sentry/browser';
import { MOCK_EMAIL } from '../../pages/mocks';

jest.mock('../../lib/download', () => ({
  downloadTextFile: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

const MOCK_RECOVERY_KEY = 'WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ';

const renderButton = (navigateForward?: () => void) =>
  renderWithLocalizationProvider(
    <ButtonDownloadRecoveryKey
      recoveryKeyValue={MOCK_RECOVERY_KEY}
      email={MOCK_EMAIL}
      {...{ navigateForward }}
    />
  );

const getDownloadButton = () =>
  screen.getByRole('button', { name: 'Download and continue' });

const renderAndClickDownload = async (navigateForward?: () => void) => {
  const user = userEvent.setup();
  renderButton(navigateForward);
  await user.click(getDownloadButton());
};

const mockDownloadFailure = () =>
  jest.mocked(downloadTextFile).mockImplementationOnce(() => {
    throw new Error('download failed');
  });

beforeEach(() => {
  jest.clearAllMocks();
  // clearAllMocks leaves implementations queued; reset so an unconsumed
  // failure cannot leak into the next test.
  jest.mocked(downloadTextFile).mockReset();
});

describe('ButtonDownloadRecoveryKey', () => {
  it('renders the download button', () => {
    renderButton();

    expect(getDownloadButton()).toBeInTheDocument();
  });

  it('tags the button for Glean click metrics', () => {
    renderButton();

    expect(getDownloadButton()).toHaveAttribute(
      'data-glean-id',
      'account_pref_recovery_key_download'
    );
  });

  it('downloads the recovery key as a text file when clicked', async () => {
    await renderAndClickDownload();

    const today = new Date().toISOString().split('T')[0];
    expect(downloadTextFile).toHaveBeenCalledWith(
      MOCK_RECOVERY_KEY,
      `Mozilla-Recovery-Key_${today}_${MOCK_EMAIL}.txt`
    );
  });

  it('shows an inline error banner when the download throws', async () => {
    mockDownloadFailure();

    await renderAndClickDownload();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sorry, there was a problem downloading your account recovery key.'
    );
  });

  it('reports the failure to Sentry when the download throws', async () => {
    mockDownloadFailure();

    await renderAndClickDownload();

    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });

  it('does not navigate forward when the download throws', async () => {
    mockDownloadFailure();
    const navigateForward = jest.fn();

    await renderAndClickDownload(navigateForward);

    expect(navigateForward).not.toHaveBeenCalled();
  });

  it('navigates forward when the download succeeds', async () => {
    const navigateForward = jest.fn();

    await renderAndClickDownload(navigateForward);

    expect(navigateForward).toHaveBeenCalledTimes(1);
  });

  it('clears a previous error once a retry succeeds', async () => {
    const user = userEvent.setup();
    mockDownloadFailure();
    renderButton();

    await user.click(getDownloadButton());
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(getDownloadButton());

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders no error banner before any download is attempted', () => {
    renderButton();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('getFilename', () => {
  const MOCK_DATE = '2026-08-10';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(`${MOCK_DATE}T12:00:00.000Z`));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds the filename from the prefix, current date and email', () => {
    expect(getFilename(MOCK_EMAIL)).toBe(
      `Mozilla-Recovery-Key_${MOCK_DATE}_${MOCK_EMAIL}.txt`
    );
  });

  it('replaces characters that are unsafe in a filename', () => {
    expect(getFilename('a/b@example.com')).toBe(
      `Mozilla-Recovery-Key_${MOCK_DATE}_a_b@example.com.txt`
    );
  });

  it('truncates a very long email but keeps the prefix, date and extension', () => {
    const longEmail =
      'supercalifragilisticexpialidocious@marypoppins.superfan.conference.com';
    const filename = getFilename(longEmail);

    expect(filename).toBe(
      `Mozilla-Recovery-Key_${MOCK_DATE}_supercalifragilisticexpialidocious@mary.txt`
    );
  });
});
