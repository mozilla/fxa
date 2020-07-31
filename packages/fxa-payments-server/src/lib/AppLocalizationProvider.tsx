/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle, FluentResource } from '@fluent/bundle';
import 'intl-pluralrules';
import { negotiateLanguages } from '@fluent/langneg';
import { LocalizationProvider, ReactLocalization } from '@fluent/react';
import React, { Component } from 'react';

import availableLocales from 'fxa-shared/l10n/supportedLanguages.json';

const OTHER_EN_LOCALES = ['en-NZ', 'en-CA', 'en-SG', 'en-MY']

async function fetchMessages(baseDir: string, locale: string, bundle: string) {
  try {
    const response = await fetch(`${baseDir}/${locale}/${bundle}.ftl`);
    const messages = await response.text();

    return messages;
  } catch (e) {
    // We couldn't fetch any strings; just return nothing and fluent will fall
    // back to the default locale if needed.
    return '';
  }
}

function fetchAllMessages(
  baseDir: string,
  locale: string,
  bundles: Array<string>
) {
  return Promise.all(
    bundles.map((bndl) => fetchMessages(baseDir, locale, bndl))
  );
}

async function createFluentBundleGenerator(
  baseDir: string,
  currentLocales: Array<string>,
  bundles: Array<string>
) {
  const fetched = await Promise.all(
    currentLocales.filter(l => !OTHER_EN_LOCALES.includes(l)).map(async (locale) => {
      return { [locale]: await fetchAllMessages(baseDir, locale, bundles) };
    })
  );

  const mergedBundle = fetched.reduce((obj, cur) => Object.assign(obj, cur));

  return function* generateFluentBundles() {
    for (const locale of currentLocales) {
      const sourceLocale = OTHER_EN_LOCALES.includes(locale) ? 'en-GB' : locale;
      const cx = new FluentBundle(locale);
      for (const i of mergedBundle[sourceLocale]) {
        const resource = new FluentResource(i);
        cx.addResource(resource);
      }
      yield cx;
    }
  };
}

type State = {
  baseDir: string;
  userLocales: ReadonlyArray<string>;
  bundles: Array<string>;
  l10n?: ReactLocalization;
};

type Props = {
  baseDir: string;
  userLocales: ReadonlyArray<string>;
  bundles: Array<string>;
  children: any;
};

export default class AppLocalizationProvider extends Component<Props, State> {
  static defaultProps: Props = {
    baseDir: '/locales',
    userLocales: ['en-US'],
    bundles: ['main'],
    children: React.createElement('div'),
  };

  constructor(props: Props) {
    super(props);
    const { baseDir, userLocales, bundles } = props;

    this.state = {
      baseDir,
      userLocales,
      bundles,
    };
  }

  async componentDidMount() {
    const { baseDir, userLocales, bundles } = this.state;

    const currentLocales = negotiateLanguages(
      [...userLocales],
      [...OTHER_EN_LOCALES, ...availableLocales],
      {
        defaultLocale: 'en-US',
      }
    );

    const bundleGenerator = await createFluentBundleGenerator(
      baseDir,
      currentLocales,
      bundles
    );
    this.setState({ l10n: new ReactLocalization(bundleGenerator()) });
  }

  render() {
    const { children } = this.props;
    const { l10n } = this.state;

    if (!l10n) {
      return <div />;
    }

    return (
      <LocalizationProvider l10n={l10n}>{children}</LocalizationProvider>
    );
  }
}
