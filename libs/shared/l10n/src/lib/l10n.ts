// import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource, FluentVariable } from '@fluent/bundle';
import * as fs from 'fs';
import * as path from 'path';

// const ftl: Record<string, URL> = {
//   'en-US': new URL('./en-US.ftl', import.meta.url),
//   fr: new URL('./fr.ftl', import.meta.url),
// };

export const DEFAULT_LOCALE = 'en-US';
// const AVAILABLE_LOCALES = {
//   'en-US': 'English',
//   fr: 'French',
// };

const RESOURCES = {
  'fr-FR': new FluentResource(`
  terms = Conditions d’utilisation\n
  privacy = Politique de confidentialité\n
  terms-download = Télécharger les conditions\n
  hello = Salut le monde !\n
  plan-details-header = Header but French !\n
  `),
  'en-US': new FluentResource(`
  terms = Terms of Service\n
  privacy = Privacy Notice\n
  terms-download = Download Terms\n
  hello = Hello, world!\n
  plan-details-header = Header but English\n
  `),
  'de-DE': new FluentResource(`
  terms = Nutzungsbedingungen
  privacy = Datenschutzhinweis
  terms-download = Nutzungsbedingungen herunterladen
  hello = Hallo Welt!\n
  plan-details-header = Header but German\n
  `),
  'es-ES': new FluentResource(`
  terms = Términos del servicio
  privacy = Aviso de privacidad
  terms-download = Descargar términos
  hello = Hola mundo!\n
  plan-details-header = Header but Spanish\n
  `),
};

async function generateBundles() {
  const fetchedMessages: [string, FluentResource][] = [];
  // Temporary work to read l10n files from public/l10n
  // Better solution is required
  const dirRelativeToPublicFolder = 'l10n';
  const dir = path.resolve('./public', dirRelativeToPublicFolder);
  for (const locale in RESOURCES) {
    const ftlPath = `${dir}/${locale}.ftl`;
    const ftlFile = fs.readFileSync(ftlPath, 'utf8');

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
    l10n = bundles.find(
      (bundle) =>
        bundle.locale.toLowerCase() === languages[language as any].toLowerCase()
    )?.bundle;

    if (!!l10n) {
      break;
    }
  }

  if (!l10n) {
    l10n = bundles.find((bundle) => bundle.locale === DEFAULT_LOCALE)?.bundle;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return l10n!;
}

// Temporary
export function getFormattedMsg(
  l10n: FluentBundle,
  msgId: string,
  fallback: string,
  args?: Record<string, FluentVariable> | null
) {
  const errors: Error[] = [];
  const msg = l10n.getMessage(msgId);
  if (msg?.value) {
    const formattedText = l10n.formatPattern(msg.value, args, errors);
    if (formattedText && !errors.length) {
      return formattedText;
    }
  }
  return fallback;
}
