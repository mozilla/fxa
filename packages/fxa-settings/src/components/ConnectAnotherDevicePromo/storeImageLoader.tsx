import { FunctionComponent, SVGProps } from 'react';

import { ReactComponent as daApple } from './apple_app_store_button/da.svg';
import { ReactComponent as deApple } from './apple_app_store_button/de.svg';
import { ReactComponent as enApple } from './apple_app_store_button/en.svg';
import { ReactComponent as esApple } from './apple_app_store_button/es.svg';
import { ReactComponent as etApple } from './apple_app_store_button/et.svg';
import { ReactComponent as frApple } from './apple_app_store_button/fr.svg';
import { ReactComponent as heApple } from './apple_app_store_button/he.svg';
import { ReactComponent as huApple } from './apple_app_store_button/hu.svg';
import { ReactComponent as idApple } from './apple_app_store_button/id.svg';
import { ReactComponent as itApple } from './apple_app_store_button/it.svg';
import { ReactComponent as jaApple } from './apple_app_store_button/ja.svg';
import { ReactComponent as koApple } from './apple_app_store_button/ko.svg';
import { ReactComponent as ltApple } from './apple_app_store_button/lt.svg';
import { ReactComponent as nbNOApple } from './apple_app_store_button/nb-NO.svg';
import { ReactComponent as nlApple } from './apple_app_store_button/nl.svg';
import { ReactComponent as plApple } from './apple_app_store_button/pl.svg';
import { ReactComponent as ptBRApple } from './apple_app_store_button/pt-BR.svg';
import { ReactComponent as ptApple } from './apple_app_store_button/pt.svg';
import { ReactComponent as ruApple } from './apple_app_store_button/ru.svg';
import { ReactComponent as skApple } from './apple_app_store_button/sk.svg';
import { ReactComponent as slApple } from './apple_app_store_button/sl.svg';
import { ReactComponent as svSEApple } from './apple_app_store_button/sv-SE.svg';
import { ReactComponent as trApple } from './apple_app_store_button/tr.svg';
import { ReactComponent as zhCNApple } from './apple_app_store_button/zh-CN.svg';
import { ReactComponent as zhTWApple } from './apple_app_store_button/zh-TW.svg';
import { ReactComponent as caGoogle } from './google_play_store_button/ca.svg';
import { ReactComponent as csGoogle } from './google_play_store_button/cs.svg';
import { ReactComponent as daGoogle } from './google_play_store_button/da.svg';
import { ReactComponent as deGoogle } from './google_play_store_button/de.svg';
import { ReactComponent as enGoogle } from './google_play_store_button/en.svg';
import { ReactComponent as esGoogle } from './google_play_store_button/es.svg';
import { ReactComponent as etGoogle } from './google_play_store_button/et.svg';
import { ReactComponent as frGoogle } from './google_play_store_button/fr.svg';
import { ReactComponent as huGoogle } from './google_play_store_button/hu.svg';
import { ReactComponent as idGoogle } from './google_play_store_button/id.svg';
import { ReactComponent as itGoogle } from './google_play_store_button/it.svg';
import { ReactComponent as jaGoogle } from './google_play_store_button/ja.svg';
import { ReactComponent as koGoogle } from './google_play_store_button/ko.svg';
import { ReactComponent as ltGoogle } from './google_play_store_button/lt.svg';
import { ReactComponent as nbNOGoogle } from './google_play_store_button/nb-NO.svg';
import { ReactComponent as nlGoogle } from './google_play_store_button/nl.svg';
import { ReactComponent as plGoogle } from './google_play_store_button/pl.svg';
import { ReactComponent as ptBRGoogle } from './google_play_store_button/pt-BR.svg';
import { ReactComponent as ptGoogle } from './google_play_store_button/pt.svg';
import { ReactComponent as ruGoogle } from './google_play_store_button/ru.svg';
import { ReactComponent as skGoogle } from './google_play_store_button/sk.svg';
import { ReactComponent as slGoogle } from './google_play_store_button/sl.svg';
import { ReactComponent as svGoogle } from './google_play_store_button/sv.svg';
import { ReactComponent as trGoogle } from './google_play_store_button/tr.svg';
import { ReactComponent as ukGoogle } from './google_play_store_button/uk.svg';
import { ReactComponent as zhCNGoogle } from './google_play_store_button/zh-CN.svg';
import { ReactComponent as zhTWGoogle } from './google_play_store_button/zh-TW.svg';

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
