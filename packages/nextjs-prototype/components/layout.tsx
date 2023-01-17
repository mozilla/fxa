import Header from './Header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
    </>
  );
}
