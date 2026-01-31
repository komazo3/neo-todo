"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { hashPassword } from "./password";
import { sendSignupVerificationEmail } from "./mail";
const SIGNUP_VERIFICATION_EXPIRES_HOURS = 24;

const SignupSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください").max(255),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(72, "パスワードは72文字以内で入力してください")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "パスワードは英字と数字の両方を含めてください",
    ),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません",
  path: ["passwordConfirm"],
});

export type SignupFormState = {
  errors?: Partial<Record<keyof z.infer<typeof SignupSchema>, string[]>>;
  message?: string;
};

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email")?.toString()?.trim().toLowerCase(),
    password: formData.get("password")?.toString() ?? "",
    passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as SignupFormState["errors"],
      message: "入力内容を確認してください。",
    };
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: { email: ["このメールアドレスは既に登録されています。"] },
      message: "入力内容を確認してください。",
    };
  }

  const hashed = await hashPassword(password);
  const expires = new Date(Date.now() + SIGNUP_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);
  const token = crypto.randomUUID();

  const nameFromEmail = (e: string) => {
    const local = e.split("@")[0] ?? "";
    const noTag = local.split("+")[0] ?? local;
    const cleaned = noTag.replace(/[._-]+/g, " ").trim();
    return cleaned.slice(0, 30) || "User";
  };

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email,
        name: nameFromEmail(email),
        password: hashed,
        emailVerified: null,
      },
    });
    await tx.verificationToken.deleteMany({ where: { identifier: email } });
    await tx.verificationToken.create({
      data: { identifier: email, token, expires },
    });
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/login/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  try {
    await sendSignupVerificationEmail(email, verifyUrl);
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "認証メールの送信に失敗しました。",
    };
  }

  redirect("/signup/sent?email=" + encodeURIComponent(email));
}

export async function verifyEmailAction(
  token: string,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token?.trim() || !email?.trim()) {
    return { ok: false, error: "無効なリンクです。" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const vt = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: { identifier: normalizedEmail, token: token.trim() },
    },
  });

  if (!vt || vt.expires < new Date()) {
    return { ok: false, error: "リンクの有効期限が切れています。再度アカウント作成からお試しください。" };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { ok: false, error: "ユーザーが見つかりません。" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    await tx.verificationToken.delete({
      where: { identifier_token: { identifier: normalizedEmail, token: token.trim() } },
    });
  });

  return { ok: true };
}
