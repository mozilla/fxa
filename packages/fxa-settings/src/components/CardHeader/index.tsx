/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { MozServices } from '../../lib/types';

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
  headingTextFtlId: string;
  subheadingText: string;
}

type CardHeaderProps =
  | CardHeaderDefaultServiceProps
  | CardHeaderCustomServiceProps
  | CardHeaderBasicProps
  | CardHeaderWithCustomSubheadingProps;

function isCustomService(
  props: CardHeaderProps
): props is CardHeaderCustomServiceProps {
  return (
    (props as CardHeaderCustomServiceProps).headingWithCustomServiceFtlId !==
    undefined
  );
}

function isDefaultService(
  props: CardHeaderProps
): props is CardHeaderDefaultServiceProps {
  const serviceName = (props as CardHeaderCustomServiceProps).serviceName;
  return (
    ((props as CardHeaderDefaultServiceProps).headingWithDefaultServiceFtlId !==
      undefined &&
      serviceName === undefined) ||
    serviceName === MozServices.Default
  );
}

function isBasicWithCustomSubheading(
  props: CardHeaderProps
): props is CardHeaderWithCustomSubheadingProps {
  return (
    (props as CardHeaderWithCustomSubheadingProps).subheadingText !== undefined
  );
}

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

  if (isBasicWithCustomSubheading(props)) {
    const { subheadingText, headingTextFtlId } = props;
    const spanElement: ReactElement = (
      <span className="card-subheader">{subheadingText}</span>
    );
    return (
      <FtlMsg id={headingTextFtlId} elems={{ span: spanElement }}>
        <h1 className="card-header">
          {headingText} {spanElement}
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
