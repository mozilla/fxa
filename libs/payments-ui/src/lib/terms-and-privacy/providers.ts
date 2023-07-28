'use client';
import {
  LocalizationProvider,
  Localized,
  ReactLocalization,
} from '@fluent/react';
import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';

const RESOURCES = {
  fr: new FluentResource('hello = Salut le monde !'),
  'en-US': new FluentResource('hello = Hello, world!'),
  pl: new FluentResource('hello = Witaj świecie!'),
};

function* generateBundles(userLocales: any) {
  // Choose locales that are best for the user.
  const currentLocales = negotiateLanguages(
    userLocales,
    ['fr', 'en-US', 'pl'],
    { defaultLocale: 'en-US' }
  );

  for (const locale of currentLocales) {
    const bundle = new FluentBundle(locale);
    bundle.addResource(RESOURCES[locale]);
    yield bundle;
  }
}
let l10n = new ReactLocalization(generateBundles(navigator.languages));

export function Providers({ children }) {
  return (
    <>
      <LocalizationProvider l10n={l10n}> {children} </LocalizationProvider>
    </>
  );
}
