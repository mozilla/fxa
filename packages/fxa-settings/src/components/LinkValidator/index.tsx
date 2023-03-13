/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { UrlSearchContext } from '../../lib/context';
import { LinkStatus, LinkType } from '../../lib/types';
import { CompleteResetPasswordLinkValidator } from '../../models/reset-password/verification';

import LinkDamaged from '../LinkDamaged';
import LinkExpired from '../LinkExpired';

type LinkValidatorChildrenProps = {
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
  params: { [key: string]: string };
};

type LinkValidatorProps = {
  children:
    | ((props: LinkValidatorChildrenProps) => React.ReactNode)
    | React.ReactElement;
  page: keyof typeof pageValidatorMap;
  linkType: LinkType;
};

const pageValidatorMap = {
  completeResetPassword: CompleteResetPasswordLinkValidator,
};

const LinkValidator = ({
  children,
  page,
  linkType,
}: LinkValidatorProps & RouteComponentProps) => {
  // If `LinkValidator` is a route component receiving `path, then `children`
  // is a React.ReactElement
  const child = React.isValidElement(children)
    ? (children as React.ReactElement).props.children
    : children;

  const urlSearchContext = new UrlSearchContext(window);

  const validator = new pageValidatorMap[page](urlSearchContext);
  const isValid = validator.isValid();

  const [linkStatus, setLinkStatus] = useState<LinkStatus>(
    isValid ? LinkStatus.valid : LinkStatus.damaged
  );

  if (linkStatus === LinkStatus.damaged) {
    return <LinkDamaged {...{ linkType }} />;
  }

  if (linkStatus === LinkStatus.expired) {
    return <LinkExpired {...{ linkType }} />;
  }

  return <>{child({ params: validator.getModelValues(), setLinkStatus })}</>;
};

export default LinkValidator;
