import { Prisma, Status, Todo } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import {
  TodoCreateInput,
  TodoUpdateInput,
  UserUpdateInput,
} from "@/generated/prisma/models";
import "server-only";
import { TodoSort } from "./types";

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

  if (targetDate) {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    where.deadline = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return prisma.todo.findMany({
    where,
    orderBy: [{ isAllDay: "desc" }, ...buildTodoOrderBy(sort)],
  });
}

export async function getTodo(todoId: number, userId: string) {
  return prisma.todo.findUnique({
    where: { id: todoId, userId: userId },
  });
}

export async function insertTodo(data: TodoCreateInput) {
  return prisma.todo.create({
    data,
  });
}

export async function updateTodo(
  id: number,
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
  id: number,
  userId: string,
  done: boolean,
) {
  const { count } = await prisma.todo.updateMany({
    where: { id, userId },
    data: { status: done ? Status.DONE : Status.UNTOUCHED },
  });
  if (count === 0) throw new Error("Todo not found or access denied");
}

export async function deleteTodo(id: number, userId: string) {
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

export async function updateUser(userId: string, data: UserUpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
