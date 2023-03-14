/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import {
  ModelContext,
  ModelContextProvider,
  UrlSearchContext,
} from '../../lib/context';
import { LinkStatus, LinkType } from '../../lib/types';

import LinkDamaged from '../LinkDamaged';
import LinkExpired from '../LinkExpired';

type LinkValidatorChildrenProps<TParams> = {
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
  params: TParams;
};

interface LinkValidatorClass<T> {
  new (context: ModelContext): T;
}

type LinkValidatorProps<T extends ModelContextProvider, TParams> = {
  children:
    | ((props: LinkValidatorChildrenProps<TParams>) => React.ReactNode)
    | React.ReactElement;
  Validator: LinkValidatorClass<T>;
  linkType: LinkType;
};

const LinkValidator = <T extends ModelContextProvider, TParams>({
  children,
  Validator,
  linkType,
}: LinkValidatorProps<T, TParams> & RouteComponentProps) => {
  // If `LinkValidator` is a route component receiving `path, then `children`
  // is a React.ReactElement
  const child = React.isValidElement(children)
    ? (children as React.ReactElement).props.children
    : children;

  const urlSearchContext = new UrlSearchContext(window);

  const validator = new Validator(urlSearchContext);
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

  return (
    <>
      {child({ params: validator.getModelValues() as TParams, setLinkStatus })}
    </>
  );
};

export default LinkValidator;
