import {
  CreateTodo,
  UpdateTodo,
  UpdateTodoStatus,
  UpdateUser,
} from "./schemas";
import { z } from "zod";

export type TodoDTO = {
  id: string;
  title: string;
  content: string;
  status: "UNTOUCHED" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date;
  isAllDay: boolean;
  recurringGroupId?: string | null;
  recurringGroupDays?: string | null;   // "1,3,5" 形式
};

export type RecurringEditScope = "ONLY_THIS" | "THIS_AND_FUTURE" | "ALL";

export type UserDTO = {
  id: string;
  name: string;
};

// 4種類だけを許可（URLクエリから来てもここで弾ける）
export type TodoSort =
  | "PRIORITY_DESC" // 優先度：高い順
  | "PRIORITY_ASC" // 優先度：低い順
  | "DEADLINE_ASC" // 期限：近い順
  | "DEADLINE_DESC"; // 期限：遠い順

export type UserLite = { name: string; image: string; email: string };

export type CreateTodoInput = z.infer<typeof CreateTodo>;
export type CreateTodoData = z.infer<typeof CreateTodo>; // deadline/isAllDay含む

export type UpdateTodoInput = z.infer<typeof UpdateTodo>;

export type UpdateTodoStatusInput = z.infer<typeof UpdateTodoStatus>;

export type UserUpdateInput = z.infer<typeof UpdateUser>;

export type CreateFormState = {
  errors: Partial<Record<keyof CreateTodoInput, string[]>>;
  message: string;
};
export type UpdateFormState = {
  errors: Partial<Record<keyof UpdateTodoInput, string[]>>;
  message: string;
  success: boolean;
  fields?: Record<string, any>;
};
export type UpdateUserFormState = {
  errors: Partial<Record<keyof UserUpdateInput, string[]>>;
  message: string;
  success: boolean;
  fields?: Record<string, any>;
};
