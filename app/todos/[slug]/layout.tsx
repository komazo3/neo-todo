import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-0 py-0">{children}</div>
    </section>
  );
}
