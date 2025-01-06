/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NotificationType } from '../../models';

/**
 * Properties for the Banner component.
 *
 * @typedef {Object} BannerProps
 * @property {'error' | 'info' | 'success' | 'warning'} type - The type of the banner, which determines its styling and icon.
 * @property {BannerContentProps} content - The content to be displayed inside the banner.
 * @property {Animation} [animation] - Optional animation settings for the banner.
 * @property {DismissButtonProps} [dismissButton] - Optional properties for a dismiss button.
 * @property {BannerLinkProps} [link] - Optional properties for a link within the banner.
 */
export type BannerProps = {
  type: NotificationType;
  content: BannerContentProps;
  animation?: Animation;
  dismissButton?: DismissButtonProps;
  link?: BannerLinkProps;
  isFancy?: boolean;
  bannerId?: string;
};

export type Animation = {
  className: string;
  handleAnimationEnd: () => void;
  animate: boolean;
};

export type BannerContentProps =
  | HeadingOnlyProps
  | DescriptionOnlyProps
  | HeadingAndDescriptionProps;

type HeadingOnlyProps = {
  localizedHeading: string;
  localizedDescription?: never;
};

type DescriptionOnlyProps = {
  localizedDescription: string;
  localizedHeading?: never;
};

type HeadingAndDescriptionProps = {
  localizedHeading: string;
  localizedDescription: string;
};

export type BannerLinkProps = ExternalLinkProps | InternalLinkProps;

export type ExternalLinkProps = {
  url: string;
  localizedText: string;
  gleanId?: string;
  path?: never;
};

export type InternalLinkProps = {
  path: string;
  localizedText: string;
  gleanId?: string;
  url?: never;
};

export type DismissButtonProps = {
  action: () => void;
  gleanId?: string;
};
