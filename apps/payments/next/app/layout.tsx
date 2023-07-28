import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/global.css';

export const metadata = {
  title: 'Firefox Accounts Subscription Platform',
  description: 'Set up your subscription',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
