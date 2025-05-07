/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

interface PreparedImageBaseProps {
  className?: string;
  Image: React.ElementType;
}

interface PreparedImageAriaHiddenProps extends PreparedImageBaseProps {
  ariaHidden: true;
}

interface PreparedImageAriaVisibleProps extends PreparedImageBaseProps {
  ariaHidden?: false;
  ariaLabel: string;
  ariaLabelFtlId: string;
}

export type PreparedImageProps =
  | PreparedImageAriaHiddenProps
  | PreparedImageAriaVisibleProps;

// Use this component to add your image into the collection of images exported below.
// If the component is not being reused across directories, it should remain in the directory
// where it is being used. If you are introducing an image which was previously shared and
// had localized alt-text, or a localized aria-label, please add the existing ftl id to spare
// translating it again. Don't forget to add new FTL strings into the `en.ftl` file!

export const PreparedImage = (props: PreparedImageProps) => {
  const { className = 'mx-auto my-4 max-h-44', ariaHidden, Image } = props;
  const showAriaLabel =
    !ariaHidden && props?.ariaLabel && props?.ariaLabelFtlId;

  return (
    <>
      {showAriaLabel ? (
        <FtlMsg id={props.ariaLabelFtlId} attrs={{ "aria-label": true }}>
          <Image role="img" aria-label={props.ariaLabel} {...{ className }} />
        </FtlMsg>
      ) : (
        <Image
          role="img"
          aria-hidden
          data-testid="aria-hidden-image"
          {...{ className }}
        />
      )}
    </>
  );
};

export type ImageProps = {
  className?: string;
  ariaHidden?: boolean;
};
