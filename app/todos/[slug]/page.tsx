import SubHeader from "@/app/components/subHeader";
import Form from "./form";
import { getTodo } from "@/app/lib/database";
import type { TodoDTO } from "@/app/lib/types";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = {
  title: "TODOを編集 | Todo Today",
  description: "TODOを編集します。",
};

type EditTodoPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditTodoPage({ params }: EditTodoPageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const todoId = Number.parseInt(slug, 10);
  if (Number.isNaN(todoId)) notFound();

  const targetTodo = await getTodo(todoId, session.user.id);
  if (!targetTodo) notFound();

  const dto: TodoDTO = {
    id: targetTodo.id,
    title: targetTodo.title,
    content: targetTodo.content,
    status: targetTodo.status,
    priority: targetTodo.priority,
    deadline: targetTodo.deadline,
    isAllDay: targetTodo.isAllDay,
  };

  return (
    <>
      <SubHeader title="TODOを編集" />
      <Form todo={dto} />
    </>
  );
}
