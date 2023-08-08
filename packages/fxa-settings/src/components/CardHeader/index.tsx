/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { MozServices } from '../../lib/types';
import { ReactComponent as PocketLogo } from 'fxa-react/images/pocket.svg';

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
  subheadingWithLogoFtlId?: string;
  serviceName: MozServices;
}

interface CardHeaderBasicWithDefaultSubheadingProps
  extends CardHeaderRequiredProps {
  headingAndSubheadingFtlId: string;
}

type CardHeaderProps =
  | CardHeaderDefaultServiceProps
  | CardHeaderCustomServiceProps
  | CardHeaderBasicWithDefaultSubheadingProps
  | CardHeaderSeparateSubheadingProps
  | CardHeaderWithCustomSubheadingProps
  | CardHeaderBasicProps;

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

const serviceLogos: {
  [key in MozServices]?: ReactElement;
} = {
  [MozServices.Pocket]: (
    <PocketLogo className="inline" aria-label={MozServices.Pocket} role="img" />
  ),
};

// TODO in FXA-8290: do we want to check against these unique client IDs instead
// of serviceName? We have a service names enum, but in theory an RP could change their
// service name and we'd have to update the enum, vs these that don't change.
// export const POCKET_CLIENTIDS = [
//   '7377719276ad44ee', // pocket-mobile
//   '749818d3f2e7857f', // pocket-web
//   'dcdb5ae7add825d2', // pocket-web
// ];

const CardHeader = (props: CardHeaderProps) => {
  const { headingText } = props;

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
    const logo = serviceLogos[serviceName];
    const logoElem = <span>{logo}</span>;

    const subheadingFtlMsgProps = {
      // If a logo corresponds to the service name and a logo FTL ID is provided, use that FTL ID.
      // Otherwise, if the service is the default service, use the default service FTL ID.
      // If non-default, use the custom service FTL ID.
      id:
        logo && props.subheadingWithLogoFtlId
          ? props.subheadingWithLogoFtlId
          : isDefaultService
          ? props.subheadingWithDefaultServiceFtlId
          : props.subheadingWithCustomServiceFtlId,
      // include `vars={{ serviceName }}` if non-default and no logo
      ...(!isDefaultService && !logo && { vars: { serviceName } }),
      // include `elems={{ span: logoElem }}` if serviceName is given a logo in serviceLogos
      ...(logo && {
        elems: { span: logoElem },
      }),
    };

    return (
      <>
        <h1 className="card-header">
          <FtlMsg id={props.headingTextFtlId}>{headingText}</FtlMsg>
        </h1>
        <FtlMsg {...subheadingFtlMsgProps}>
          <p className="card-subheader">
            Continue to {logo ? logoElem : serviceName}
          </p>
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
      <span className="card-subheader">for your Firefox account</span>
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
