import { format, startOfDay } from "date-fns";
import { z } from "zod";
import { parseJstStringsToUtc } from "./jst";

/** TODO作成・編集フォーム用のクライアント側バリデーションスキーマ */
export const todoFormSchema = z
  .object({
    title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
    content: z.string().max(500, "最大500文字です"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
      message: "優先度を選択してください",
    }),
    deadlineDate: z
      .string()
      .min(1, "期限日は必須です")
      .transform((v) => new Date(v))
      .refine(
        (d) => !Number.isNaN(d.getTime()),
        "期限日を正しく入力してください",
      )
      .refine(
        (d) => d >= startOfDay(new Date()),
        "現在以降の日を入力してください",
      ),
    deadlineTime: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "時刻の形式が正しくありません",
        )
        .optional(),
    ),
  })
  .superRefine((data, ctx) => {
    const dateStr = format(data.deadlineDate as Date, "yyyy/MM/dd");
    const deadlineUtc = parseJstStringsToUtc(dateStr, data.deadlineTime);

    if (deadlineUtc.getTime() < Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadlineDate"],
        message: "期限は現在以降を指定してください。",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadlineTime"],
        message: "期限は現在以降を指定してください。",
      });
    }
  });

export type TodoFormInput = z.infer<typeof todoFormSchema>;
export type TodoFormErrors = Partial<Record<keyof TodoFormInput, string[]>>;

/** マイページ・ユーザー名編集フォーム用 */
export const userFormSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "最大50文字です"),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
export type UserFormErrors = Partial<Record<keyof UserFormInput, string[]>>;
