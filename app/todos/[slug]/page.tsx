import SubHeader from "@/app/components/todos/subHeader";

import Form from "./form";
import { Todo } from "@/generated/prisma/client";
import { getTodo } from "@/app/lib/database";
import { notFound } from "next/navigation";

export default async function Edit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const targetTodo: Todo | null = await getTodo(parseInt(slug));
  if (!targetTodo) notFound();
  return (
    <>
      <SubHeader title={"TODOを編集"}></SubHeader>
      <Form todo={targetTodo}></Form>
    </>
  );
}
