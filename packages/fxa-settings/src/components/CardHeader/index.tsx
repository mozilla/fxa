/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
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

type CardHeaderProps =
  | CardHeaderDefaultServiceProps
  | CardHeaderCustomServiceProps
  | CardHeaderBasicProps;

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

const CardHeader = (props: CardHeaderProps) => {
  const { headingText } = props;

  if (isDefaultService(props)) {
    return (
      <FtlMsg id={props.headingWithDefaultServiceFtlId}>
        <h1 className="card-header">
          {headingText}{' '}
          <span className="card-subheader">
            to continue to {MozServices.Default}
          </span>
        </h1>
      </FtlMsg>
    );
  }

  if (isCustomService(props)) {
    const { headingWithCustomServiceFtlId, serviceName } = props;
    return (
      <FtlMsg id={headingWithCustomServiceFtlId} vars={{ serviceName }}>
        <h1 className="card-header">
          {headingText}{' '}
          <span className="card-subheader">to continue to {serviceName}</span>
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
