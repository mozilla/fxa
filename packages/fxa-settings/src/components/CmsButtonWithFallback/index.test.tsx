/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CmsButtonWithFallback from '.';

describe('CmsButtonWithFallback', () => {
  it('renders as default button when no buttonColor is provided', () => {
    const { container } = render(
      <CmsButtonWithFallback>Default Button</CmsButtonWithFallback>
    );

    const button = screen.getByRole('button', { name: 'Default Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('cta-primary', 'cta-xl');
    expect(button).not.toHaveClass('cta-primary-cms');
    expect(container).toMatchSnapshot();
  });

  it('renders as CMS button when buttonColor is provided', () => {
    const { container } = render(
      <CmsButtonWithFallback buttonColor="#592ACB">
        CMS Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button', { name: 'CMS Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('cta-primary-cms', 'cta-xl');
    expect(button).not.toHaveClass('cta-primary');
    expect(container).toMatchSnapshot();
  });

  it('uses buttonText when provided', () => {
    render(
      <CmsButtonWithFallback buttonText="Custom Text">
        This should not show
      </CmsButtonWithFallback>
    );

    expect(
      screen.getByRole('button', { name: 'Custom Text' })
    ).toBeInTheDocument();
    expect(screen.queryByText('This should not show')).not.toBeInTheDocument();
  });

  it('falls back to children when buttonText is not provided', () => {
    render(<CmsButtonWithFallback>Fallback Text</CmsButtonWithFallback>);

    expect(
      screen.getByRole('button', { name: 'Fallback Text' })
    ).toBeInTheDocument();
  });

  it('falls back to "Continue" when neither buttonText nor children are provided', () => {
    render(<CmsButtonWithFallback />);

    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });

  it('applies CMS styles when buttonColor is provided', () => {
    const buttonColor = '#FF5733';
    render(
      <CmsButtonWithFallback buttonColor={buttonColor}>
        CMS Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      '--cta-bg': buttonColor,
      '--cta-border': buttonColor,
      '--cta-active': buttonColor,
      '--cta-disabled': buttonColor,
    });
  });

  it('applies expected CMS styles when buttonColor is provided and button is disabled', () => {
    const buttonColor = '#FF5733';
    render(
      <CmsButtonWithFallback buttonColor={buttonColor} disabled={true}>
        CMS Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      '--cta-bg': buttonColor,
      '--cta-border': buttonColor,
      '--cta-active': buttonColor,
      '--cta-disabled': buttonColor,
      opacity: '0.5',
    });
  });

  it('passes through additional props to the button element', () => {
    const handleClick = jest.fn();
    render(
      <CmsButtonWithFallback
        onClick={handleClick}
        disabled={true}
        data-testid="test-button"
        aria-label="Test button"
      >
        Test Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button', { name: 'Test button' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-testid', 'test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('handles click events correctly', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <CmsButtonWithFallback onClick={handleClick}>
        Clickable Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button', { name: 'Clickable Button' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('combines custom className with default classes', () => {
    render(
      <CmsButtonWithFallback className="custom-class">
        Custom Class Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cta-primary', 'cta-xl', 'custom-class');
  });

  it('combines custom className with CMS classes', () => {
    const { container } = render(
      <CmsButtonWithFallback buttonColor="#592ACB" className="custom-cms-class">
        CMS Custom Class Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cta-primary-cms', 'cta-xl', 'custom-cms-class');
    expect(container).toMatchSnapshot();
  });

  it('merges custom style with CMS styles', () => {
    const customStyle = { background: 'red', fontSize: '16px' };
    const buttonColor = '#592ACB';

    render(
      <CmsButtonWithFallback buttonColor={buttonColor} style={customStyle}>
        Styled CMS Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      '--cta-bg': buttonColor,
      '--cta-border': buttonColor,
      '--cta-active': buttonColor,
      '--cta-disabled': buttonColor,
      background: 'red',
      fontSize: '16px',
    });
  });

  it('handles empty buttonColor string as non-CMS', () => {
    render(
      <CmsButtonWithFallback buttonColor="">
        Empty Color Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cta-primary', 'cta-xl');
    expect(button).not.toHaveClass('cta-primary-cms');
  });

  it('handles null buttonColor as non-CMS', () => {
    render(
      <CmsButtonWithFallback buttonColor={null as any}>
        Null Color Button
      </CmsButtonWithFallback>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('cta-primary', 'cta-xl');
    expect(button).not.toHaveClass('cta-primary-cms');
  });
});
