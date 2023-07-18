import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

interface RecoveryKeyPDFProps {
  recoveryKeyValue: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

// Create Document Component
export const RecoveryKeyPDF = ({ recoveryKeyValue }: RecoveryKeyPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Account recovery key</Text>
        <Text>{recoveryKeyValue}</Text>
      </View>
    </Page>
  </Document>
);
