/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubRow, { BackupCodesSubRow, BackupPhoneSubRow } from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

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
    renderWithLocalizationProvider(<SubRow {...defaultProps} isEnabled />);
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
    renderWithLocalizationProvider(<SubRow {...defaultProps} isEnabled />);
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
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('5 codes remaining')).toBeInTheDocument();
      expect(screen.getByText('Get new codes')).toBeInTheDocument();
    });

    it('renders description when showDescription is true', () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('5 codes remaining')).toBeInTheDocument();
      expect(screen.getByText('Get new codes')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is the safest recovery method if you canʼt use your mobile device or authenticator app.'
        )
      ).toBeInTheDocument();
    });

    it('calls onCtaClick when CTA button is clicked', () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
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
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('No codes available')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('calls onCtaClick when CTA button is clicked', () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
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
    renderWithLocalizationProvider(
      <BackupPhoneSubRow onCtaClick={jest.fn()} />
    );
    expect(screen.getByText('Backup recovery phone')).toBeInTheDocument();
    expect(
      screen.getByText('No recovery phone number available')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is the easier recovery method if you canʼt use your authenticator app.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Learn about SIM swap risk/)).toBeInTheDocument();
  });

  it('renders correctly when phone number is available and delete is not an option', () => {
    renderWithLocalizationProvider(<BackupPhoneSubRow {...defaultProps} />);
    expect(screen.getByText('Backup recovery phone')).toBeInTheDocument();
    expect(screen.getByText('••• ••• 1234')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'If you want to remove your backup recovery phone, add backup authentication codes or disable two-step authentication first to avoid getting locked out of your account.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Learn about SIM swap risk/)).toBeInTheDocument();
  });

  it('renders correctly when phone number is available and delete is an option', () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={jest.fn()} />
    );
    expect(screen.getByText('Backup recovery phone')).toBeInTheDocument();
    expect(screen.getByText('••• ••• 1234')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
    const deleteButtons = screen.getAllByTitle(/Remove/);
    expect(deleteButtons).toHaveLength(2);
    expect(
      screen.getByText(
        'This is the easier recovery method if you canʼt use your authenticator app.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Learn about SIM swap risk/)).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA button is clicked', () => {
    renderWithLocalizationProvider(<BackupPhoneSubRow {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(defaultProps.onCtaClick).toHaveBeenCalled();
  });

  // Jest is finding two buttons because they are conditionally rendered based on the container size.
  // While supported by major browsers, container queries are not natively supported or simulated by Jest
  // because it does not render components in a real browser-like environment with full CSS support.
  // Container queries, like other CSS layout features, depend on the actual rendering engine
  // to compute styles and apply layout rules based on parent container properties.
  it('renders delete button when onDeleteClick is provided', () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={jest.fn()} />
    );
    expect(screen.getAllByTitle(/Remove/)).toHaveLength(2);
  });

  it('calls onDeleteClick when either delete button is clicked', () => {
    const onDeleteClick = jest.fn();
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={onDeleteClick} />
    );
    fireEvent.click(screen.getAllByTitle(/Remove/)[0]);
    fireEvent.click(screen.getAllByTitle(/Remove/)[1]);
    expect(onDeleteClick).toHaveBeenCalledTimes(2);
  });
});
