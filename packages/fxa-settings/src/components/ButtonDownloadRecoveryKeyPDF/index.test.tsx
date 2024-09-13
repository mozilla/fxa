/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { ButtonDownloadRecoveryKeyPDF, getFilename } from '.';
import { logViewEvent } from '../../lib/metrics';
import { TextEncoder } from 'util';
import { MOCK_EMAIL } from '../../pages/mocks';

Object.assign(global, { TextEncoder });

const recoveryKeyValue = 'WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ';
const viewName = 'settings.account-recovery';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

jest.mock('@react-pdf/renderer', () => {
  return {
    pdf: jest.fn().mockResolvedValue({
      toBlob: jest.fn().mockResolvedValue(new Blob()),
      updateContainer: jest.fn(),
    }),
  };
});

beforeAll(() => {
  window.URL.createObjectURL = jest.fn();
});

describe('ButtonDownloadRecoveryKeyPDF', () => {
  it('renders button as expected', () => {
    renderWithLocalizationProvider(
      <ButtonDownloadRecoveryKeyPDF
        {...{ recoveryKeyValue, viewName }}
        email={MOCK_EMAIL}
      />
    );
    screen.getByText('Download and continue');
  });

  // Content of downloaded file is tested in Playwright tests
  // including validating that the expected key is included and matches the key in the DataBlock
  it('emits a metrics event when the link is clicked', () => {
    renderWithLocalizationProvider(
      <ButtonDownloadRecoveryKeyPDF
        {...{ recoveryKeyValue, viewName }}
        email={MOCK_EMAIL}
      />
    );
    const downloadButton = screen.getByText('Download and continue');
    fireEvent.click(downloadButton);

    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'recovery-key.download-option'
    );
  });
});

describe('getFilename function', () => {
  it('sets the filename as expected with a reasonably-sized email', () => {
    const filename = getFilename(MOCK_EMAIL);

    // Test the date formatting
    const mockDateObject = '2023-05-10T17:00:40.722Z';
    const mockDateFunctionOutput = new Date(mockDateObject)
      .toISOString()
      .split('T')[0];
    const mockExpectedDate = '2023-05-10';

    expect(mockDateFunctionOutput).toEqual(mockExpectedDate);

    // Filename should be created from current date
    const date = new Date().toISOString().split('T')[0];

    expect(filename).toContain(
      `Mozilla-Recovery-Key_${date}_${MOCK_EMAIL}.pdf`
    );
    expect(filename.length).toBeLessThanOrEqual(75);
  });

  it('sets the filename with a truncated email as expected when the email is very long', () => {
    const longEmail =
      'supercalifragilisticexpialidocious@marypoppins.superfan.conference.com';
    const filename = getFilename(longEmail);

    // Filename should be created from current date
    const date = new Date().toISOString().split('T')[0];

    const fullFilename = `Mozilla-Recovery-Key_${date}_${longEmail}.pdf`;
    // Full filename would be longer than 75 char if not truncated
    expect(fullFilename.length).toBeGreaterThan(75);

    // Actual filename is truncated
    expect(filename.length).toBeLessThanOrEqual(75);
    // filename still contains full prefix and date
    expect(filename).toContain('Mozilla-Recovery-Key');
    expect(filename).toContain(date);
  });
});
