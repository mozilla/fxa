import Header from './Header';

export default function Layout({ children }: { children: any }) {
  return (
    <div className="flex justify-center">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
}
