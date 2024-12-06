/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubRow, { BackupCodesSubRow, BackupPhoneSubRow } from './index';

describe('SubRow', () => {
  const defaultProps = {
    ctaGleanId: 'glean-test',
    ctaMessage: 'Get new codes',
    icon: <div>Icon</div>,
    idPrefix: 'test',
    localizedDescription: 'More info message',
    message: <div>Message</div>,
    onCtaClick: jest.fn(),
    localizedRowTitle: 'Backup authentication codes',
  };

  it('renders correctly when available', () => {
    render(<SubRow {...defaultProps} isEnabled />);
    expect(screen.getByText('Backup authentication codes')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Get new codes')).toBeInTheDocument();
    expect(screen.getByText('More info message')).toBeInTheDocument();
  });

  it('renders correctly when unavailable', () => {
    render(<SubRow {...defaultProps} isEnabled={false} />);
    expect(screen.getByText('Backup authentication codes')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    const cta = screen.getByRole('button', { name: 'Get new codes' });
    expect(cta).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA button is clicked', () => {
    render(<SubRow {...defaultProps} isEnabled />);
    fireEvent.click(screen.getByText('Get new codes'));
    expect(defaultProps.onCtaClick).toHaveBeenCalled();
  });
});

describe('BackupCodesSubRow', () => {
  describe('when codes available', () => {
    const defaultProps = {
      numCodesAvailable: 5,
      onCtaClick: jest.fn(),
    };

    it('renders correctly when codes available', () => {
      render(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('5 codes remaining')).toBeInTheDocument();
      expect(screen.getByText('Get new codes')).toBeInTheDocument();
    });

    it('renders description when showDescription is true', () => {
      render(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('5 codes remaining')).toBeInTheDocument();
      expect(screen.getByText('Get new codes')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is the safest recovery method if you canʼt access your mobile device or authenticator app.'
        )
      ).toBeInTheDocument();
    });

    it('calls onCtaClick when CTA button is clicked', () => {
      render(<BackupCodesSubRow {...defaultProps} />);
      fireEvent.click(screen.getByText('Get new codes'));
      expect(defaultProps.onCtaClick).toHaveBeenCalled();
    });
  });

  describe('when codes unavailable', () => {
    const defaultProps = {
      numCodesAvailable: 0,
      onCtaClick: jest.fn(),
    };
    it('renders correctly when codes unavailable', () => {
      render(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('No codes available')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('calls onCtaClick when CTA button is clicked', () => {
      render(<BackupCodesSubRow {...defaultProps} />);
      fireEvent.click(screen.getByText('Add'));
      expect(defaultProps.onCtaClick).toHaveBeenCalled();
    });
  });
});

describe('BackupPhoneSubRow', () => {
  const defaultProps = {
    onCtaClick: jest.fn(),
    phoneNumber: '555-555-1234',
  };

  it('renders correctly when phone number unavailable', () => {
    render(<BackupPhoneSubRow onCtaClick={jest.fn()} />);
    expect(screen.getByText('Backup recovery phone')).toBeInTheDocument();
    expect(
      screen.getByText('No recovery phone number available')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders correctly when phone number available', () => {
    render(<BackupPhoneSubRow {...defaultProps} />);
    expect(screen.getByText('Backup recovery phone')).toBeInTheDocument();
    expect(screen.getByText('••• ••• 1234')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
  });

  it('renders description when showDescription is true', () => {
    render(<BackupPhoneSubRow {...defaultProps} showExtraInfo="description" />);
    expect(screen.getByText('Backup recovery phone')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is the easier method if you canʼt use your authenticator app, because you will receive an instant recovery code via text message, eliminating the need to save backup authentication codes.'
      )
    ).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA button is clicked', () => {
    render(<BackupPhoneSubRow {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(defaultProps.onCtaClick).toHaveBeenCalled();
  });

  // Jest is finding two buttons because they are conditionally rendered based on the container size
  // Container queries are not natively supported or simulated by Jest
  // because it does not render components in a real browser-like environment with full CSS support.
  // Container queries, like other CSS layout features, depend on the actual rendering engine (like Chrome or Firefox)
  // to compute styles and apply layout rules based on parent container properties.
  it('renders delete button when onDeleteClick is provided', () => {
    render(<BackupPhoneSubRow {...defaultProps} onDeleteClick={jest.fn()} />);
    expect(screen.getAllByTitle(/Remove/)).toHaveLength(2);
  });

  it('calls onDeleteClick when either delete button is clicked', () => {
    const onDeleteClick = jest.fn();
    render(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={onDeleteClick} />
    );
    fireEvent.click(screen.getAllByTitle(/Remove/)[0]);
    fireEvent.click(screen.getAllByTitle(/Remove/)[1]);
    expect(onDeleteClick).toHaveBeenCalledTimes(2);
  });
});
