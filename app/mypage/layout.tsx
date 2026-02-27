import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </section>
  );
}
