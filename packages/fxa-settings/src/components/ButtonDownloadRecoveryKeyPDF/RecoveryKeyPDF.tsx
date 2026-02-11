/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { LocalizedRecoveryKeyPdfContent } from '.';
import {
  FolderSvg,
  GlobeSvg,
  KeySvg,
  LockSvg,
  PrinterSvg,
  RecoveryKeySvg,
  MozillaLogoSvg,
} from './VectorImagesForPdf';
import notoSansMonoSemiBold from './fonts/NotoSansMono-SemiBold.ttf';
import { FontData } from './requiredFont';

interface RecoveryKeyPDFProps {
  recoveryKeyValue: string;
  localizedText: LocalizedRecoveryKeyPdfContent;
  requiredFont: FontData;
  email: string;
}

export const RecoveryKeyPDF = ({
  recoveryKeyValue,
  requiredFont,
  email,
  localizedText,
}: RecoveryKeyPDFProps) => {
  const { family, sources, direction, breakwords } = requiredFont;

  Font.register({
    family,
    fonts: sources,
  });

  Font.register({
    family: 'Noto Sans Mono',
    fonts: [
      {
        src: notoSansMonoSemiBold,
        fontStyle: 'normal',
        fontWeight: 'semibold',
      },
    ],
  });

  const splitText = (text: string) => {
    return text.split(' ');
  };

  // By default, react-pdf inserts hyphens wherever a word overflows its containers,
  // without regard to language rules.
  // For languages such as Chinese and Japanese that do not contain spaces between words,
  // text should break at the end of the line without adding a hyphen.
  // Code snippet here was taken from:
  // https://github.com/diegomura/react-pdf/issues/692#issuecomment-631819389
  breakwords
    ? Font.registerHyphenationCallback((word: string) => {
        if (word.length === 1) {
          return [word];
        } else {
          return Array.from(word).reduce((acc: (string | '')[], char) => {
            acc = acc.concat([char, '']);
            return acc;
          }, []);
        }
      })
    : // For other languages that contain spaces between words, text that would overflow its container
      // should break at the preceeding space between words, without hyphenation.
      // See documentation about disabling default hyphenation:
      // https://react-pdf.org/fonts#registerhyphenationcallback
      Font.registerHyphenationCallback((word: string) => [word]);

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      paddingVertical: '2cm',
      paddingHorizontal: '2cm',
      fontFamily: family,
      textAlign: direction === 'ltr' ? 'left' : 'right',
    },
    purpleSection: {
      flexDirection: 'column',
      marginTop: '56px',
      paddingHorizontal: '28px',
      paddingBottom: '28px',
      borderRadius: 10,
      backgroundColor: '#e3dff5',
      textAlign: 'center',
    },
    whiteSection: {
      padding: '16px',
      borderRadius: 5,
      backgroundColor: '#ffffff',
      fontSize: '12px',
      gap: '8px',
      alignItems: 'flex-start',
    },
    heading: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginTop: '10px',
      marginBottom: '4px',
    },
    subheading: {
      fontSize: '12px',
      fontWeight: 'semibold',
      marginTop: '28px',
      marginBottom: '12px',
    },
    listItem: {
      flexDirection: direction === 'ltr' ? 'row' : 'row-reverse',
      gap: '4px',
      alignItems: 'center',
      flexBasis: '50%',
      paddingVertical: '4px',
    },
    listItemText: {
      fontSize: '10px',
      fontWeight: 'normal',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            width: '100%',
            flexDirection: direction === 'ltr' ? 'row' : 'row-reverse',
          }}
        >
          <MozillaLogoSvg />
        </View>
        <View style={styles.purpleSection}>
          <RecoveryKeySvg />
          <Text style={styles.heading}>{localizedText.heading}</Text>
          {/* TODO in FXA-8313: Verify formatting of RTL dates - bidirectionality markers are not respected
          and numeric values are incorrectly reversed (e.g., 3202 instead of 2023) */}
          <Text style={{ fontSize: '10px', marginBottom: '4px' }}>
            {localizedText.dateGenerated}
          </Text>
          <Text style={{ fontSize: '12px', marginBottom: '28px' }}>
            {email}
          </Text>
          <View style={styles.whiteSection}>
            <View
              style={{
                width: '100%',
                flexDirection: direction === 'ltr' ? 'row' : 'row-reverse',
                gap: '4px',
              }}
            >
              <KeySvg {...{ direction }} />
              <Text style={{ fontSize: '10px' }}>
                {localizedText.keyLegend}
              </Text>
            </View>
            <Text
              style={{
                width: '100%',
                textAlign: direction === 'ltr' ? 'left' : 'right',
                fontFamily: 'Noto Sans Mono',
                fontWeight: 'semibold',
                fontSize: '13px',
                letterSpacing: '1px',
              }}
            >
              {recoveryKeyValue}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: '28px' }}>
          <View
            style={{
              flexDirection: direction === 'ltr' ? 'row' : 'row-reverse',
              flexWrap: 'wrap',
            }}
          >
            {direction === 'ltr' ? (
              <Text
                style={{
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}
              >
                {localizedText.instructions}
              </Text>
            ) : (
              // this is a hack to support RTL text that flows over more than one line
              // react-pdf does not (yet) support RTL out-of-the-box, and long paragraphs of RTL
              // text were flowing from the bottom up. This splits the text into an array of words
              // that can be reflowed from top-right to bottom-left.
              // TODO in FXA-8313: Verify punctuation incl. parentheses. They may be inverted and misplaced.
              splitText(localizedText.instructions).map((word, i) => {
                return (
                  <Text
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.5,
                      marginLeft: '4px',
                    }}
                  >
                    {word}
                  </Text>
                );
              })
            )}
          </View>
          <Text style={styles.subheading}>{localizedText.storageHeading}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <View style={styles.listItem}>
              <FolderSvg />
              <Text style={styles.listItemText}>
                {localizedText.storageIdeaFolder}
              </Text>
            </View>
            <View style={styles.listItem}>
              <GlobeSvg />
              <Text style={styles.listItemText}>
                {localizedText.storageIdeaCloud}
              </Text>
            </View>
            <View style={styles.listItem}>
              <PrinterSvg />
              <Text style={styles.listItemText}>
                {localizedText.storageIdeaPrint}
              </Text>
            </View>
            <View style={styles.listItem}>
              <LockSvg />
              <Text style={styles.listItemText}>
                {localizedText.storageIdeaPwdManager}
              </Text>
            </View>
          </View>
          <Text style={styles.subheading}>
            {localizedText.findOutMoreHeading}
          </Text>
          <Link
            style={{ fontSize: '10px', color: '#000' }}
            src="https://mzl.la/3bNrM1I"
          >
            https://mzl.la/3bNrM1I
          </Link>
        </View>
      </Page>
    </Document>
  );
};
