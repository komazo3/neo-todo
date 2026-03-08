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

/** JST の今日を起点に、選択曜日の deadline を endDate まで生成する */
function generateRecurringDeadlines(
  days: number[],
  timeStr: string | undefined,
  endDate: Date,
): Date[] {
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowJstMs = Date.now() + JST_OFFSET_MS;
  const nowJst = new Date(nowJstMs);

  // JST 今日 0:00 を UTC タイムスタンプで表す
  const todayStartUtc =
    Date.UTC(
      nowJst.getUTCFullYear(),
      nowJst.getUTCMonth(),
      nowJst.getUTCDate(),
    ) - JST_OFFSET_MS;

  const endUtc = endDate.getTime();
  const dates: Date[] = [];

  for (let cur = todayStartUtc; cur <= endUtc; cur += 24 * 60 * 60 * 1000) {
    const jst = new Date(cur + JST_OFFSET_MS);
    const dow = jst.getUTCDay();
    if (days.includes(dow)) {
      const y = jst.getUTCFullYear();
      const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
      const d = String(jst.getUTCDate()).padStart(2, "0");
      dates.push(parseJstStringsToUtc(`${y}/${m}/${d}`, timeStr));
    }
  }
  return dates;
}

/** 繰り返しグループを作成し、指定曜日の Todo インスタンスをまとめて登録する */
export async function insertRecurringTodos(
  userId: string,
  data: {
    title: string;
    content: string;
    priority: Priority;
    days: number[];
    timeStr: string | undefined;
    endDate?: Date;
  },
) {
  const defaultEndDate = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000);
  const endDate = data.endDate ?? defaultEndDate;
  const deadlines = generateRecurringDeadlines(data.days, data.timeStr, endDate);
  if (deadlines.length === 0) throw new Error("指定された終了日までに繰り返し日程がありません。");

  const isAllDay = !data.timeStr;

  return prisma.$transaction(async (tx) => {
    const group = await tx.recurringGroup.create({
      data: { days: data.days.join(","), endDate, userId },
    });
    await tx.todo.createMany({
      data: deadlines.map((deadline) => ({
        title: data.title,
        content: data.content,
        priority: data.priority,
        deadline,
        isAllDay,
        userId,
        recurringGroupId: group.id,
      })),
    });
    return group;
  });
}

/** 繰り返し TODO の一括更新（スコープ付き） */
export async function updateRecurringTodos(
  todoId: string,
  deadline: Date,
  recurringGroupId: string,
  userId: string,
  scope: RecurringEditScope,
  data: { title: string; content: string; priority: Priority },
) {
  if (scope === "ONLY_THIS") {
    const { count } = await prisma.todo.updateMany({
      where: { id: todoId, userId },
      data,
    });
    if (count === 0) throw new Error("Todo not found or access denied");
  } else if (scope === "THIS_AND_FUTURE") {
    await prisma.todo.updateMany({
      where: { recurringGroupId, userId, deadline: { gte: deadline } },
      data,
    });
  } else {
    await prisma.todo.updateMany({
      where: { recurringGroupId, userId },
      data,
    });
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
