import '../styles/globals.css';
import Layout from '../components/layout';
import type { AppProps } from 'next/app';
import AppLocalizationProvider from '../components/Localization/AppLocalizationProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppLocalizationProvider // Replace with one from fxa-react when possible
      userLocales={['en']} // Update this as well
      bundles={['payments', 'react']}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppLocalizationProvider>
  );
}
