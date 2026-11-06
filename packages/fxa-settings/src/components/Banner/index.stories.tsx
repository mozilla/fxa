/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import { withLocalization } from 'fxa-react/lib/storybooks';
import Banner, { ResendCodeSuccessBanner, ResendLinkSuccessBanner } from '.';
import { sampleDescription, sampleHeading, sampleCtaText } from './mocks';

// TODO in FXA-10621 - This component is a good candidate for using the controls panel once enabled

export default {
  title: 'Components/Banner',
  component: Banner,
  subcomponents: { ResendCodeSuccessBanner, ResendLinkSuccessBanner },
  decorators: [withLocalization],
} as Meta;

export const Variation1aHeading = () => (
  <AppLayout title="Banner">
    <Banner type="error" content={{ localizedHeading: sampleHeading }} />
  </AppLayout>
);

export const Variation1bHeadingCta = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedHeading: sampleHeading }}
      link={{ url: '#', localizedText: sampleCtaText }}
    />
  </AppLayout>
);

export const Variation1cHeadingDismiss = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedHeading: sampleHeading }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const Variation1dHeadingCtaDismiss = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedHeading: sampleHeading }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const Variation2aDescription = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedDescription: sampleDescription }}
    />
  </AppLayout>
);

export const Variation2bDescriptionCta = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedDescription: sampleDescription }}
      link={{ url: '#', localizedText: sampleCtaText }}
    />
  </AppLayout>
);

export const Variation2cDescriptionDismiss = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedDescription: sampleDescription }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const Variation2dDescriptionCtaDismiss = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{ localizedDescription: sampleDescription }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const Variation3aHeadingDescription = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
    />
  </AppLayout>
);

export const Variation3bHeadingDescriptionCta = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      link={{ url: '#', localizedText: sampleCtaText }}
    />
  </AppLayout>
);

export const Variation3cHeadingDescriptionDismiss = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const Variation4aIconStart = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      iconAlignClassName="self-start"
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const Variation4bIconCenter = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      iconAlignClassName="self-center"
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const TypeError = () => (
  <AppLayout title="Banner">
    <Banner
      type="error"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const TypeInfo = () => (
  <AppLayout title="Banner">
    <Banner
      type="info"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const TypeInfoFancyWithCustomContent = () => (
  <AppLayout title="Banner">
    <Banner
      type="info"
      isFancy
      customContent={
        <div>
          <p>This version has custom JSX/HTML...</p>
          <p className="mt-4">
            ... meaning we're not limited to just one header/paragraph! We can
            put images etc. in here.
          </p>
          <p className="mt-4">
            Cupcake ipsum: Cake tootsie roll jelly-o wafer icing wafer fruitcake
            jelly. Chocolate bar danish cake apple pie jelly liquorice. Candy
            canes carrot cake sweet jujubes fruitcake biscuit cotton candy pie.
          </p>
        </div>
      }
    />
  </AppLayout>
);

export const TypeInfoFancy = () => (
  <AppLayout title="Banner">
    <Banner
      type="info"
      isFancy
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const TypeSuccess = () => (
  <AppLayout title="Banner">
    <Banner
      type="success"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const TypeWarning = () => (
  <AppLayout title="Banner">
    <Banner
      type="warning"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
      link={{ url: '#', localizedText: sampleCtaText }}
      dismissButton={{ action: () => alert('Dismiss clicked') }}
    />
  </AppLayout>
);

export const CenteredText = () => (
  <AppLayout title="Banner">
    <Banner
      type="success"
      textAlignClassName="text-center"
      content={{
        localizedHeading: sampleHeading,
        localizedDescription: sampleDescription,
      }}
    />
  </AppLayout>
);

export const ResendCodeBanner = () => (
  <AppLayout title="Banner">
    <ResendCodeSuccessBanner />
  </AppLayout>
);

export const ResendLinkBanner = () => (
  <AppLayout title="Banner">
    <ResendLinkSuccessBanner />
  </AppLayout>
);
