/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Temporary while the Nova theme ships behind novaDesignSystem; removed with the flag.

import React from 'react';
import { render, screen } from '@testing-library/react';
import { isNovaTheme, sized, stripCmsColors, withNova } from './nova';
import type { RelierCmsInfo } from '../models/integrations';

const Legacy = () => <span>legacy</span>;
const Nova = () => <span>nova</span>;
const Swapped = withNova(Legacy, Nova);

describe('withNova', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('renders the legacy component without the Nova theme', () => {
    render(<Swapped />);
    expect(isNovaTheme()).toBe(false);
    expect(screen.getByText('legacy')).toBeInTheDocument();
  });

  it('renders the Nova component under data-theme="nova"', () => {
    document.documentElement.dataset.theme = 'nova';
    render(<Swapped />);
    expect(isNovaTheme()).toBe(true);
    expect(screen.getByText('nova')).toBeInTheDocument();
  });
});

describe('sized', () => {
  const Svg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="svg" {...props} />
  );

  it('renders at 24px by default', () => {
    const Sized = sized(Svg);
    render(<Sized />);
    const svg = screen.getByTestId('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('adds no dimensions when size is null', () => {
    const Sized = sized(Svg, undefined, null);
    render(<Sized />);
    const svg = screen.getByTestId('svg');
    expect(svg).not.toHaveAttribute('width');
    expect(svg).not.toHaveAttribute('height');
  });

  it('keeps dimensions the caller sets', () => {
    const Sized = sized(Svg, undefined, 16);
    render(<Sized width={40} />);
    const svg = screen.getByTestId('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('keeps the caller className and appends its own', () => {
    const Sized = sized(Svg, 'nova:text-icon-success');
    render(<Sized className="mt-1" />);
    expect(screen.getByTestId('svg')).toHaveClass(
      'mt-1',
      'nova:text-icon-success'
    );
  });
});

describe('stripCmsColors', () => {
  const cmsInfo = {
    name: '123Done',
    clientId: 'dcdb5ae7add825d2',
    entrypoint: 'purple',
    shared: {
      buttonColor: '#4845D2',
      headlineTextColor: '#FF0000',
      headlineFontSize: 'large',
      illustrationsTheme: { primary: '#00FF00', hideClouds: true },
      logoUrl: 'https://example.com/logo.svg',
      logoAltText: '123Done logo',
      pageTitle: '123Done',
      backgrounds: { header: 'red' },
      featureFlags: { syncHidePromoAfterLogin: true },
    },
    EmailFirstPage: { headline: 'Make Space for What Matters' },
  } as unknown as RelierCmsInfo;

  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('returns the CMS config unchanged without the Nova theme', () => {
    expect(stripCmsColors(cmsInfo)).toBe(cmsInfo);
  });

  it('drops only the CMS colors under the Nova theme', () => {
    document.documentElement.dataset.theme = 'nova';
    expect(stripCmsColors(cmsInfo)).toEqual({
      ...cmsInfo,
      shared: {
        ...cmsInfo.shared,
        buttonColor: undefined,
        headlineTextColor: undefined,
        illustrationsTheme: undefined,
      },
    });
  });

  it('passes through a missing config or a config with no shared section', () => {
    document.documentElement.dataset.theme = 'nova';
    expect(stripCmsColors(undefined)).toBeUndefined();
    const noShared = {} as RelierCmsInfo;
    expect(stripCmsColors(noShared)).toBe(noShared);
  });
});
