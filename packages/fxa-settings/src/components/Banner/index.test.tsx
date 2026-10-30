/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Banner from './index';
import { BannerProps } from './interfaces';

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

  describe('live region', () => {
    it.each([
      ['success', 'status'],
      ['error', 'alert'],
    ] as const)(
      'inserts the %s banner empty, then adds its content',
      (type, role) => {
        const observer = new MutationObserver(() => {});
        observer.observe(document.body, { childList: true, subtree: true });
        render(<Banner {...getDefaultProps(type)} />);
        const records = observer.takeRecords();
        observer.disconnect();

        const liveRegion = screen.getByRole(role);
        const insertedAt = records.findIndex((r) =>
          Array.from(r.addedNodes).includes(liveRegion)
        );
        const contentAddedAt = records.findIndex(
          (r) => r.target === liveRegion && r.addedNodes.length > 0
        );
        expect(insertedAt).toBeGreaterThanOrEqual(0);
        expect(contentAddedAt).toBeGreaterThan(insertedAt);
        expect(liveRegion).toHaveTextContent('Heading');
      }
    );
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
});
