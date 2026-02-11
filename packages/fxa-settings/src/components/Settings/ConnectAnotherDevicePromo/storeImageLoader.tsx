/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

import daApple from './apple-app-store-button/da.svg';
import deApple from './apple-app-store-button/de.svg';
import enApple from './apple-app-store-button/en.svg';
import esApple from './apple-app-store-button/es.svg';
import etApple from './apple-app-store-button/et.svg';
import frApple from './apple-app-store-button/fr.svg';
import heApple from './apple-app-store-button/he.svg';
import huApple from './apple-app-store-button/hu.svg';
import idApple from './apple-app-store-button/id.svg';
import itApple from './apple-app-store-button/it.svg';
import jaApple from './apple-app-store-button/ja.svg';
import koApple from './apple-app-store-button/ko.svg';
import ltApple from './apple-app-store-button/lt.svg';
import nbNOApple from './apple-app-store-button/nb-NO.svg';
import nlApple from './apple-app-store-button/nl.svg';
import plApple from './apple-app-store-button/pl.svg';
import ptBRApple from './apple-app-store-button/pt-BR.svg';
import ptApple from './apple-app-store-button/pt.svg';
import ruApple from './apple-app-store-button/ru.svg';
import skApple from './apple-app-store-button/sk.svg';
import slApple from './apple-app-store-button/sl.svg';
import svSEApple from './apple-app-store-button/sv-SE.svg';
import trApple from './apple-app-store-button/tr.svg';
import zhCNApple from './apple-app-store-button/zh-CN.svg';
import zhTWApple from './apple-app-store-button/zh-TW.svg';

import caGoogle from './google-play-store-button/ca.svg';
import csGoogle from './google-play-store-button/cs.svg';
import daGoogle from './google-play-store-button/da.svg';
import deGoogle from './google-play-store-button/de.svg';
import enGoogle from './google-play-store-button/en.svg';
import esGoogle from './google-play-store-button/es.svg';
import etGoogle from './google-play-store-button/et.svg';
import frGoogle from './google-play-store-button/fr.svg';
import huGoogle from './google-play-store-button/hu.svg';
import idGoogle from './google-play-store-button/id.svg';
import itGoogle from './google-play-store-button/it.svg';
import jaGoogle from './google-play-store-button/ja.svg';
import koGoogle from './google-play-store-button/ko.svg';
import ltGoogle from './google-play-store-button/lt.svg';
import nbNOGoogle from './google-play-store-button/nb-NO.svg';
import nlGoogle from './google-play-store-button/nl.svg';
import plGoogle from './google-play-store-button/pl.svg';
import ptBRGoogle from './google-play-store-button/pt-BR.svg';
import ptGoogle from './google-play-store-button/pt.svg';
import ruGoogle from './google-play-store-button/ru.svg';
import skGoogle from './google-play-store-button/sk.svg';
import slGoogle from './google-play-store-button/sl.svg';
import svGoogle from './google-play-store-button/sv.svg';
import trGoogle from './google-play-store-button/tr.svg';
import ukGoogle from './google-play-store-button/uk.svg';
import zhCNGoogle from './google-play-store-button/zh-CN.svg';
import zhTWGoogle from './google-play-store-button/zh-TW.svg';
import { FtlMsg } from 'fxa-react/lib/utils';

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
    'zh-CN': zhCNApple,
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
    'zh-CN': zhCNGoogle,
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
) {
  let src = storeImages[store].en; // Fallback to English
  // Iterate through available languages until logo is found, otherwise default to 'en'
  for (let i = 0; i < userLanguages.length; i += 1) {
    // If language string includes region, eg. zh-TW, check if an image is available.
    const dashLocation = userLanguages[i].indexOf('-');
    const language =
      dashLocation && hasKey(storeImages[store], userLanguages[i])
        ? userLanguages[i]
        : userLanguages[i].slice(0, dashLocation);

    if (hasKey(storeImages[store], language)) {
      const imgSrc = storeImages[store][language];
      if (imgSrc !== undefined) {
        src = imgSrc;
        break;
      }
    }
  }
  return store === StoreType.google ? (
    <FtlMsg id="connect-another-play-store-image-2" attrs={{ alt: true }}>
      <img src={src} alt="Download Firefox on Google Play" />
    </FtlMsg>
  ) : (
    <FtlMsg id="connect-another-app-store-image-3" attrs={{ alt: true }}>
      <img src={src} alt="Download Firefox on the App Store" />
    </FtlMsg>
  );
}

export default getStoreImageByLanguages;
