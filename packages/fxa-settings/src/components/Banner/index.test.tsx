/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      expect(
        screen.getByRole('img', { name: /Information/i })
      ).toBeInTheDocument();
    });

    it('renders the component with error type', () => {
      render(<Banner {...getDefaultProps('error')} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Error/i })).toBeInTheDocument();
    });

    it('renders the component with success type', () => {
      render(<Banner {...getDefaultProps('success')} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Success/i })).toBeInTheDocument();
    });

    it('renders the component with warning type', () => {
      render(<Banner {...getDefaultProps('warning')} />);
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
      expect(
        screen.getByRole('img', { name: 'Attention' })
      ).toBeInTheDocument();
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
  });
});
