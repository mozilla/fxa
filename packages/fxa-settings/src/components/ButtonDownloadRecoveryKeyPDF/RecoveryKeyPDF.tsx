/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  Document,
  Font,
  Image,
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
  SecurityShieldSvg,
} from './VectorImagesForPdf';
import notoSansMonoSemiBold from './fonts/NotoSansMono-SemiBold.ttf';
import firefoxLogo from './images/firefox-logo-wordmark.png';
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
  const { family, sources, direction } = requiredFont;

  Font.register({
    family,
    fonts: sources,
  });

  Font.register({
    family: 'Noto Sans Mono',
    fonts: [
      {
        src: notoSansMonoSemiBold,
        style: 'normal',
        weight: 'semibold',
      },
    ],
  });

  // Disable word hyphenation - the default behaviour breaks word without regard to locales' hyphenation rules.
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
          <Image
            src={firefoxLogo}
            style={{
              height: '22px',
              width: '68px',
            }}
          />
        </View>
        <View style={styles.purpleSection}>
          <SecurityShieldSvg />
          <Text style={styles.heading}>{localizedText.heading}</Text>
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
        <View style={{ marginTop: '28px', flexGrow: 1 }}>
          <Text
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            {localizedText.instructions}
          </Text>
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
