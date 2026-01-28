/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactElement } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { MozServices } from '../../lib/types';
import { HeadlineFontSize } from '../../models/integrations/relier-interfaces';

// NOTE: this component is heavily tested in components that use it and has complete line
// coverage. However, we may file an issue out of FXA-6589 to add more explicit coverage.

interface CardHeaderRequiredProps {
  headingText: string;
}

interface CardHeaderDefaultServiceProps extends CardHeaderRequiredProps {
  headingWithDefaultServiceFtlId: string;
}

interface CardHeaderCustomServiceProps extends CardHeaderRequiredProps {
  headingWithCustomServiceFtlId: string;
  serviceName: Exclude<MozServices, 'Default'>;
}

interface CardHeaderBasicProps extends CardHeaderRequiredProps {
  headingTextFtlId: string;
}

interface CardHeaderWithCustomSubheadingProps extends CardHeaderRequiredProps {
  headingAndSubheadingFtlId: string;
  subheadingText: string;
  headingTextFtlId?: never;
}

// NOTE: If we ever don't want to send in both service Ftl ID props, consider breaking this into
// two interfaces e.g. CardHeaderSeparateDefaultSubheading and CardHeaderSeparateCustomSubheading
interface CardHeaderSeparateSubheadingProps extends CardHeaderRequiredProps {
  headingTextFtlId: string;
  subheadingWithDefaultServiceFtlId: string;
  subheadingWithCustomServiceFtlId: string;
  serviceName: MozServices;
}

interface CardHeaderBasicWithDefaultSubheadingProps
  extends CardHeaderRequiredProps {
  headingAndSubheadingFtlId: string;
}

interface CardHeaderCmsProps extends CardHeaderRequiredProps {
  cmsLogoUrl?: string;
  cmsLogoAltText?: string;
  cmsHeadline?: string;
  cmsDescription?: string;
  cmsHeadlineFontSize?: HeadlineFontSize | string | null;
  cmsHeadlineTextColor?: string | null;
}

type CardHeaderProps =
  | CardHeaderDefaultServiceProps
  | CardHeaderCustomServiceProps
  | CardHeaderBasicWithDefaultSubheadingProps
  | CardHeaderSeparateSubheadingProps
  | CardHeaderWithCustomSubheadingProps
  | CardHeaderBasicProps
  | CardHeaderCmsProps;

function isBasicWithDefaultSubheading(
  props: CardHeaderProps
): props is CardHeaderBasicWithDefaultSubheadingProps {
  return (
    (props as CardHeaderBasicWithDefaultSubheadingProps)
      .headingAndSubheadingFtlId !== undefined &&
    (props as CardHeaderWithCustomSubheadingProps).subheadingText === undefined
  );
}

function isSeparateSubheading(
  props: CardHeaderProps
): props is CardHeaderSeparateSubheadingProps {
  return (
    (props as CardHeaderSeparateSubheadingProps)
      .subheadingWithDefaultServiceFtlId !== undefined ||
    (props as CardHeaderSeparateSubheadingProps)
      .subheadingWithCustomServiceFtlId !== undefined
  );
}

function isCustomService(
  props: CardHeaderProps
): props is CardHeaderCustomServiceProps {
  return (
    (props as CardHeaderCustomServiceProps).headingWithCustomServiceFtlId !==
    undefined
  );
}

function isDefaultServiceName(serviceName?: MozServices) {
  return serviceName === undefined || serviceName === MozServices.Default;
}

function isDefaultService(
  props: CardHeaderProps
): props is CardHeaderDefaultServiceProps {
  return (
    (props as CardHeaderDefaultServiceProps).headingWithDefaultServiceFtlId !==
      undefined &&
    isDefaultServiceName((props as CardHeaderCustomServiceProps).serviceName)
  );
}

function isCmsHeader(props: CardHeaderProps): props is CardHeaderCmsProps {
  return (
    (props as CardHeaderCmsProps).cmsLogoUrl !== undefined ||
    (props as CardHeaderCmsProps).cmsLogoAltText !== undefined ||
    (props as CardHeaderCmsProps).cmsHeadline !== undefined ||
    (props as CardHeaderCmsProps).cmsDescription !== undefined ||
    (props as CardHeaderCmsProps).cmsHeadlineFontSize !== undefined ||
    (props as CardHeaderCmsProps).cmsHeadlineTextColor !== undefined
  );
}

function isBasicWithCustomSubheading(
  props: CardHeaderProps
): props is CardHeaderWithCustomSubheadingProps {
  return (
    (props as CardHeaderWithCustomSubheadingProps).subheadingText !==
      undefined &&
    (props as CardHeaderWithCustomSubheadingProps).headingAndSubheadingFtlId !==
      undefined
  );
}

/**
 * Maps HeadlineFontSize values to Tailwind CSS font size utility classes.
 * @param fontSize - The font size variant (default, medium, or large)
 * @returns The corresponding Tailwind CSS class
 */
function getHeadlineFontSizeClass(
  fontSize?: HeadlineFontSize | string | null
): string {
  // Handle null/undefined
  if (!fontSize) {
    return 'text-xl';
  }

  // Handle known values (cast to lowercase for safety)
  const normalizedSize = fontSize.toLowerCase();

  const fontSizeMap: Record<string, string> = {
    default: 'text-xl', // 22px
    medium: 'text-xxl', // 28px
    large: 'text-xxxl', // 32px
  };

  return fontSizeMap[normalizedSize] || 'text-xl';
}

/**
 * Generates the className string for CMS-customizable headlines.
 * Note: Color is applied via inline style, not className, for dynamic CMS values.
 *
 * @param fontSize - Optional font size variant (default, medium, or large)
 * @returns A space-separated className string
 *
 * @example
 * ```tsx
 * // Basic usage with default size
 * getCmsHeadlineClassName() // "card-header-cms text-xl"
 *
 * // Large headline
 * getCmsHeadlineClassName('large') // "card-header-cms text-xxxl"
 * ```
 */
export function getCmsHeadlineClassName(
  fontSize?: HeadlineFontSize | string | null
): string {
  const classes = ['card-header-cms', getHeadlineFontSizeClass(fontSize)];

  return classes.filter(Boolean).join(' ');
}

/**
 * Generates inline styles for CMS headline customization.
 * Used for dynamic colors that can't be in Tailwind classes.
 *
 * @param textColor - Optional hex color value (e.g., "#592ACB")
 * @returns Style object for React inline styles
 */
export function getCmsHeadlineStyle(
  textColor?: string | null
): React.CSSProperties {
  return textColor ? { color: textColor } : {};
}

const CardHeader = (props: CardHeaderProps) => {
  const { headingText } = props;

  if (isCmsHeader(props)) {
    const {
      cmsLogoUrl,
      cmsLogoAltText,
      cmsHeadline,
      cmsDescription,
      cmsHeadlineFontSize,
      cmsHeadlineTextColor,
    } = props;

    return (
      <>
        {cmsLogoUrl && cmsLogoAltText && (
          <img
            src={cmsLogoUrl}
            alt={cmsLogoAltText}
            className="justify-start mb-4 max-h-[40px]"
          />
        )}
        <h1
          className={getCmsHeadlineClassName(cmsHeadlineFontSize)}
          style={getCmsHeadlineStyle(cmsHeadlineTextColor)}
        >
          {cmsHeadline}
        </h1>
        <p className="card-subheader">{cmsDescription}</p>
      </>
    );
  }

  if (isDefaultService(props)) {
    const spanElement: ReactElement = (
      <span className="card-subheader">
        to continue to {MozServices.Default}
      </span>
    );
    return (
      <FtlMsg
        id={props.headingWithDefaultServiceFtlId}
        elems={{ span: spanElement }}
      >
        <h1 className="card-header">
          {headingText} {spanElement}
        </h1>
      </FtlMsg>
    );
  }

  if (isCustomService(props)) {
    const { headingWithCustomServiceFtlId, serviceName } = props;
    const spanElement: ReactElement = (
      <span className="card-subheader">to continue to {serviceName}</span>
    );
    return (
      <FtlMsg
        id={headingWithCustomServiceFtlId}
        vars={{ serviceName }}
        elems={{ span: spanElement }}
      >
        <h1 className="card-header">
          {headingText} {spanElement}
        </h1>
      </FtlMsg>
    );
  }

  // Only use this version when the subheading is always a self-contained phrase, e.g. when
  // it's a separately localized phrase and should be read separately by screenreaders
  if (isSeparateSubheading(props)) {
    const { serviceName = MozServices.Default } = props;
    const isDefaultService = isDefaultServiceName(serviceName);

    const subheadingFtlMsgProps = {
      id: isDefaultService
        ? props.subheadingWithDefaultServiceFtlId
        : props.subheadingWithCustomServiceFtlId,
      // include `vars={{ serviceName }}` if non-default
      ...(!isDefaultService && { vars: { serviceName } }),
    };

    return (
      <>
        <h1 className="card-header">
          <FtlMsg id={props.headingTextFtlId}>{headingText}</FtlMsg>
        </h1>
        <FtlMsg {...subheadingFtlMsgProps}>
          <p className="card-subheader">Continue to {serviceName}</p>
        </FtlMsg>
      </>
    );
  }

  if (isBasicWithCustomSubheading(props)) {
    const { subheadingText, headingAndSubheadingFtlId } = props;
    const spanElement: ReactElement = (
      <span className="card-subheader">{subheadingText}</span>
    );
    return (
      <FtlMsg id={headingAndSubheadingFtlId} elems={{ span: spanElement }}>
        <h1 className="card-header">
          {headingText} {spanElement}
        </h1>
      </FtlMsg>
    );
  }

  if (isBasicWithDefaultSubheading(props)) {
    const spanElem = (
      <span className="card-subheader">for your Mozilla account</span>
    );
    return (
      <FtlMsg id={props.headingAndSubheadingFtlId} elems={{ span: spanElem }}>
        <h1 className="card-header">
          {headingText} {spanElem}
        </h1>
      </FtlMsg>
    );
  }

  return (
    <FtlMsg id={props.headingTextFtlId}>
      <h1 className="card-header mb-2">{headingText}</h1>
    </FtlMsg>
  );
};

export default CardHeader;
