import daApple from '../../assets/images/apple_app_store_button/da.svg';
import deApple from '../../assets/images/apple_app_store_button/de.svg';
import enApple from '../../assets/images/apple_app_store_button/en.svg';
import esApple from '../../assets/images/apple_app_store_button/es.svg';
import etApple from '../../assets/images/apple_app_store_button/et.svg';
import frApple from '../../assets/images/apple_app_store_button/fr.svg';
import heApple from '../../assets/images/apple_app_store_button/he.svg';
import huApple from '../../assets/images/apple_app_store_button/hu.svg';
import idApple from '../../assets/images/apple_app_store_button/id.svg';
import itApple from '../../assets/images/apple_app_store_button/it.svg';
import jaApple from '../../assets/images/apple_app_store_button/ja.svg';
import koApple from '../../assets/images/apple_app_store_button/ko.svg';
import ltApple from '../../assets/images/apple_app_store_button/lt.svg';
import nbNOApple from '../../assets/images/apple_app_store_button/nb-NO.svg';
import nlApple from '../../assets/images/apple_app_store_button/nl.svg';
import plApple from '../../assets/images/apple_app_store_button/pl.svg';
import ptBRApple from '../../assets/images/apple_app_store_button/pt-BR.svg';
import ptApple from '../../assets/images/apple_app_store_button/pt.svg';
import ruApple from '../../assets/images/apple_app_store_button/ru.svg';
import skApple from '../../assets/images/apple_app_store_button/sk.svg';
import slApple from '../../assets/images/apple_app_store_button/sl.svg';
import svSEApple from '../../assets/images/apple_app_store_button/sv-SE.svg';
import trApple from '../../assets/images/apple_app_store_button/tr.svg';
import zhCNApple from '../../assets/images/apple_app_store_button/zh-CN.svg';
import zhTWApple from '../../assets/images/apple_app_store_button/zh-TW.svg';

import caGoogle from '../../assets/images/google_play_store_button/ca.svg';
import csGoogle from '../../assets/images/google_play_store_button/cs.svg';
import daGoogle from '../../assets/images/google_play_store_button/da.svg';
import deGoogle from '../../assets/images/google_play_store_button/de.svg';
import enGoogle from '../../assets/images/google_play_store_button/en.svg';
import esGoogle from '../../assets/images/google_play_store_button/es.svg';
import etGoogle from '../../assets/images/google_play_store_button/et.svg';
import frGoogle from '../../assets/images/google_play_store_button/fr.svg';
import huGoogle from '../../assets/images/google_play_store_button/hu.svg';
import idGoogle from '../../assets/images/google_play_store_button/id.svg';
import itGoogle from '../../assets/images/google_play_store_button/it.svg';
import jaGoogle from '../../assets/images/google_play_store_button/ja.svg';
import koGoogle from '../../assets/images/google_play_store_button/ko.svg';
import ltGoogle from '../../assets/images/google_play_store_button/lt.svg';
import nbNOGoogle from '../../assets/images/google_play_store_button/nb-NO.svg';
import nlGoogle from '../../assets/images/google_play_store_button/nl.svg';
import plGoogle from '../../assets/images/google_play_store_button/pl.svg';
import ptBRGoogle from '../../assets/images/google_play_store_button/pt-BR.svg';
import ptGoogle from '../../assets/images/google_play_store_button/pt.svg';
import ruGoogle from '../../assets/images/google_play_store_button/ru.svg';
import skGoogle from '../../assets/images/google_play_store_button/sk.svg';
import slGoogle from '../../assets/images/google_play_store_button/sl.svg';
import svGoogle from '../../assets/images/google_play_store_button/sv.svg';
import trGoogle from '../../assets/images/google_play_store_button/tr.svg';
import ukGoogle from '../../assets/images/google_play_store_button/uk.svg';
import zhCNGoogle from '../../assets/images/google_play_store_button/zh-CN.svg';
import zhTWGoogle from '../../assets/images/google_play_store_button/zh-TW.svg';

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
  return key in obj;
}

export function getStoreImageByLanguages(
  store: StoreType,
  userLanguages: readonly string[] = ['en']
) {
  // Iterate through available languages until logo is found, otherwise default to 'en'
  for (let i = 0; i < userLanguages.length; i += 1) {
    // If language string includes region, eg. zh-TW, check if an image is available.
    const dashLocation = userLanguages[i].indexOf('-');
    const language =
      dashLocation && hasKey(storeImages[store], userLanguages[i])
        ? userLanguages[i]
        : userLanguages[i].slice(0, dashLocation);

    if (hasKey(storeImages[store], language)) {
      return storeImages[store][language];
    }
  }

  return storeImages[store].en;
}
