/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { LinkStatus, LinkType } from '../../lib/types';

import { ResetPasswordLinkDamaged, SigninLinkDamaged } from '../LinkDamaged';
import { LinkExpiredResetPassword } from '../LinkExpiredResetPassword';
import { LinkExpiredSignin } from '../LinkExpiredSignin';
import { ModelDataProvider } from '../../lib/model-data';
import { Integration } from '../../models';

interface LinkValidatorChildrenProps<T> {
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
  params: T;
}

interface LinkValidatorProps<T> {
  linkType: LinkType;
  viewName: string;
  getParamsFromModel: () => T;
  integration: Integration;
  children: (props: LinkValidatorChildrenProps<T>) => React.ReactNode;
}

const LinkValidator = <TModel extends ModelDataProvider>({
  children,
  linkType,
  viewName,
  getParamsFromModel,
  integration,
}: LinkValidatorProps<TModel> & RouteComponentProps) => {
  // If `LinkValidator` is a route component receiving `path, then `children`
  // is a React.ReactElement
  const child = React.isValidElement(children)
    ? (children as React.ReactElement).props.children
    : children;

  const params = getParamsFromModel();
  const isValid = params.isValid();
  const email = getEmailFromParams();

  function getEmailFromParams() {
    const email = params.getModelData().get('email');
    if (typeof email === 'string') {
      return email;
    } else {
      return undefined;
    }
  }

  const [linkStatus, setLinkStatus] = useState<LinkStatus>(
    isValid ? LinkStatus.valid : LinkStatus.damaged
  );

  if (
    linkStatus === LinkStatus.damaged &&
    linkType === LinkType['reset-password']
  ) {
    return <ResetPasswordLinkDamaged />;
  }

  if (linkStatus === LinkStatus.damaged && linkType === LinkType['signin']) {
    return <SigninLinkDamaged />;
  }

  if (
    linkStatus === LinkStatus.expired &&
    linkType === LinkType['reset-password'] &&
    email !== undefined
  ) {
    return <LinkExpiredResetPassword {...{ email, viewName, integration }} />;
  }

  if (
    linkStatus === LinkStatus.expired &&
    linkType === LinkType['signin'] &&
    email !== undefined
  ) {
    return <LinkExpiredSignin {...{ email, viewName }} />;
  }

  return <>{child({ setLinkStatus, params })}</>;
};

export default LinkValidator;
