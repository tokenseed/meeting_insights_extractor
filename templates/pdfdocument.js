import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  summaryContainer: {
    fontFamily: 'Arial',
    backgroundColor: 'white',
    padding: 20,
    maxWidth: 600,
    margin: '0 auto',
    border: '1px solid #ccc',
    borderRadius: 4,
    color: '#333',
  },
  h2: {
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  p: {
    color: '#333',
    lineHeight: 1.5,
  },
});

const PdfDocument = ({ summary }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.summaryContainer}>
        <Text style={styles.h2}>Meeting Summary</Text>
        <Text style={styles.p}>{summary}</Text>
      </View>
    </Page>
  </Document>
);

export default PdfDocument;
