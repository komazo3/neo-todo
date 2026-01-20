import Header from "../components/header";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <section>
          <Header></Header>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </section>
      </body>
    </html>
  );
}
