/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from './index';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { RelierCmsInfo } from '../../models/integrations';
import { MOCK_CMS_INFO } from '../../pages/mocks';

export default {
  title: 'Components/AppLayout',
  component: AppLayout,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <AppLayout>
    <h1 className="card-header">Header content</h1>
    <p className="mt-2">Paragraph content here</p>
  </AppLayout>
);

export const WithoutCard = () => (
  <AppLayout wrapInCard={false}>
    <div className="border-2 border-blue-300 p-4 rounded-lg shadow-lg">
      <h1 className="card-header">Header</h1>
      <p className="mt-2">
        The content provides it's own card, instead of being wrapped in one
        provided by the layout.
      </p>
    </div>
  </AppLayout>
);

export const WithTitle = () => (
  <AppLayout title="Custom Page Title">
    <h1 className="card-header">Header content</h1>
    <p className="mt-2">Paragraph content here</p>
  </AppLayout>
);

export const WithWidthClass = () => (
  <AppLayout widthClass="card-xl">
    <h1 className="card-header">Wide content</h1>
    <p className="mt-2">This content uses a wider card layout</p>
  </AppLayout>
);

export const WithIntegration = () => {
  return (
    <AppLayout cmsInfo={MOCK_CMS_INFO}>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  );
};

export const WithCmsInfoNoBackground = () => {
  const mockCmsInfo = {
    name: 'Test App',
    clientId: 'test123',
    entrypoint: 'test',
    shared: {
      buttonColor: '#0078d4',
      logoUrl: 'https://example.com/logo.png',
      logoAltText: 'Test App Logo',
      pageTitle: 'Test App - Custom Title',
      // No backgroundColor, so no background image should be applied
    },
  } as RelierCmsInfo;

  return (
    <AppLayout cmsInfo={mockCmsInfo}>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  );
};

export const WithCmsInfoInvalidBackground = () => {
  const mockCmsInfo = {
    name: 'Test App',
    clientId: 'test123',
    entrypoint: 'test',
    shared: {
      buttonColor: '#0078d4',
      logoUrl: 'https://example.com/logo.png',
      logoAltText: 'Test App Logo',
      backgroundColor: 'invalid-color',
      pageTitle: 'Test App - Custom Title',
    },
  } as RelierCmsInfo;

  return (
    <AppLayout cmsInfo={mockCmsInfo}>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  );
};

export const WithCmsInfoRadialGradient = () => {
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

  return (
    <AppLayout cmsInfo={mockCmsInfo}>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  );
};

export const WithCmsInfoUndefined = () => {
  return (
    <AppLayout cmsInfo={undefined}>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  );
};

export const WithoutCmsInfo = () => {
  return (
    <AppLayout>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  );
};
