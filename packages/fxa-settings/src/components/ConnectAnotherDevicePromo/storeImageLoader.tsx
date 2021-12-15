import { FunctionComponent, SVGProps } from 'react';

import { ReactComponent as daApple } from './apple-app-store-button/da.svg';
import { ReactComponent as deApple } from './apple-app-store-button/de.svg';
import { ReactComponent as enApple } from './apple-app-store-button/en.svg';
import { ReactComponent as esApple } from './apple-app-store-button/es.svg';
import { ReactComponent as etApple } from './apple-app-store-button/et.svg';
import { ReactComponent as frApple } from './apple-app-store-button/fr.svg';
import { ReactComponent as heApple } from './apple-app-store-button/he.svg';
import { ReactComponent as huApple } from './apple-app-store-button/hu.svg';
import { ReactComponent as idApple } from './apple-app-store-button/id.svg';
import { ReactComponent as itApple } from './apple-app-store-button/it.svg';
import { ReactComponent as jaApple } from './apple-app-store-button/ja.svg';
import { ReactComponent as koApple } from './apple-app-store-button/ko.svg';
import { ReactComponent as ltApple } from './apple-app-store-button/lt.svg';
import { ReactComponent as nbNOApple } from './apple-app-store-button/nb-NO.svg';
import { ReactComponent as nlApple } from './apple-app-store-button/nl.svg';
import { ReactComponent as plApple } from './apple-app-store-button/pl.svg';
import { ReactComponent as ptBRApple } from './apple-app-store-button/pt-BR.svg';
import { ReactComponent as ptApple } from './apple-app-store-button/pt.svg';
import { ReactComponent as ruApple } from './apple-app-store-button/ru.svg';
import { ReactComponent as skApple } from './apple-app-store-button/sk.svg';
import { ReactComponent as slApple } from './apple-app-store-button/sl.svg';
import { ReactComponent as svSEApple } from './apple-app-store-button/sv-SE.svg';
import { ReactComponent as trApple } from './apple-app-store-button/tr.svg';
import { ReactComponent as zhCNApple } from './apple-app-store-button/zh-CN.svg';
import { ReactComponent as zhTWApple } from './apple-app-store-button/zh-TW.svg';
import { ReactComponent as caGoogle } from './google-play-store-button/ca.svg';
import { ReactComponent as csGoogle } from './google-play-store-button/cs.svg';
import { ReactComponent as daGoogle } from './google-play-store-button/da.svg';
import { ReactComponent as deGoogle } from './google-play-store-button/de.svg';
import { ReactComponent as enGoogle } from './google-play-store-button/en.svg';
import { ReactComponent as esGoogle } from './google-play-store-button/es.svg';
import { ReactComponent as etGoogle } from './google-play-store-button/et.svg';
import { ReactComponent as frGoogle } from './google-play-store-button/fr.svg';
import { ReactComponent as huGoogle } from './google-play-store-button/hu.svg';
import { ReactComponent as idGoogle } from './google-play-store-button/id.svg';
import { ReactComponent as itGoogle } from './google-play-store-button/it.svg';
import { ReactComponent as jaGoogle } from './google-play-store-button/ja.svg';
import { ReactComponent as koGoogle } from './google-play-store-button/ko.svg';
import { ReactComponent as ltGoogle } from './google-play-store-button/lt.svg';
import { ReactComponent as nbNOGoogle } from './google-play-store-button/nb-NO.svg';
import { ReactComponent as nlGoogle } from './google-play-store-button/nl.svg';
import { ReactComponent as plGoogle } from './google-play-store-button/pl.svg';
import { ReactComponent as ptBRGoogle } from './google-play-store-button/pt-BR.svg';
import { ReactComponent as ptGoogle } from './google-play-store-button/pt.svg';
import { ReactComponent as ruGoogle } from './google-play-store-button/ru.svg';
import { ReactComponent as skGoogle } from './google-play-store-button/sk.svg';
import { ReactComponent as slGoogle } from './google-play-store-button/sl.svg';
import { ReactComponent as svGoogle } from './google-play-store-button/sv.svg';
import { ReactComponent as trGoogle } from './google-play-store-button/tr.svg';
import { ReactComponent as ukGoogle } from './google-play-store-button/uk.svg';
import { ReactComponent as zhCNGoogle } from './google-play-store-button/zh-CN.svg';
import { ReactComponent as zhTWGoogle } from './google-play-store-button/zh-TW.svg';

export enum StoreType {
  apple,
  google,
}

const storeImages = [
  {
    da: daApple,
    de: deApple,
    en: enApple,
    es: esApple,
    et: etApple,
    fr: frApple,
    he: heApple,
    hu: huApple,
    id: idApple,
    it: itApple,
    ja: jaApple,
    ko: koApple,
    lt: ltApple,
    'nb-NO': nbNOApple,
    nl: nlApple,
    pl: plApple,
    'pt-BR': ptBRApple,
    pt: ptApple,
    ru: ruApple,
    sk: skApple,
    sl: slApple,
    'sv-SE': svSEApple,
    tr: trApple,
    'zh-CH': zhCNApple,
    'zh-TW': zhTWApple,
  },
  {
    ca: caGoogle,
    cs: csGoogle,
    da: daGoogle,
    de: deGoogle,
    en: enGoogle,
    es: esGoogle,
    et: etGoogle,
    fr: frGoogle,
    hu: huGoogle,
    id: idGoogle,
    it: itGoogle,
    ja: jaGoogle,
    ko: koGoogle,
    lt: ltGoogle,
    'nb-NO': nbNOGoogle,
    nl: nlGoogle,
    pl: plGoogle,
    'pt-BR': ptBRGoogle,
    pt: ptGoogle,
    ru: ruGoogle,
    sk: skGoogle,
    sl: slGoogle,
    sv: svGoogle,
    tr: trGoogle,
    uk: ukGoogle,
    'zh-CH': zhCNGoogle,
    'zh-TW': zhTWGoogle,
  },
];

// `PropertyKey` is short for "string | number | symbol"
// since an object key can be any of those types, our key can too
// in TS 3.0+, putting just "string" raises an error
function hasKey<O>(obj: O, key: PropertyKey): key is keyof O {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function getStoreImageByLanguages(
  store: StoreType,
  userLanguages: readonly string[] = ['en']
): FunctionComponent<
  SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
> {
  // Iterate through available languages until logo is found, otherwise default to 'en'
  for (let i = 0; i < userLanguages.length; i += 1) {
    // If language string includes region, eg. zh-TW, check if an image is available.
    const dashLocation = userLanguages[i].indexOf('-');
    const language =
      dashLocation && hasKey(storeImages[store], userLanguages[i])
        ? userLanguages[i]
        : userLanguages[i].slice(0, dashLocation);

    if (hasKey(storeImages[store], language)) {
      // TS issue - If we don't assign to const here, then !== undefined doesn't work.
      const storeImage = storeImages[store][language];
      if (storeImage !== undefined) return storeImage;
    }
  }

  return storeImages[store].en;
}
