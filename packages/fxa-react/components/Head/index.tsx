/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocalization } from '@fluent/react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { determineLocale } from 'fxa-shared/l10n/determineLocale';
import { determineDirection } from 'fxa-shared/l10n/determineDirection';

const supportedUserLocale = determineLocale(
  window.navigator.languages.join(', ')
);
const localeDirection = determineDirection(supportedUserLocale);

const Head = ({ title }: { title?: string }) => {
  const { l10n } = useLocalization();
  return (
    <Helmet
      htmlAttributes={{ lang: supportedUserLocale, dir: localeDirection }}
    >
      <title>
        {title
          ? l10n.getString(
              'app-page-title-2',
              { title },
              `${title} | Mozilla accounts`
            )
          : l10n.getString('app-default-title-2', null, 'Mozilla accounts')}
      </title>
    </Helmet>
  );
};

export default Head;
