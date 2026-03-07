"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteTodo,
  insertTodo,
  updateTodo,
  updateTodoStatus,
  updateUser,
} from "./database";
import { parseJstStringsToUtc } from "./jst";
import "server-only";
import { auth, signOut } from "@/auth";
import {
  CreateTodo,
  UpdateTodo,
  UpdateTodoStatus,
  UpdateUser,
} from "./schemas";
import { CreateFormState, UpdateFormState, UpdateUserFormState } from "./types";

export async function createTodoAction(
  prevState: CreateFormState,
  formData: FormData,
): Promise<CreateFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。" };
    // もしくは redirect("/login")
  }

  console.log(formData);

  const validated = CreateTodo.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    deadlineDate: formData.get("deadlineDate"),
    deadlineTime: formData.get("deadlineTime"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  try {
    await insertTodo({
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      deadline: validated.data.deadline,
      isAllDay: validated.data.isAllDay,
      user: { connect: { id: session.user.id } },
    });
  } catch (e: unknown) {
    return {
      errors: {},
      message: e instanceof Error ? e.message : "TODOの追加に失敗しました。",
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodoAction(
  formState: UpdateFormState,
  formData: FormData,
): Promise<UpdateFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。", success: false };
  }

  const validated = UpdateTodo.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    deadlineDate: formData.get("deadlineDate"),
    deadlineTime: formData.get("deadlineTime"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
      success: false,
    };
  }

  try {
    await updateTodo(validated.data.id, session.user.id, {
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      deadline: validated.data.deadline,
      isAllDay: validated.data.isAllDay,
    });
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update Todo.",
      success: false,
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodoStatusAction(id: string, done: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。" };
  }

  const validated = UpdateTodoStatus.safeParse({ done });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  try {
    await updateTodoStatus(id, session.user.id, validated.data.done);
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update Todo.",
    };
  }

  revalidatePath("/todos");
}

export async function deleteTodoAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("ログインが必要です。");
  }

  try {
    await deleteTodo(id, session.user.id);
  } catch {
    throw new Error("Database Error: Failed to delete todo.");
  }
  revalidatePath("/todos");
}

export async function updateUserAction(
  formState: UpdateUserFormState,
  formData: FormData,
): Promise<UpdateUserFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。", success: false };
  }

  const validated = UpdateUser.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
      success: false,
    };
  }

  if (validated.data.id !== session.user.id) {
    return { errors: {}, message: "不正なリクエストです。", success: false };
  }

  try {
    await updateUser(validated.data.id, {
      name: validated.data.name,
    });
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update User.",
      success: false,
    };
  }

  revalidatePath("/mypage");
  return {
    errors: {},
    message: "success",
    success: true,
    fields: { name: validated.data.name },
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
