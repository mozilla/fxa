/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CmsLogo from '.';

describe('CmsLogo', () => {
  it('renders correctly', () => {
    render(
      <CmsLogo
        {...{
          isMobile: false,
          logos: [
            {
              logoAltText: 'foo',
              logoUrl: '/foo.svg',
            },
          ],
        }}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toEqual('foo');
    expect(img.getAttribute('src')).toEqual('/foo.svg');
  });

  it('falls back when alt text is missing', () => {
    render(
      <CmsLogo
        {...{
          isMobile: false,
          logos: [
            {
              logoAltText: undefined,
              logoUrl: '/foo.svg',
            },
            {
              logoAltText: 'bar',
              logoUrl: '/bar.svg',
            },
          ],
        }}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toEqual('bar');
    expect(img.getAttribute('src')).toEqual('/bar.svg');
  });

  it('falls back when url is missing', () => {
    render(
      <CmsLogo
        {...{
          isMobile: false,
          logos: [
            {
              logoAltText: 'foo',
              logoUrl: undefined,
            },
            {
              logoAltText: 'bar',
              logoUrl: '/bar.svg',
            },
          ],
        }}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toEqual('bar');
    expect(img.getAttribute('src')).toEqual('/bar.svg');
  });

  it('falls back when logo state is missing', () => {
    render(
      <CmsLogo
        {...{
          isMobile: false,
          logos: [
            undefined,
            {
              logoAltText: 'bar',
              logoUrl: '/bar.svg',
            },
          ],
        }}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toEqual('bar');
    expect(img.getAttribute('src')).toEqual('/bar.svg');
  });

  it('hides the logo when isMobile true', () => {
    render(
      <CmsLogo
        {...{
          isMobile: true,
          logos: [
            {
              logoAltText: 'foo',
              logoUrl: '/foo.svg',
            },
          ],
        }}
      />
    );

    const img = screen.queryByRole('img');
    expect(img).not.toBeInTheDocument();
  });
});
