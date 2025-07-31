/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AppLayout from '.';
import { RelierCmsInfo } from '../../models/integrations';

describe('<AppLayout />', () => {
  it('renders as expected with children', async () => {
    renderWithLocalizationProvider(
      <AppLayout>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
    screen.getByRole('main');

    const mozLink = screen.getByRole('link');
    expect(mozLink).toHaveAttribute('rel', 'author');
    expect(mozLink).toHaveAttribute(
      'href',
      'https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral'
    );
    screen.getByAltText('Mozilla logo');
  });

  it('renders with title prop', async () => {
    renderWithLocalizationProvider(
      <AppLayout title="Test Page Title">
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
  });

  it('renders with widthClass prop', async () => {
    renderWithLocalizationProvider(
      <AppLayout widthClass="card-xl">
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
  });

  it('renders with cmsInfo prop and valid background image', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
        backgroundColor:
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pageTitle: 'Test App - Custom Title',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that the CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).toHaveStyle({
      '--cms-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    });
  });

  it('renders with cmsInfo prop and radial gradient background', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
        backgroundColor: 'radial-gradient(circle, #ff6b6b, #4ecdc4)',
        pageTitle: 'Test App - Custom Title',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that the CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).toHaveStyle({
      '--cms-bg': 'radial-gradient(circle, #ff6b6b, #4ecdc4)',
    });
  });

  it('renders with cmsInfo prop but no background image when backgroundColor is missing', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
        pageTitle: 'Test App - Custom Title',
        // No backgroundColor
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with cmsInfo prop but no background image when backgroundColor is invalid', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
        backgroundColor: 'solid-color-red', // Not a valid background-image value
        pageTitle: 'Test App - Custom Title',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with cmsInfo prop but no background image when cmsInfo is undefined', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with cmsInfo prop but no background image when cmsInfo is missing', async () => {
    renderWithLocalizationProvider(
      <AppLayout>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with cmsInfo prop and uses CMS page title when available', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
        pageTitle: 'CMS Custom Title',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo} title="Default Title">
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
  });

  it('renders with cmsInfo prop and falls back to default title when CMS page title is not available', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
        // No pageTitle
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo} title="Default Title">
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
  });

  it('renders CMS header logo when headerLogoUrl is provided', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        headerLogoUrl: 'https://example.com/cms-logo.png',
        headerLogoAltText: 'CMS Custom Logo',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const cmsLogo = screen.getByAltText('CMS Custom Logo');
    expect(cmsLogo).toBeInTheDocument();
    expect(cmsLogo).toHaveAttribute('src', 'https://example.com/cms-logo.png');
    expect(cmsLogo).toHaveClass('h-auto', 'w-[140px]', 'mx-auto', 'mobileLandscape:mx-0');
  });

  it('renders CMS header logo with default alt text when headerLogoAltText is not provided', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        headerLogoUrl: 'https://example.com/cms-logo.png',
        // No headerLogoAltText
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const cmsLogo = screen.getByAltText('logo');
    expect(cmsLogo).toBeInTheDocument();
    expect(cmsLogo).toHaveAttribute('src', 'https://example.com/cms-logo.png');
  });

  it('renders default Mozilla logo when headerLogoUrl is not provided', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        // No headerLogoUrl
        buttonColor: '#0078d4',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    // The default logo should have the mozLogo src (this will be the imported SVG)
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders default Mozilla logo when cmsInfo is not provided', async () => {
    renderWithLocalizationProvider(
      <AppLayout>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders default Mozilla logo when cmsInfo is undefined', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders default Mozilla logo when cmsInfo is missing', async () => {
    renderWithLocalizationProvider(
      <AppLayout>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders CMS header logo when both headerLogoUrl and other CMS properties are provided', async () => {
    const mockCmsInfo = {
      name: 'Test App',
      clientId: 'test123',
      entrypoint: 'test',
      shared: {
        headerLogoUrl: 'https://example.com/cms-logo.png',
        headerLogoAltText: 'CMS Custom Logo',
        buttonColor: '#0078d4',
        logoUrl: 'https://example.com/other-logo.png',
        logoAltText: 'Other Logo',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pageTitle: 'Test App - Custom Title',
      },
    } as RelierCmsInfo;

    renderWithLocalizationProvider(
      <AppLayout cmsInfo={mockCmsInfo}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const cmsLogo = screen.getByAltText('CMS Custom Logo');
    expect(cmsLogo).toBeInTheDocument();
    expect(cmsLogo).toHaveAttribute('src', 'https://example.com/cms-logo.png');

    // Verify that only one logo is rendered
    const allImages = screen.getAllByRole('img');
    expect(allImages).toHaveLength(1);
  });
});
