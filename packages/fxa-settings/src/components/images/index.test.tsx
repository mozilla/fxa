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
  && !/LaptopQrCodeImage|MobileDevicePairingImage|PairingInterruptedImage|QrPhoneFrameImage|SyncSuccessImage/.test(name) // TODO: FXA-14337 - Define aria labels for pair2 images
) as [string, React.ComponentType<ImageProps>][];

describe('components/images aria labels', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('exports at least one image', () => {
    expect(imageWrappers.length).toBeGreaterThan(0);
  });

  it.each(imageWrappers)('%s resolves its aria-label id', (_name, Image) => {
    renderWithLocalizationProvider(<Image />);

    const ftlId = screen.getByTestId('ftlmsg-mock').id;
    const message = bundle.getMessage(ftlId);

    expect(message).toBeDefined();
    expect(message!.attributes['aria-label']).toBeDefined();
  });
});
