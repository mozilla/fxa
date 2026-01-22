/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import CardHeader from '.';
import {
  MOCK_DEFAULT_HEADING_FTL_ID,
  MOCK_CUSTOM_HEADING_FTL_ID,
  MOCK_HEADING,
  MOCK_SERVICE_NAME,
  MOCK_CMS_LOGO_URL,
  MOCK_CMS_LOGO_ALT_TEXT,
  MOCK_CMS_HEADLINE,
  MOCK_CMS_DESCRIPTION,
} from './mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

describe('CardHeader', () => {
  // TODO: Enable testing l10n with id passed as prop in FXA-6462

  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when no serviceName is provided', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingWithDefaultServiceFtlId={MOCK_DEFAULT_HEADING_FTL_ID}
        headingWithCustomServiceFtlId={MOCK_CUSTOM_HEADING_FTL_ID}
        headingText={MOCK_HEADING}
      />
    );
    // testAllL10n(screen, bundle);

    expect(
      screen.getByRole('heading', {
        name: `${MOCK_HEADING} to continue to account settings`,
      })
    ).toBeInTheDocument();
  });

  it('renders as expected when a serviceName is provided', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingWithDefaultServiceFtlId={MOCK_DEFAULT_HEADING_FTL_ID}
        headingWithCustomServiceFtlId={MOCK_CUSTOM_HEADING_FTL_ID}
        headingText={MOCK_HEADING}
        serviceName={MOCK_SERVICE_NAME}
      />
    );

    expect(
      screen.getByRole('heading', {
        name: `${MOCK_HEADING} to continue to ${MOCK_SERVICE_NAME}`,
      })
    ).toBeInTheDocument();
  });

  it('renders CMS header with all CMS props', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsLogoUrl={MOCK_CMS_LOGO_URL}
        cmsLogoAltText={MOCK_CMS_LOGO_ALT_TEXT}
        cmsHeadline={MOCK_CMS_HEADLINE}
        cmsDescription={MOCK_CMS_DESCRIPTION}
      />
    );
    expect(screen.getByAltText(MOCK_CMS_LOGO_ALT_TEXT)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: MOCK_CMS_HEADLINE })
    ).toBeInTheDocument();
    expect(screen.getByText(MOCK_CMS_DESCRIPTION)).toBeInTheDocument();
  });

  it('renders CMS header with only headline', () => {
    renderWithLocalizationProvider(
      <CardHeader headingText={MOCK_HEADING} cmsHeadline={MOCK_CMS_HEADLINE} />
    );
    expect(
      screen.getByRole('heading', { name: MOCK_CMS_HEADLINE })
    ).toBeInTheDocument();
  });

  it('renders CMS header with only description', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsDescription={MOCK_CMS_DESCRIPTION}
      />
    );
    expect(screen.getByText(MOCK_CMS_DESCRIPTION)).toBeInTheDocument();
  });

  it('renders CMS header with only logo', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsLogoUrl={MOCK_CMS_LOGO_URL}
        cmsLogoAltText={MOCK_CMS_LOGO_ALT_TEXT}
      />
    );
    expect(screen.getByAltText(MOCK_CMS_LOGO_ALT_TEXT)).toBeInTheDocument();
  });

  it('renders CMS header with default font size', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsHeadline={MOCK_CMS_HEADLINE}
        cmsHeadlineFontSize="default"
      />
    );
    const heading = screen.getByRole('heading', { name: MOCK_CMS_HEADLINE });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('card-header-cms', 'text-xl');
  });

  it('renders CMS header with medium font size', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsHeadline={MOCK_CMS_HEADLINE}
        cmsHeadlineFontSize="medium"
      />
    );
    const heading = screen.getByRole('heading', { name: MOCK_CMS_HEADLINE });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('card-header-cms', 'text-xxl');
  });

  it('renders CMS header with large font size', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsHeadline={MOCK_CMS_HEADLINE}
        cmsHeadlineFontSize="large"
      />
    );
    const heading = screen.getByRole('heading', { name: MOCK_CMS_HEADLINE });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('card-header-cms', 'text-xxxl');
  });

  it('renders CMS header with custom text color', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsHeadline={MOCK_CMS_HEADLINE}
        cmsHeadlineTextColor="#592ACB"
      />
    );
    const heading = screen.getByRole('heading', { name: MOCK_CMS_HEADLINE });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveStyle({ color: '#592ACB' });
  });

  it('renders CMS header with both font size and text color', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingText={MOCK_HEADING}
        cmsHeadline={MOCK_CMS_HEADLINE}
        cmsHeadlineFontSize="large"
        cmsHeadlineTextColor="#C50042"
      />
    );
    const heading = screen.getByRole('heading', { name: MOCK_CMS_HEADLINE });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('card-header-cms', 'text-xxxl');
    expect(heading).toHaveStyle({ color: '#C50042' });
  });

  it('renders CMS header with default font size when fontSize is undefined', () => {
    renderWithLocalizationProvider(
      <CardHeader headingText={MOCK_HEADING} cmsHeadline={MOCK_CMS_HEADLINE} />
    );
    const heading = screen.getByRole('heading', { name: MOCK_CMS_HEADLINE });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-xl');
  });
});
