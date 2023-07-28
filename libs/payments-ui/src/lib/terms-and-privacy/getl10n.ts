import { ReactLocalization } from "@fluent/react/esm/localization";
// import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { ExtendedReactLocalization } from "./extendedReactL10n";

export function getl10n(): ExtendedReactLocalization {
  const bundles = [];
  const bundle = new FluentBundle("en-US");
  bundle.addResource(new FluentResource('hello = Hello, world!'));
  bundles.push(bundle);

  const l10n = new ReactLocalization(bundles, undefined);
  const getFragment = () => {console.log('hello')};

  const extendedL10n: ExtendedReactLocalization = l10n as ExtendedReactLocalization;
  extendedL10n.getFragment = getFragment;

  return extendedL10n;
}
