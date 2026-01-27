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
    orderBy: buildTodoOrderBy(sort),
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

export async function updateTodo(id: number, data: TodoUpdateInput) {
  return prisma.todo.update({
    where: { id },
    data: { ...data },
  });
}

export async function updateTodoStatus(id: number, done: boolean) {
  return prisma.todo.update({
    where: { id },
    data: { status: done ? Status.DONE : Status.UNTOUCHED },
  });
}

export async function deleteTodo(id: number) {
  return prisma.todo.delete({
    where: { id },
  });
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
