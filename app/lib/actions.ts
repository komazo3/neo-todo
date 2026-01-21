"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteTodo, insertTodo, updateTodoStatus } from "./database";
import "server-only";
// Create だけのスキーマに絞る（id/status は不要）
const CreateTodo = z.object({
  title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
  content: z.string().min(1, "内容は必須です").max(500, "最大500文字です"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]), // Prisma enum と一致
  deadline: z
    .string()
    .min(1, "期限は必須です")
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "期限の形式が不正です")
    .transform((v) => new Date(v))
    .refine((d) => !Number.isNaN(d.getTime()), "期限を正しく入力してください"),
});

export type TodoInput = z.infer<typeof CreateTodo>;

export type FormState = {
  errors: Partial<Record<keyof TodoInput, string[]>>;
  message: string;
};

export async function createTodoAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validated = CreateTodo.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
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
    });
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Create Todo.",
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function setTodoStatusAction(id: number, done: boolean) {
  try {
    await updateTodoStatus(id, done);
  } catch (e) {
    console.error(e);
    return {
      errors: {},
      message: "Database Error: Failed to update todo.",
    };
  }
  revalidatePath("/todos");
}

export async function deleteTodoAction(id: number) {
  try {
    await deleteTodo(id);
  } catch (e) {
    console.error(e);
    return {
      errors: {},
      message: "Database Error: Failed to delete todo.",
    };
  }
  revalidatePath("/todos");
}
