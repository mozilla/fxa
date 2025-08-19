/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AppLayout from '.';
import {
  MOCK_CMS_INFO_VALID_LINEAR_BG,
  MOCK_CMS_INFO_VALID_RADIAL_BG,
  MOCK_CMS_INFO_NO_BG,
  MOCK_CMS_INFO_INVALID_BG_COLOR,
  MOCK_CMS_INFO_WITH_PAGE_TITLE,
  MOCK_CMS_INFO_HEADER_LOGO,
  MOCK_CMS_INFO_HEADER_LOGO_NO_ALT,
  MOCK_CMS_INFO_DEFAULT_LOGO,
  MOCK_CMS_INFO_HEADER_LOGO_WITH_OTHER_PROPS,
} from './mocks';
import { RelierCmsInfo } from '../../models';

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
    expect(document.title).toBe('Test Page Title | Mozilla accounts');
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
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_VALID_LINEAR_BG}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that the CSS custom property is set
    expect(screen.getByTestId('app')).toHaveStyle({
      '--cms-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    });
  });

  it('renders with integration prop and radial gradient background', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_VALID_RADIAL_BG}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that the CSS custom property is set
    expect(screen.getByTestId('app')).toHaveStyle({
      '--cms-bg': 'radial-gradient(circle, #ff6b6b, #4ecdc4)',
    });
  });

  it('renders with integration prop but no background image when backgroundColor is missing', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_NO_BG}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    expect(screen.getByTestId('app')).not.toHaveStyle({
      '--cms-bg': expect.any(String),
    });
  });

  it('renders with integration prop but no background image when backgroundColor is invalid', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_INVALID_BG_COLOR}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    expect(screen.getByTestId('app')).not.toHaveStyle({
      '--cms-bg': expect.any(String),
    });
  });

  it('renders with integration prop but no background image when getCmsInfo returns undefined', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    expect(screen.getByTestId('app')).not.toHaveStyle({
      '--cms-bg': expect.any(String),
    });
  });

  it('renders with integration prop but no background image when getCmsInfo is missing', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    screen.getByText('Hello, world!');

    // Check that no CSS custom property is set
    expect(screen.getByTestId('app')).not.toHaveStyle({
      '--cms-bg': expect.any(String),
    });
  });

  it('renders with integration prop and uses title over cms-shared-title when available', async () => {
    const expectedTitle = 'Custom Title';
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_WITH_PAGE_TITLE} title={expectedTitle}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    // explicit check for title. Title is concatenated with
    // ` | Mozilla accounts` in the `head` component
    expect(document.title).toBe(`${expectedTitle} | Mozilla accounts`);
    screen.getByText('Hello, world!');
  });

  it('renders with integration prop and uses cms-shared-title when title is not available', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_WITH_PAGE_TITLE} title={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(document.title).toBe('CMS Custom Title | Mozilla accounts');
    screen.getByText('Hello, world!');
  });

  it('renders CMS header logo when headerLogoUrl is provided', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_HEADER_LOGO}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const cmsLogo = screen.getByAltText('CMS Custom Logo');
    expect(cmsLogo).toBeInTheDocument();
    expect(cmsLogo).toHaveAttribute('src', 'https://example.com/cms-logo.png');
    expect(cmsLogo).toHaveClass('h-auto', 'w-[140px]', 'mx-0');
  });

  it('renders CMS header logo with default alt text when headerLogoAltText is not provided', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_HEADER_LOGO_NO_ALT}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const cmsLogo = screen.getByAltText('logo');
    expect(cmsLogo).toBeInTheDocument();
    expect(cmsLogo).toHaveAttribute('src', 'https://example.com/cms-logo.png');
  });

  it('renders default Mozilla logo when headerLogoUrl is not provided', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_DEFAULT_LOGO}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    // The default logo should have the mozLogo src (this will be the imported SVG)
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders default Mozilla logo when integration is not provided', async () => {
    renderWithLocalizationProvider(
      <AppLayout>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders default Mozilla logo when getCmsInfo returns undefined', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders default Mozilla logo when getCmsInfo is missing', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={undefined}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const defaultLogo = screen.getByAltText('Mozilla logo');
    expect(defaultLogo).toBeInTheDocument();
    expect(defaultLogo).toHaveAttribute('src');
  });

  it('renders CMS header logo when both headerLogoUrl and other CMS properties are provided', async () => {
    renderWithLocalizationProvider(
      <AppLayout cmsInfo={MOCK_CMS_INFO_HEADER_LOGO_WITH_OTHER_PROPS}>
        <p>Hello, world!</p>
      </AppLayout>
    );

    const cmsLogo = screen.getByAltText('CMS Custom Logo');
    expect(cmsLogo).toBeInTheDocument();
    expect(cmsLogo).toHaveAttribute('src', 'https://example.com/cms-logo.png');

    // Verify that only one logo is rendered
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  describe('snapshots', () => {
    it('renders correctly with CMS', () => {
      const mockCmsInfo: RelierCmsInfo = {
        name: 'Test App',
        clientId: 'test123',
        entrypoint: 'snapshot-test',
        shared: {
          headerLogoUrl: 'https://example.com/snapshot-cms-logo.png',
          headerLogoAltText: 'Snapshot CMS Custom Logo',
          buttonColor: '#0078d4',
          logoUrl: 'https://example.com/snapshot-cms-logo.png',
          logoAltText: 'Snapshot App Logo',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pageTitle: 'Snapshot App - Custom Title',
        },
      };

      const { container } = renderWithLocalizationProvider(
        <AppLayout cmsInfo={mockCmsInfo}>
          <p>Hello, world!</p>
        </AppLayout>
      );

      // title should have override
      const title = document.title;
      // header logo image
      const headerLogo = screen.getByRole('img', {
        name: mockCmsInfo.shared?.headerLogoAltText,
      });
      // div containing the background styling. We use cloneNode to remove
      // child content so the snap is only the background styles we want to ensure
      // are getting passed through
      const backgroundWrapper = container
        .querySelector('.flex-col')
        ?.cloneNode(false);

      expect(title).toMatchSnapshot('title');
      expect(headerLogo).toMatchSnapshot('header logo');
      expect(backgroundWrapper).toMatchSnapshot('background wrapper');
    });

    it('renders correctly without CMS', () => {
      const { container } = renderWithLocalizationProvider(
        <AppLayout>
          <p>Hello, world!</p>
        </AppLayout>
      );

      const title = document.title;
      // should be default header logo image
      const headerLogo = screen.getByRole('img', { name: 'Mozilla logo' });
      // div containing the background styling
      const backgroundWrapper = container
        .querySelector('.flex-col')
        ?.cloneNode(false);

      expect(title).toMatchSnapshot('title');
      expect(headerLogo).toMatchSnapshot('header logo');
      expect(backgroundWrapper).toMatchSnapshot('background wrapper');
    });
  });
});
