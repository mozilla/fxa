/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { LinkStatus, LinkType } from '../../lib/types';

import { ResetPasswordLinkDamaged, SigninLinkDamaged } from '../LinkDamaged';
import { LinkExpiredResetPassword } from '../LinkExpiredResetPassword';
import { LinkExpiredSignin } from '../LinkExpiredSignin';
import { IntegrationType, isOAuthIntegration } from '../../models';

interface LinkValidatorChildrenProps<TModel> {
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
  linkModel: TModel;
}

interface LinkValidatorIntegration {
  type: IntegrationType;
}

interface LinkValidatorProps<TModel> {
  linkType: LinkType;
  viewName: string;
  createLinkModel: () => TModel;
  integration: LinkValidatorIntegration;
  children: (props: LinkValidatorChildrenProps<TModel>) => React.ReactNode;
}

interface LinkModel {
  isValid(): boolean;
  email: string | undefined;
}

const LinkValidator = <TModel extends LinkModel>({
  linkType,
  viewName,
  integration,
  createLinkModel,
  children,
}: LinkValidatorProps<TModel> & RouteComponentProps) => {
  // If `LinkValidator` is a route component receiving `path, then `children`
  // is a React.ReactElement
  const child = React.isValidElement(children)
    ? (children as React.ReactElement).props.children
    : children;

  const linkModel = createLinkModel();
  const isValid = linkModel.isValid();
  const email = linkModel.email;

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
    if (isOAuthIntegration(integration)) {
      const service = integration.getService();
      const redirectUri = integration.getRedirectUri();

      return (
        <LinkExpiredResetPassword
          {...{ viewName, email, service, redirectUri }}
        />
      );
    }

    return <LinkExpiredResetPassword {...{ viewName, email }} />;
  }

  if (
    linkStatus === LinkStatus.expired &&
    linkType === LinkType['signin'] &&
    email !== undefined
  ) {
    return <LinkExpiredSignin {...{ email, viewName }} />;
  }

  return <>{child({ setLinkStatus, linkModel })}</>;
};

export default LinkValidator;
