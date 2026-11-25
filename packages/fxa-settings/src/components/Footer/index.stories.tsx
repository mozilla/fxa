/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { Decorator, Meta } from '@storybook/react';
import Footer from '.';
import AppLayout from '../AppLayout';
import { MOCK_CMS_INFO_VALID_LINEAR_BG } from '../AppLayout/mocks';
import { AppContext } from '../../models';
import { mockAppContext } from '../../models/mocks';
import { getDefault } from '../../lib/config';
import { DynamicLocalizationProvider } from '../../contexts/DynamicLocalizationContext';

const withConfig = (showLocaleToggle: boolean, darkMode: boolean) => {
  const config = getDefault();
  return mockAppContext({
    config: {
      ...config,
      featureFlags: {
        ...config.featureFlags,
        showLocaleToggle,
        unifiedFooter: true,
      },
      darkMode: { enabled: darkMode },
    },
  });
};

// The provider saves the picked locale to localStorage, so it carries over to other stories.
const withDynamicLocalization: Decorator = (Story) => (
  <DynamicLocalizationProvider baseDir=".">
    <Story />
  </DynamicLocalizationProvider>
);

export default {
  title: 'Components/Footer',
  component: Footer,
  decorators: [withDynamicLocalization],
} as Meta;

// The panel opens above the button, so leave room for it.
const FooterStory = ({ context = withConfig(true, true) }) => (
  <AppContext.Provider value={context}>
    <div className="pt-64">
      <Footer />
    </div>
  </AppContext.Provider>
);

export const Default = () => <FooterStory />;

export const BothToggleFlagsOff = () => (
  <FooterStory context={withConfig(false, false)} />
);

const OpenOnMount = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLButtonElement>(
        '[data-testid="footer-preferences-button"]'
      )
      ?.click();
  }, []);
  return <div ref={ref}>{children}</div>;
};

export const PanelOpen = () => (
  <OpenOnMount>
    <FooterStory />
  </OpenOnMount>
);

export const InAppLayoutWithCmsBackground = () => (
  <AppContext.Provider value={withConfig(true, true)}>
    <AppLayout title="Page title" cmsInfo={MOCK_CMS_INFO_VALID_LINEAR_BG}>
      <h1 className="card-header">Header content</h1>
      <p className="mt-2">Paragraph content here</p>
    </AppLayout>
  </AppContext.Provider>
);
