/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { ImageProps } from '../PreparedImage';
import * as images from '.';

// `testAllL10n` can't cover these: the jest SVG stub renders the file name as
// the element's text, so an attribute-only message never matches its fallback.
// Reading the id off the mocked FtlMsg and checking the bundle directly does
// work, and picks up new images automatically.
const imageWrappers = Object.entries(images).filter(([name]) =>
  name.endsWith('Image')
) as [string, React.ComponentType<ImageProps>][];

// The decorative images, whose cards already carry their meaning in text.
// Named here rather than detected from the render, so that hiding an image is
// a deliberate choice: anything left off this list has to resolve a label.
const decorativeImageNames = new Set([
  'LaptopQrCodeImage',
  'MobileDevicePairingImage',
  'PairingInterruptedImage',
  'QrPhoneFrameImage',
  'SyncSuccessImage',
]);

const labelledImages = imageWrappers.filter(
  ([name]) => !decorativeImageNames.has(name)
);
const decorativeImages = imageWrappers.filter(([name]) =>
  decorativeImageNames.has(name)
);

describe('components/images aria labels', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('exports at least one image', () => {
    expect(labelledImages.length).toBeGreaterThan(0);
  });

  // Catches a decorative image being renamed or dropped, which would otherwise
  // silently thin out the suite below.
  it('finds every decorative image it names', () => {
    expect(decorativeImages).toHaveLength(decorativeImageNames.size);
  });

  it.each(decorativeImages)(
    '%s is hidden from screen readers',
    (_name, Image) => {
      renderWithLocalizationProvider(<Image />);

      expect(screen.getByTestId('aria-hidden-image')).toBeInTheDocument();
    }
  );

  it.each(labelledImages)('%s resolves its aria-label id', (_name, Image) => {
    renderWithLocalizationProvider(<Image />);

    const ftlId = screen.getByTestId('ftlmsg-mock').id;
    const message = bundle.getMessage(ftlId);

    expect(message).toBeDefined();
    expect(message!.attributes['aria-label']).toBeDefined();
  });
});
