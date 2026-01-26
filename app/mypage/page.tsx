import { auth } from "@/auth";
import { getUser } from "../lib/database";

import SubHeader from "../components/subHeader";
import Form from "./form";
import { User } from "@/generated/prisma/client";

export default async function MyPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return <p>ユーザー情報が取得できませんでした。</p>;
  const user: User | null = await getUser(userId);
  if (!user) return <p>ユーザー情報が取得できませんでした。</p>;

  return (
    <>
      <SubHeader title="マイページ"></SubHeader>
      <Form user={user}></Form>
    </>
  );
}
