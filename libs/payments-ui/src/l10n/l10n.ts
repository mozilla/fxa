// import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import * as fs from 'fs';
import * as path from 'path';

// const ftl: Record<string, URL> = {
//   'en-US': new URL('./en-US.ftl', import.meta.url),
//   fr: new URL('./fr.ftl', import.meta.url),
// };

const DEFAULT_LOCALE = 'en-US';
const AVAILABLE_LOCALES = {
  'en-US': 'English',
  fr: 'French',
};

const RESOURCES = {
  'fr-FR': new FluentResource(`
  terms = Conditions d’utilisation\n
  privacy = Politique de confidentialité\n
  terms-download = Télécharger les conditions\n
  hello = Salut le monde !\n
  `),
  'en-US': new FluentResource(`
  terms = Terms of Service\n
  privacy = Privacy Notice\n
  terms-download = Download Terms\n
  hello = Hello, world!\n
  `),
};

async function generateBundles() {
  const fetchedMessages: [string, FluentResource][] = [];
  for (const locale in RESOURCES) {
    const ftlFile = fs.readFileSync(
      path.join(__dirname, `./${locale}.ftl`),
      'utf8'
    );

    // const response = await fetch(String(ftl[locale]));
    // const messages = await response.text();
    const resource = new FluentResource(ftlFile);
    fetchedMessages.push([locale, resource]);
  }

  const bundles: { locale: string; bundle: FluentBundle }[] = [];
  for (const [locale, resource] of fetchedMessages) {
    // const resource = new FluentResource(messages);
    const bundle = new FluentBundle(locale);
    bundle.addResource(resource);
    bundles.push({ locale, bundle });
  }

  return bundles;
}

export async function getBundle(languages: string[] | undefined) {
  // async function changeLocales(userLocales: Array<string>) {
  //   const currentLocales = negotiateLanguages(
  //     userLocales,
  //     Object.keys(AVAILABLE_LOCALES),
  //     { defaultLocale: DEFAULT_LOCALE }
  //   );

  const bundles = await generateBundles();
  let l10n: FluentBundle | undefined;
  for (const language in languages) {
    l10n = bundles.find((bundle) => bundle.locale === language)?.bundle;

    if (l10n) break;
  }

  if (!l10n) {
    l10n = bundles.find((bundle) => bundle.locale === 'fr-FR')?.bundle;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return l10n!;
}
