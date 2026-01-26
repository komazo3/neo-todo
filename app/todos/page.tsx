import Link from "next/link";
import SubHeader from "../components/subHeader";
import TodoList from "./todoList";
import StatusFilter from "./statusFIlter";
import { listTodos } from "../lib/database";
import { Status } from "@/generated/prisma/enums";
import { Todo } from "@/generated/prisma/client";
import { TodoDTO } from "../lib/types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
type Props = {
  searchParams?: Promise<{ status?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const status =
    sp?.status === "DONE"
      ? Status.DONE
      : sp?.status === "UNTOUCHED"
        ? Status.UNTOUCHED
        : undefined;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const todos: Todo[] = await listTodos(session.user.id, status);
  const dto: TodoDTO[] = todos.map((t) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    status: t.status, // Prisma enum は string なのでOK
    priority: t.priority, // 同上
    deadline: t.deadline, // stringへ
  }));

  return (
    <>
      {/* <!-- Header --> */}
      <SubHeader title={"TODO一覧"}></SubHeader>
      {/* <!-- Filters / Search (optional UI for portfolio look) --> */}
      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatusFilter current={status ?? "ALL"}></StatusFilter>
        <Link
          href="/todos/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          ＋ TODOを追加
        </Link>
      </section>

      {/* <!-- List --> */}
      {todos.length === 0 ? (
        <p>TODOを追加しましょう!</p>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TodoList todos={dto}></TodoList>
        </section>
      )}
    </>
  );
}
