/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useLocalization } from '@fluent/react';
import { Helmet } from 'react-helmet';

const Head = ({ title, favicon }: { title?: string; favicon?: string }) => {
  const { l10n } = useLocalization();

  const customTitle = title
    ? l10n.getString(
        'app-page-title-2',
        { title },
        `${title} | Mozilla accounts`
      )
    : l10n.getString('app-default-title-2', null, 'Mozilla accounts');

  // setting the document title here ensures it gets picked up by Glean automatic page load metrics
  useEffect(() => {
    document.title = customTitle;
  });

  return (
    <Helmet>
      <title>{customTitle}</title>
      <link rel="icon" href={favicon} type="image/x-icon" key="favicon" />
    </Helmet>
  );
};

export default Head;
