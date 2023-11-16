/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notoSansRegular from './fonts/NotoSans-Regular.ttf';
import notoSansSemibold from './fonts/NotoSans-SemiBold.ttf';
import notoSansBold from './fonts/NotoSans-Bold.ttf';
import notoSansGeorgianRegular from './fonts/NotoSansGeorgian-Regular.ttf';
import notoSansGeorgianSemibold from './fonts/NotoSansGeorgian-SemiBold.ttf';
import notoSansGeorgianBold from './fonts/NotoSansGeorgian-Bold.ttf';
import notoSerifGurmukhiRegular from './fonts/NotoSerifGurmukhi-Regular.ttf';
import notoSerifGurmukhiSemibold from './fonts/NotoSerifGurmukhi-SemiBold.ttf';
import notoSerifGurmukhiBold from './fonts/NotoSerifGurmukhi-Bold.ttf';
import notoSansHebrewRegular from './fonts/NotoSansHebrew-Regular.ttf';
import notoSansHebrewSemibold from './fonts/NotoSansHebrew-SemiBold.ttf';
import notoSansHebrewBold from './fonts/NotoSansHebrew-Bold.ttf';
import notoSansJPRegular from './fonts/NotoSansJP-Regular.ttf';
import notoSansJPSemibold from './fonts/NotoSansJP-SemiBold.ttf';
import notoSansJPBold from './fonts/NotoSansJP-Bold.ttf';
import notoSansKRRegular from './fonts/NotoSansKR-Regular.otf';
import notoSansKRSemibold from './fonts/NotoSansKR-Medium.otf';
import notoSansKRBold from './fonts/NotoSansKR-Bold.otf';
import notoSansSCRegular from './fonts/NotoSansSC-Regular.otf';
import notoSansSCMedium from './fonts/NotoSansSC-Medium.otf';
import notoSansSCBold from './fonts/NotoSansSC-Bold.otf';
import notoSansThaiRegular from './fonts/NotoSansThai-Regular.ttf';
import notoSansThaiSemibold from './fonts/NotoSansThai-SemiBold.ttf';
import notoSansThaiBold from './fonts/NotoSansThai-Bold.ttf';
import notoSansTCRegular from './fonts/NotoSansTC-Regular.otf';
import notoSansTCMedium from './fonts/NotoSansTC-Medium.otf';
import notoSansTCBold from './fonts/NotoSansTC-Bold.otf';

export interface FontSource {
  src: string;
  style: 'normal' | 'italic' | 'oblique';
  weight:
    | 'thin'
    | 'ultralight'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'ultrabold'
    | 'heavy'
    | number;
}
export interface FontData {
  family: string;
  sources: FontSource[];
  direction: 'ltr' | 'rtl';
  breakwords: boolean;
}

export const getRequiredFont = (language: string) => {
  // Languages supported below based on 'supportedLanguages.json'
  // New cases should only be added if additional languages are not supported by the default Noto Sans font
  // Specifying the directionality of the language will impact the layout of the PDF
  // Fonts should be saved to fxa-settings/src/assets/fonts - see instructions in fxa-settings/src/assets/fonts/README.md

  let requiredFont: FontData;
  switch (language.toLowerCase()) {
    // Japanese
    case 'ja':
    case 'ja-jp':
      requiredFont = {
        family: 'Noto Sans JP',
        sources: [
          {
            src: notoSansJPRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansJPSemibold,
            style: 'normal',
            weight: 'semibold',
          },
          {
            src: notoSansJPBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: true,
      };
      break;
    // Georgian
    case 'ka':
      requiredFont = {
        family: 'Noto Sans Georgian',
        sources: [
          {
            src: notoSansGeorgianRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansGeorgianSemibold,
            style: 'normal',
            weight: 'semibold',
          },
          {
            src: notoSansGeorgianBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: false,
      };
      break;
    // Hebrew
    case 'he':
    case 'he-il':
      requiredFont = {
        family: 'Noto Sans Hebrew',
        sources: [
          {
            src: notoSansHebrewRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansHebrewSemibold,
            style: 'normal',
            weight: 'semibold',
          },
          {
            src: notoSansHebrewBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'rtl',
        breakwords: false,
      };
      break;
    // Korean
    case 'ko':
    case 'ko-kp':
    case 'ko-kr':
      requiredFont = {
        family: 'Noto Sans KR',
        sources: [
          {
            src: notoSansKRRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansKRSemibold,
            style: 'normal',
            weight: 'medium',
          },
          {
            src: notoSansKRBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: false,
      };
      break;
    // Punjabi
    // Noto Sans variant of this font was not working as expected and was preventing PDF generation
    // Replaced with Noto Serif version
    case 'pa':
    case 'pa-in':
    case 'pa-pk':
      requiredFont = {
        family: 'Noto Serif Gurmukhi',
        sources: [
          {
            src: notoSerifGurmukhiRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSerifGurmukhiSemibold,
            style: 'normal',
            weight: 'semibold',
          },
          {
            src: notoSerifGurmukhiBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'rtl',
        breakwords: false,
      };
      break;
    // Thai
    case 'th':
      requiredFont = {
        family: 'Noto Sans Thai',
        sources: [
          {
            src: notoSansThaiRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansThaiSemibold,
            style: 'normal',
            weight: 'semibold',
          },
          {
            src: notoSansThaiBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: false,
      };
      break;
    // Chinese (Mainland) - Simplified Chinese
    case 'zh':
    case 'zh-cn':
      requiredFont = {
        family: 'Noto Sans SC',
        sources: [
          {
            src: notoSansSCRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansSCMedium,
            style: 'normal',
            weight: 'medium',
          },
          {
            src: notoSansSCBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: true,
      };
      break;
    // Chinese (Taiwan) - Traditional Chinese
    case 'zh-tw':
      requiredFont = {
        family: 'Noto Sans TC',
        sources: [
          {
            src: notoSansTCRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansTCMedium,
            style: 'normal',
            weight: 'medium',
          },
          {
            src: notoSansTCBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: true,
      };
      break;
    default:
      requiredFont = {
        family: 'Noto Sans',
        sources: [
          {
            src: notoSansRegular,
            style: 'normal',
            weight: 'normal',
          },
          {
            src: notoSansSemibold,
            style: 'normal',
            weight: 'semibold',
          },
          {
            src: notoSansBold,
            style: 'normal',
            weight: 'bold',
          },
        ],
        direction: 'ltr',
        breakwords: false,
      };
      break;
  }

  return requiredFont;
};
