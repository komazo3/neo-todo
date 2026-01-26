import SubHeader from "@/app/components/subHeader";

import Form from "./form";
import { Todo } from "@/generated/prisma/client";
import { getTodo } from "@/app/lib/database";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Edit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const targetTodo: Todo | null = await getTodo(
    parseInt(slug),
    session.user.id,
  );
  if (!targetTodo) notFound();
  return (
    <>
      <SubHeader title={"TODOを編集"}></SubHeader>
      <Form todo={targetTodo}></Form>
    </>
  );
}
