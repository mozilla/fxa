/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Banner from './index';
import { BannerProps } from './interfaces';
import GleanMetrics from '../../lib/glean';

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: { banner: { view: jest.fn() } },
}));

describe('Banner Component', () => {
  const getDefaultProps = (type: BannerProps['type'] = 'info') => {
    return {
      type,
      content: {
        localizedHeading: 'Heading',
        localizedDescription: 'This is a description',
      },
    };
  };

  describe('banner types', () => {
    it('renders the component with info type', () => {
      render(<Banner {...getDefaultProps()} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders the component with error type', () => {
      render(<Banner {...getDefaultProps('error')} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders the component with success type', () => {
      render(<Banner {...getDefaultProps('success')} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders the component with warning type', () => {
      render(<Banner {...getDefaultProps('warning')} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });
  });

  describe('dismiss button', () => {
    it('renders a close button if dismissButton is provided', () => {
      const dismissButton = { action: jest.fn() };
      render(<Banner {...getDefaultProps()} {...{ dismissButton }} />);
      expect(
        screen.queryByRole('button', { name: /Close banner/i })
      ).toBeInTheDocument();
    });

    it('calls dismissButton action when close button is clicked', async () => {
      const dismissButton = { action: jest.fn() };
      render(<Banner {...getDefaultProps()} {...{ dismissButton }} />);
      fireEvent.click(screen.getByRole('button', { name: /Close banner/i }));
      await waitFor(() => expect(dismissButton.action).toHaveBeenCalled());
    });

    it('does not render close button if dismissButton is not provided', () => {
      render(<Banner {...getDefaultProps()} />);
      expect(
        screen.queryByRole('button', { name: /Close banner/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('optional glean metrics', () => {
    it('passes the dismissButton gleanId to the dismiss button', () => {
      const dismissButton = { action: jest.fn(), gleanId: 'dismiss-glean-id' };
      render(<Banner {...getDefaultProps()} {...{ dismissButton }} />);
      expect(
        screen.getByRole('button', { name: /Close banner/i })
      ).toHaveAttribute('data-glean-id', 'dismiss-glean-id');
    });

    it('maps an external link gleanId to the data-glean-id attribute', () => {
      renderWithLocalizationProvider(
        <Banner
          {...getDefaultProps()}
          link={{
            url: 'https://example.com/help',
            localizedText: 'Learn more',
            gleanId: 'link-glean-id',
          }}
        />
      );
      expect(screen.getByRole('link', { name: /Learn more/i })).toHaveAttribute(
        'data-glean-id',
        'link-glean-id'
      );
    });
  });

  describe('view metrics', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('records a banner view on mount when gleanId is set', () => {
      render(
        <Banner {...getDefaultProps()} gleanId="passkey_signin_trouble" />
      );
      expect(GleanMetrics.banner.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.banner.view).toHaveBeenCalledWith({
        event: { reason: 'passkey_signin_trouble' },
      });
    });

    it('records no banner view without gleanId', () => {
      render(<Banner {...getDefaultProps()} />);
      expect(GleanMetrics.banner.view).not.toHaveBeenCalled();
    });

    it('still renders when the view call throws', () => {
      (GleanMetrics.banner.view as jest.Mock).mockImplementationOnce(() => {
        throw new Error('glean failed');
      });
      render(
        <Banner {...getDefaultProps()} gleanId="passkey_signin_trouble" />
      );
      expect(screen.getByText('Heading')).toBeInTheDocument();
    });
  });
});
