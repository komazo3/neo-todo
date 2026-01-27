import Link from "next/link";
import SubHeader from "../components/subHeader";
import TodoList from "./todoList";
import StatusFilter from "./statusFIlter";
import { listTodos } from "../lib/database";
import { Status } from "@/generated/prisma/enums";
import { Todo } from "@/generated/prisma/client";
import { TodoDTO, TodoSort } from "../lib/types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SortSelect from "./sortSelect";
import { SORTITEMS } from "../lib/constants";
import DateSelector from "./dateSelector";
import { Button } from "@mui/material";
import AddButton from "./addButton";

export const dynamic = "force-dynamic";
type Props = {
  searchParams?: Promise<{ status?: string; sort?: string; date?: string }>;
};

function parseStatus(v?: string): Status | undefined {
  if (v === "DONE") return Status.DONE;
  if (v === "UNTOUCHED") return Status.UNTOUCHED;
  return undefined;
}

function parseSort(v?: string): TodoSort | undefined {
  switch (v) {
    case "PRIORITY_DESC":
    case "PRIORITY_ASC":
    case "DEADLINE_ASC":
    case "DEADLINE_DESC":
      return v; // v は TodoSort として安全
    default:
      return undefined; // 不正値は無視してデフォルトへ
  }
}

export default async function Page({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const sp = await searchParams; // app router の searchParams は await 不要
  const status = parseStatus(sp?.status);
  const sort = parseSort(sp?.sort);

  let targetDate: Date | undefined;
  if (sp?.date) {
    const parsed = new Date(sp.date);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const todos = await listTodos(session.user.id, status, sort, targetDate);
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

      {/* <!-- Date Selector --> */}
      <DateSelector currentDate={targetDate} />

      {/* <!-- Filters / Search (optional UI for portfolio look) --> */}
      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatusFilter current={status ?? "ALL"}></StatusFilter>
        <SortSelect current={sort ?? SORTITEMS.DEADLINE_ASC}></SortSelect>
        <AddButton></AddButton>
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
