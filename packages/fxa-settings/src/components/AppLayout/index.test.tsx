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

  it('renders with integration prop and valid background image', async () => {
    const mockIntegration = {
      getCmsInfo: () =>
        ({
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
        }) as RelierCmsInfo,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration}>
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

  it('renders with integration prop and radial gradient background', async () => {
    const mockIntegration = {
      getCmsInfo: () =>
        ({
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
        }) as RelierCmsInfo,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration}>
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

  it('renders with integration prop but no background image when backgroundColor is missing', async () => {
    const mockIntegration = {
      getCmsInfo: () =>
        ({
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
        }) as RelierCmsInfo,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with integration prop but no background image when backgroundColor is invalid', async () => {
    const mockIntegration = {
      getCmsInfo: () =>
        ({
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
        }) as RelierCmsInfo,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with integration prop but no background image when getCmsInfo returns undefined', async () => {
    const mockIntegration = {
      getCmsInfo: () => undefined,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with integration prop but no background image when getCmsInfo is missing', async () => {
    const mockIntegration = {};

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    const appElement = screen.getByTestId('app');
    expect(appElement).not.toHaveStyle({ '--cms-bg': expect.any(String) });
  });

  it('renders with integration prop and uses CMS page title when available', async () => {
    const mockIntegration = {
      getCmsInfo: () =>
        ({
          name: 'Test App',
          clientId: 'test123',
          entrypoint: 'test',
          shared: {
            buttonColor: '#0078d4',
            logoUrl: 'https://example.com/logo.png',
            logoAltText: 'Test App Logo',
            pageTitle: 'CMS Custom Title',
          },
        }) as RelierCmsInfo,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration} title="Default Title">
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
  });

  it('renders with integration prop and falls back to default title when CMS page title is not available', async () => {
    const mockIntegration = {
      getCmsInfo: () =>
        ({
          name: 'Test App',
          clientId: 'test123',
          entrypoint: 'test',
          shared: {
            buttonColor: '#0078d4',
            logoUrl: 'https://example.com/logo.png',
            logoAltText: 'Test App Logo',
            // No pageTitle
          },
        }) as RelierCmsInfo,
    };

    renderWithLocalizationProvider(
      <AppLayout integration={mockIntegration} title="Default Title">
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');
  });
});
