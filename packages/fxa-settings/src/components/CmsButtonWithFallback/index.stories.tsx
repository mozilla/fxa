/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import CmsButtonWithFallback from '.';

export default {
  title: 'components/CmsButtonWithFallback',
  component: CmsButtonWithFallback,
} as Meta;

const storyWithProps = (props: any) => {
  const story = () => (
    <div>
      <CmsButtonWithFallback {...props} />
    </div>
  );
  return story;
};

export const WithVeryLightCmsButtonColor = storyWithProps({
  buttonColor: '#ffffcc',
  buttonText: 'Continue with Very Light Background',
  type: 'button',
});

export const WithVeryLightCmsButtonColorAndDisabled = storyWithProps({
  buttonColor: '#ffffcc',
  buttonText: 'Continue with Very Light Background',
  type: 'button',
  disabled: true,
});

export const WithDarkCmsButtonColor = storyWithProps({
  buttonColor: '#350080',
  buttonText: 'Continue with Dark Background',
  type: 'button',
});

export const WithDarkCmsButtonColorAndDisabled = storyWithProps({
  buttonColor: '#350080',
  buttonText: 'Continue with Dark Background',
  type: 'button',
  disabled: true,
});

export const WithLightCmsButtonColor = storyWithProps({
  buttonColor: '#f58742',
  buttonText: 'Continue with Light Background',
  type: 'button',
});

export const WithLightCmsButtonColorAndDisabled = storyWithProps({
  buttonColor: '#f58742',
  buttonText: 'Continue with Light Background',
  type: 'button',
  disabled: true,
});

export const WithDefaultFallback = storyWithProps({
  buttonText: 'Continue with Default Styling',
  type: 'button',
});

export const WithDefaultFallbackAndDisabled = storyWithProps({
  buttonText: 'Continue with Default Styling',
  type: 'button',
  disabled: true,
});
