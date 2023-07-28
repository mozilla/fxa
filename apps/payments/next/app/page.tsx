export default async function Index() {
  return (
    <>
      <main className="mt-20">
        <section className="p-18 min-h-[calc(100vh-61px-5rem)]">
          <h1 className="green-icon-text">{process.env.greeting}</h1>
        </section>
      </main>
    </>
  );
}
