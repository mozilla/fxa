import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: any }) {
  return (
    <>
      <Header />
      <div className="flex justify-center">
        <main className="main-content">{children}</main>
      </div>
      <Footer />
    </>
  );
}
