/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle, FluentResource } from '@fluent/bundle';
import 'intl-pluralrules';
import { negotiateLanguages } from '@fluent/langneg';
import { LocalizationProvider } from '@fluent/react';
import React, { Component } from 'react';

async function fetchAvailableLocales(baseDir: string) {
  try {
    const response = await fetch(`${baseDir}/locales.json`);
    return response.json();
  } catch (e) {
    throw new Error('unable to fetch available locales');
  }
}

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

async function createMessagesGenerator(
  baseDir: string,
  currentLocales: Array<string>,
  bundles: Array<string>
) {
  const fetched = await Promise.all(
    currentLocales.map(async (locale) => {
      return { [locale]: await fetchAllMessages(baseDir, locale, bundles) };
    })
  );

  const mergedBundle = fetched.reduce((obj, cur) => Object.assign(obj, cur));

  return function* generateMessages() {
    for (const locale of currentLocales) {
      const cx = new FluentBundle(locale);
      for (const i of mergedBundle[locale]) {
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
  messages?: Generator<FluentBundle, void, unknown>;
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

    const availableLocales = await fetchAvailableLocales(baseDir);
    const currentLocales = negotiateLanguages(
      [...userLocales],
      availableLocales,
      {
        defaultLocale: availableLocales[0],
      }
    );

    const generateMessages = await createMessagesGenerator(
      baseDir,
      currentLocales,
      bundles
    );
    this.setState({ messages: generateMessages() });
  }

  render() {
    const { children } = this.props;
    const { messages } = this.state;

    if (!messages) {
      return <div />;
    }

    return (
      <LocalizationProvider bundles={messages}>{children}</LocalizationProvider>
    );
  }
}
