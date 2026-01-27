import { auth } from "@/auth";
import { getUser } from "../lib/database";

import SubHeader from "../components/subHeader";
import Form from "./form";
import { User } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return redirect("/login");
  const user: User | null = await getUser(userId);
  if (!user) return redirect("/login");

  return (
    <>
      <SubHeader title="マイページ"></SubHeader>
      <Form user={user}></Form>
    </>
  );
}
