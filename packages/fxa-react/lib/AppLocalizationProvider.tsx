/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle, FluentResource } from '@fluent/bundle';
import { LocalizationProvider, ReactLocalization } from '@fluent/react';
import React, { Component } from 'react';
import { EN_GB_LOCALES, parseAcceptLanguage } from '@fxa/shared/l10n';

/**
 * Gets l10n messages from server
 * @param baseDir The root location where locales folders are held
 * @param locale The target language
 * @param bundle The target bundle (ie main)
 * @param mappings A set of mappings for static resources.
 * @returns
 */
async function fetchMessages(
  baseDir: string,
  locale: string,
  bundle: string,
  mappings?: Record<string, string>
) {
  try {
    // Build the path to l10n file
    let path = `locales/${locale}/${bundle}.ftl`;

    // If mappings were proivided see if there is one for the path. This
    // will be a location where the file path contains a hash in the file
    // name
    if (mappings) {
      path = mappings[path];
    }

    // If we don't have mapped path, there are no l10n resources for this language.
    if (!path) {
      return '';
    }

    // Fetch the file and return the messages
    const resolvedPath = `${baseDir}/${path}`;
    const response = await fetch(resolvedPath);
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
  bundles: Array<string>,
  mappings?: Record<string, string>
) {
  return Promise.all(
    bundles.map((bndl) => fetchMessages(baseDir, locale, bndl, mappings))
  );
}

export const L10N_ASSET_MAP_META = 'fxa-l10n-asset-map';

/**
 * Reads the map of l10n file paths to their hashed file names. The mappings are
 * generated with grunt, see the hash-static task in fxa-settings, and the build
 * embeds them into index.html as URI encoded JSON.
 * @returns The mappings, or undefined if the map is absent, empty or malformed
 */
function readL10nHashedMappings(): Record<string, string> | undefined {
  const content = document
    .querySelector(`meta[name="${L10N_ASSET_MAP_META}"]`)
    ?.getAttribute('content');

  if (!content) {
    return undefined;
  }

  try {
    const mappings = JSON.parse(decodeURIComponent(content));

    // Every value must be a path we can fetch, so anything other than a plain
    // object of non-empty strings falls through to the warning below.
    if (
      typeof mappings === 'object' &&
      mappings !== null &&
      !Array.isArray(mappings) &&
      Object.keys(mappings).length > 0 &&
      Object.values(mappings).every(
        (path) => typeof path === 'string' && path !== ''
      )
    ) {
      return mappings;
    }
  } catch (err) {
    // Fall through to the warning below.
  }

  // A map we cannot use is a build problem, so warn, then fall back to the
  // unhashed paths. Only consumers that do not hash their l10n files serve
  // those, so fxa-settings renders English until the build is fixed.
  console.warn(
    `<meta name="${L10N_ASSET_MAP_META}"> is present but unusable, falling back to unhashed l10n paths`
  );
  return undefined;
}

async function createFluentBundleGenerator(
  baseDir: string,
  currentLocales: Array<string>,
  bundles: Array<string>
) {
  const mappings = readL10nHashedMappings();
  const fetched = await Promise.all(
    currentLocales
      .filter((l) => !EN_GB_LOCALES.includes(l))
      .map(async (locale) => {
        return {
          [locale]: await fetchAllMessages(baseDir, locale, bundles, mappings),
        };
      })
  );

  const mergedBundle = fetched.reduce((obj, cur) => Object.assign(obj, cur));

  return getBundleGenerator(currentLocales, mergedBundle);
}

function getBundleGenerator(
  locales: string[],
  messages: { [key: string]: string[] }
) {
  return function* generateFluentBundles() {
    for (const locale of locales) {
      const sourceLocale = EN_GB_LOCALES.includes(locale) ? 'en-GB' : locale;
      const cx = new FluentBundle(locale);
      for (const i of messages[sourceLocale]) {
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
  // pass messages directly in, used in testing
  messages?: { [key: string]: string[] };
  reportError?: (error: Error) => void;
};

export default class AppLocalizationProvider extends Component<Props, State> {
  static defaultProps: Props = {
    baseDir: '',
    userLocales: ['en'],
    bundles: ['main'],
    children: React.createElement('div'),
    reportError: undefined,
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
    if (this.props.messages) {
      this.setState({
        l10n: new ReactLocalization(
          getBundleGenerator(
            Object.keys(this.props.messages),
            this.props.messages
          )(),
          undefined,
          this.props.reportError
        ),
      });
      return;
    }

    const { baseDir, userLocales, bundles } = this.state;
    const currentLocales = parseAcceptLanguage(userLocales.join(', '));
    const bundleGenerator = await createFluentBundleGenerator(
      baseDir,
      currentLocales,
      bundles
    );
    this.setState({
      l10n: new ReactLocalization(
        bundleGenerator(),
        undefined,
        this.props.reportError
      ),
    });
  }

  render() {
    const { children } = this.props;
    const { l10n } = this.state;

    if (!l10n) {
      return <div />;
    }

    return <LocalizationProvider l10n={l10n}>{children}</LocalizationProvider>;
  }
}
