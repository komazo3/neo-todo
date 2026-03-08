import { Prisma, Priority, Status, Todo } from "@/generated/prisma/client";
import { jstToUtc, parseJstStringsToUtc } from "./jst";
import { prisma } from "./prisma";
import {
  TodoCreateInput,
  TodoUpdateInput,
  UserUpdateInput,
} from "@/generated/prisma/models";
import "server-only";
import { RecurringEditScope, TodoSort } from "./types";

function buildTodoOrderBy(
  sort?: TodoSort,
): Prisma.TodoOrderByWithRelationInput[] {
  switch (sort) {
    case "PRIORITY_DESC":
      return [{ priority: "desc" }, { deadline: "asc" }];
    case "PRIORITY_ASC":
      return [{ priority: "asc" }, { deadline: "asc" }];
    case "DEADLINE_DESC":
      return [{ deadline: "desc" }];
    case "DEADLINE_ASC":
    default:
      return [{ deadline: "asc" }];
  }
}

export async function listTodos(
  userId: string,
  status?: Status,
  sort?: TodoSort,
  targetDate?: Date,
): Promise<Todo[]> {
  const where: Prisma.TodoWhereInput = {
    userId: userId,
    status: status ? status : undefined,
  };

  if (targetDate && !Number.isNaN(targetDate.getTime())) {
    const y = targetDate.getUTCFullYear();
    const m = targetDate.getUTCMonth() + 1;
    const d = targetDate.getUTCDate();
    const startOfDayJst = jstToUtc(y, m, d, 0, 0, 0);
    const endOfDayJst = jstToUtc(y, m, d, 23, 59, 59);

    if (
      !Number.isNaN(startOfDayJst.getTime()) &&
      !Number.isNaN(endOfDayJst.getTime())
    ) {
      where.deadline = {
        gte: startOfDayJst,
        lte: endOfDayJst,
      };
    }
  }

  return prisma.todo.findMany({
    where,
    orderBy: [{ isAllDay: "desc" }, ...buildTodoOrderBy(sort)],
  });
}

export async function getTodo(todoId: string, userId: string) {
  return prisma.todo.findUnique({
    where: { id: todoId, userId: userId },
    include: { recurringGroup: true },
  });
}

export async function insertTodo(data: TodoCreateInput) {
  return prisma.todo.create({
    data,
  });
}

export async function updateTodo(
  id: string,
  userId: string,
  data: TodoUpdateInput,
) {
  const { count } = await prisma.todo.updateMany({
    where: { id, userId },
    data: { ...data },
  });
  if (count === 0) throw new Error("Todo not found or access denied");
}

export async function updateTodoStatus(
  id: string,
  userId: string,
  done: boolean,
) {
  const { count } = await prisma.todo.updateMany({
    where: { id, userId },
    data: { status: done ? Status.DONE : Status.UNTOUCHED },
  });
  if (count === 0) throw new Error("Todo not found or access denied");
}

export async function deleteTodo(id: string, userId: string) {
  const { count } = await prisma.todo.deleteMany({
    where: { id, userId },
  });
  if (count === 0) throw new Error("Todo not found or access denied");
}

export async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function updateUser(userId: string, data: UserUpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

// ── 繰り返し TODO ────────────────────────────────────────────

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 指定 JST 日付（y/m/d）の deadline を生成する。
 * isAllDay = true の場合は 23:59:59 JST、時刻指定時は timeStr を使う。
 */
function buildDeadlineForDate(
  y: number,
  m: number,
  d: number,
  timeStr: string | undefined,
): Date {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return parseJstStringsToUtc(`${y}/${mm}/${dd}`, timeStr);
}

/** 繰り返しグループを作成し、今日が対象曜日なら当日 Todo インスタンスを登録する */
export async function insertRecurringTodos(
  userId: string,
  data: {
    title: string;
    content: string;
    priority: Priority;
    days: number[];
    timeStr: string | undefined;
  },
) {
  const isAllDay = !data.timeStr;
  const nowJst = new Date(Date.now() + JST_OFFSET_MS);
  const y = nowJst.getUTCFullYear();
  const m = nowJst.getUTCMonth() + 1;
  const d = nowJst.getUTCDate();
  const todayDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  return prisma.$transaction(async (tx) => {
    const group = await tx.recurringGroup.create({
      data: {
        days: data.days.join(","),
        title: data.title,
        content: data.content,
        priority: data.priority,
        timeStr: data.timeStr ?? null,
        userId,
      },
    });

    // 今日が繰り返し曜日に含まれる場合、当日インスタンスを即時生成
    if (data.days.includes(todayDow)) {
      const deadline = buildDeadlineForDate(y, m, d, data.timeStr);
      await tx.todo.create({
        data: {
          title: data.title,
          content: data.content,
          priority: data.priority,
          deadline,
          isAllDay,
          userId,
          recurringGroupId: group.id,
        },
      });
    }

    return group;
  });
}

/**
 * 一覧画面表示時に呼び出す。
 * targetDate（JST 日付を UTC で表現）の曜日が対象のグループで、
 * まだ Todo が存在しない場合のみ新規生成する。
 */
export async function ensureTodayRecurringTodos(
  userId: string,
  targetDate: Date,
): Promise<void> {
  const y = targetDate.getUTCFullYear();
  const m = targetDate.getUTCMonth() + 1;
  const d = targetDate.getUTCDate();
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  // 対象 JST 日の UTC 範囲
  const startUtc = jstToUtc(y, m, d, 0, 0, 0);
  const endUtc = jstToUtc(y, m, d, 23, 59, 59);

  // 全繰り返しグループと当日 Todo をまとめて取得
  const groups = await prisma.recurringGroup.findMany({
    where: { userId },
    include: {
      todos: {
        where: { deadline: { gte: startUtc, lte: endUtc } },
      },
    },
  });

  const toCreate = groups
    .filter((g) => {
      const days = g.days.split(",").map(Number);
      return days.includes(dow) && g.todos.length === 0;
    })
    .map((g) => ({
      title: g.title,
      content: g.content,
      priority: g.priority,
      deadline: buildDeadlineForDate(y, m, d, g.timeStr ?? undefined),
      isAllDay: g.timeStr === null,
      status: Status.UNTOUCHED,
      userId,
      recurringGroupId: g.id,
    }));

  if (toCreate.length > 0) {
    await prisma.todo.createMany({ data: toCreate });
  }
}

/** 繰り返し TODO の一括更新（スコープ付き） */
export async function updateRecurringTodos(
  todoId: string,
  deadline: Date,
  recurringGroupId: string,
  userId: string,
  scope: RecurringEditScope,
  data: { title: string; content: string; priority: Priority; timeStr?: string | null },
) {
  const { timeStr, ...todoData } = data;

  if (scope === "ONLY_THIS") {
    const { count } = await prisma.todo.updateMany({
      where: { id: todoId, userId },
      data: todoData,
    });
    if (count === 0) throw new Error("Todo not found or access denied");
  } else if (scope === "THIS_AND_FUTURE") {
    await prisma.$transaction([
      prisma.todo.updateMany({
        where: { recurringGroupId, userId, deadline: { gte: deadline } },
        data: todoData,
      }),
      // 将来生成分のため、グループテンプレートも更新
      prisma.recurringGroup.updateMany({
        where: { id: recurringGroupId, userId },
        data: {
          title: data.title,
          content: data.content,
          priority: data.priority,
          ...(timeStr !== undefined ? { timeStr } : {}),
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.todo.updateMany({
        where: { recurringGroupId, userId },
        data: todoData,
      }),
      prisma.recurringGroup.updateMany({
        where: { id: recurringGroupId, userId },
        data: {
          title: data.title,
          content: data.content,
          priority: data.priority,
          ...(timeStr !== undefined ? { timeStr } : {}),
        },
      }),
    ]);
  }
}

/** 繰り返し TODO の一括削除（スコープ付き） */
export async function deleteRecurringTodos(
  todoId: string,
  deadline: Date,
  recurringGroupId: string,
  userId: string,
  scope: RecurringEditScope,
) {
  if (scope === "ONLY_THIS") {
    const { count } = await prisma.todo.deleteMany({
      where: { id: todoId, userId },
    });
    if (count === 0) throw new Error("Todo not found or access denied");
  } else if (scope === "THIS_AND_FUTURE") {
    await prisma.todo.deleteMany({
      where: { recurringGroupId, userId, deadline: { gte: deadline } },
    });
    const remaining = await prisma.todo.count({ where: { recurringGroupId } });
    if (remaining === 0) {
      await prisma.recurringGroup.deleteMany({ where: { id: recurringGroupId } });
    }
  } else {
    await prisma.$transaction([
      prisma.todo.deleteMany({ where: { recurringGroupId, userId } }),
      prisma.recurringGroup.deleteMany({ where: { id: recurringGroupId, userId } }),
    ]);
  }
}
