/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import CmsLogo from '.';

describe('CmsLogo', () => {
  it('renders correctly with default left positioning', () => {
    const { container } = render(
      <CmsLogo
        {...{
          isMobile: false,
          logoPosition: 'left',
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
    const wrapper = img.parentElement;

    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toEqual('foo');
    expect(img.getAttribute('src')).toEqual('/foo.svg');
    expect(img).toHaveClass('max-h-[40px]');
    expect(img).not.toHaveClass('max-h-[160px]');
    expect(img).not.toHaveClass('mx-auto');

    expect(wrapper).toHaveClass('text-left');
    expect(wrapper).toHaveClass('mb-4');
    expect(wrapper).not.toHaveClass('text-center');

    expect(container).toMatchSnapshot();
  });

  it('renders correctly with center positioning', () => {
    const { container } = render(
      <CmsLogo
        {...{
          isMobile: false,
          logoPosition: 'center',
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
    const wrapper = img.parentElement;

    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toEqual('foo');
    expect(img.getAttribute('src')).toEqual('/foo.svg');
    expect(img).toHaveClass('max-h-[160px]');
    expect(img).toHaveClass('mx-auto');
    expect(img).not.toHaveClass('max-h-[40px]');

    expect(wrapper).toHaveClass('text-center');
    expect(wrapper).toHaveClass('mb-4');
    expect(wrapper).not.toHaveClass('text-left');

    expect(container).toMatchSnapshot();
  });

  it('falls back when alt text is missing', () => {
    render(
      <CmsLogo
        {...{
          isMobile: false,
          logoPosition: 'left',
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
          logoPosition: 'left',
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
          logoPosition: 'left',
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
          logoPosition: 'left',
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
