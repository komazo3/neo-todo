import { auth } from "@/auth";
import { getUser } from "@/app/lib/database";
import SubHeader from "@/app/components/subHeader";
import Form from "./form";
import type { User } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "マイページ | Todo Today",
  description: "ユーザー情報を編集します。",
};

export default async function MyPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const user: User | null = await getUser(userId);
  if (!user) redirect("/login");

  return (
    <>
      <SubHeader title="マイページ" />
      <Form user={user} />
    </>
  );
}
