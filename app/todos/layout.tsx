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
          <main>{children}</main>
        </section>
      </body>
    </html>
  );
}
