import SubHeader from "@/app/components/subHeader";
import Form from "./form";
import { getTodo } from "@/app/lib/database";
import { utcToJstDateForPicker } from "@/app/lib/jst";
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
  if (!session?.user?.id) {
    redirect("/login");
  }

  console.log(slug);

  if (!slug) notFound();

  let targetTodo;
  try {
    targetTodo = await getTodo(slug, session.user.id);
  } catch {
    notFound();
  }
  if (!targetTodo) notFound();

  const jstDisplay = utcToJstDateForPicker(targetTodo.deadline);
  const dto: TodoDTO = {
    id: targetTodo.id,
    title: targetTodo.title,
    content: targetTodo.content,
    status: targetTodo.status,
    priority: targetTodo.priority,
    deadline: targetTodo.deadline,
    isAllDay: targetTodo.isAllDay,
    recurringGroupId: targetTodo.recurringGroupId,
    recurringGroupDays: targetTodo.recurringGroup?.days ?? null,
    recurringGroupEndDate: targetTodo.recurringGroup?.endDate ?? null,
  };

  return (
    <>
      <SubHeader title="TODOを編集" />
      <Form
        todo={dto}
        deadlineDateJst={jstDisplay.dateString}
        deadlineTimeJst={jstDisplay.timeString}
      />
    </>
  );
}
