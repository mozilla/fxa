/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { LinkExpired, LinkExpiredProps } from '.';
import { ResendStatus } from 'fxa-settings/src/lib/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

const mockResendHandler = jest.fn().mockResolvedValue(true);

const mockedProps: LinkExpiredProps = {
  headingText: 'Some heading',
  headingTextFtlId: 'mock-heading-id',
  messageText: 'Some text',
  messageFtlId: 'mock-message-id',
  resendLinkHandler: mockResendHandler,
  resendStatus: ResendStatus.none,
};

describe('LinkExpired', () => {
  it('renders the component as expected with mocked props', () => {
    renderWithLocalizationProvider(<LinkExpired {...mockedProps} />);

    screen.getByRole('heading', {
      name: 'Some heading',
    });
    screen.getByText('Some text');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });
  // TODO test CTA
});
