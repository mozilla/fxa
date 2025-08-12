/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RelierCmsInfo } from '../../models/integrations';

export const MOCK_CMS_INFO_VALID_LINEAR_BG: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: '#0078d4',
    logoUrl: 'https://example.com/logo.png',
    logoAltText: 'Test App Logo',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    pageTitle: 'Test App - Custom Title',
  },
};

export const MOCK_CMS_INFO_VALID_RADIAL_BG: RelierCmsInfo = {
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
};

export const MOCK_CMS_INFO_NO_BG: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: '#0078d4',
    logoUrl: 'https://example.com/logo.png',
    logoAltText: 'Test App Logo',
    pageTitle: 'Test App - Custom Title',
  },
};

export const MOCK_CMS_INFO_INVALID_BG_COLOR: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: '#0078d4',
    logoUrl: 'https://example.com/logo.png',
    logoAltText: 'Test App Logo',
    backgroundColor: 'solid-color-red',
    pageTitle: 'Test App - Custom Title',
  },
};

export const MOCK_CMS_INFO_WITH_PAGE_TITLE: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: '#0078d4',
    logoUrl: 'https://example.com/logo.png',
    logoAltText: 'Test App Logo',
    pageTitle: 'CMS Custom Title',
  },
};

export const MOCK_CMS_INFO_NO_PAGE_TITLE: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: '#0078d4',
    logoUrl: 'https://example.com/logo.png',
    logoAltText: 'Test App Logo',
  },
};

export const MOCK_CMS_INFO_HEADER_LOGO: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: undefined,
    logoUrl: undefined,
    logoAltText: undefined,
    headerLogoUrl: 'https://example.com/cms-logo.png',
    headerLogoAltText: 'CMS Custom Logo',
  },
};

export const MOCK_CMS_INFO_HEADER_LOGO_NO_ALT: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: undefined,
    logoUrl: undefined,
    logoAltText: undefined,
    headerLogoUrl: 'https://example.com/cms-logo.png',
  },
};

export const MOCK_CMS_INFO_DEFAULT_LOGO: RelierCmsInfo = {
  name: 'Test App',
  clientId: 'test123',
  entrypoint: 'test',
  shared: {
    buttonColor: '#0078d4',
    logoUrl: undefined,
    logoAltText: undefined,
  },
};

export const MOCK_CMS_INFO_HEADER_LOGO_WITH_OTHER_PROPS: RelierCmsInfo = {
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
};

export const INTEGRATION_WITH_UNDEFINED_GETCMSINFO = {
  getCmsInfo: () => undefined,
};

export const INTEGRATION_WITH_NO_GETCMSINFO = {} as Record<string, never>;

export function createIntegration(cmsInfo?: RelierCmsInfo) {
  return {
    getCmsInfo: () => cmsInfo,
  };
}
