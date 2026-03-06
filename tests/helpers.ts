import { Page } from "@playwright/test";
import { format } from "date-fns";
import { prisma } from "../app/lib/prisma";

/**
 * テスト用ユーザー情報
 */
export const TEST_USER = {
  email: "test3@example.com",
  password: "Password3",
  name: "Test User 3",
};

/**
 * ログイン用の共通メソッド
 * @param page - Playwrightのページオブジェクト
 * @param email - ログインメールアドレス
 * @param password - ログインパスワード
 */
export async function loginAsUser(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password,
): Promise<void> {
  // ログインページへ遷移
  await page.goto("/login");

  // メールアドレスを入力
  const emailField = page.getByLabel("メールアドレス");
  await emailField.fill(email);

  // パスワードを入力
  const passwordField = page.getByLabel("パスワード");
  await passwordField.fill(password);

  // ログインボタンをクリック
  const loginButton = page.getByRole("button", {
    name: "メールアドレスでログイン",
  });
  await loginButton.click();

  // TODOページへのナビゲーションを待つ
  await page.waitForURL("/todos");
}

/**
 * ログアウト用の共通メソッド
 * @param page - Playwrightのページオブジェクト
 */
export async function logout(page: Page): Promise<void> {
  // ユーザーメニューボタンをクリック
  const userMenuButton = page.getByRole("button", {
    name: /user.*menu|settings|account|profile/i,
  });

  // または、UserInfoコンポーネントから直接ログアウトボタンを探す
  const logoutButton = page.getByRole("button", { name: /ログアウト|logout/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else if (await userMenuButton.isVisible()) {
    await userMenuButton.click();
    await logoutButton.click();
  }

  // ログインページへのリダイレクトを待つ
  await page.waitForURL("/login");
}

/**
 * DB操作: 期限切れのverificationTokenを作成
 * @param email - メールアドレス
 * @param expiresHoursAgo - 何時間前に期限切れにするか
 * @returns トークンと有効期限
 */
export async function createExpiredToken(
  email: string,
  expiresHoursAgo: number = 1,
): Promise<{ token: string; email: string; expires: Date }> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() - expiresHoursAgo * 60 * 60 * 1000); // 指定時間前に設定

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return { token, email, expires };
}

/**
 * DB操作: ユーザーなしの有効なverificationTokenを作成
 * @param email - メールアドレス（ユーザーが存在しないもの）
 * @returns トークン
 */
export async function createTokenWithoutUser(
  email: string,
): Promise<{ token: string; email: string }> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

  // 念のため、このメールアドレスのユーザーが存在しないことを確認
  await prisma.user.deleteMany({
    where: { email },
  });

  // トークンを作成
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return { token, email };
}

/**
 * DB操作: verificationTokenを削除
 * @param token - 削除するトークン
 */
export async function deleteVerificationToken(token: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { token },
  });
}

/**
 * DB操作: 指定したメールアドレスの全verificationTokenを削除
 * @param email - メールアドレス
 */
export async function deleteVerificationTokensByEmail(
  email: string,
): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });
}

/**
 * DB操作: テスト用TODOを本日のJST日付で作成する
 * deadlineは本日JST 12:00 (= UTC 03:00) に設定する
 */
export async function createTestTodo(overrides?: {
  title?: string;
  content?: string;
  status?: "UNTOUCHED" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  isAllDay?: boolean;
  deadline?: Date;
}): Promise<{ id: string; title: string }> {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  });
  if (!user) throw new Error("Test user not found");

  // 本日のJST日付で正午(JST 12:00 = UTC 03:00)のdeadlineを設定
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const jstNow = new Date(Date.now() + JST_OFFSET_MS);
  const defaultDeadline = new Date(
    Date.UTC(
      jstNow.getUTCFullYear(),
      jstNow.getUTCMonth(),
      jstNow.getUTCDate(),
      3,
      0,
      0,
    ),
  );

  const todo = await prisma.todo.create({
    data: {
      userId: user.id,
      title: overrides?.title ?? `テストTODO ${Date.now()}`,
      content: overrides?.content ?? "テスト用のコンテンツです。",
      status: overrides?.status ?? "UNTOUCHED",
      priority: overrides?.priority ?? "MEDIUM",
      deadline: overrides?.deadline ?? defaultDeadline,
      isAllDay: overrides?.isAllDay ?? false,
    },
  });

  return { id: todo.id, title: todo.title };
}

/**
 * DB操作: テスト用TODOを削除する（存在しない場合はスキップ）
 */
export async function deleteTestTodo(todoId: string): Promise<void> {
  await prisma.todo.deleteMany({ where: { id: todoId } });
}

/**
 * DB操作: タイトルでテスト用TODOを削除する（UIテストで作成したTODOのクリーンアップ用）
 */
export async function deleteTestTodoByTitle(title: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  });
  if (!user) return;
  await prisma.todo.deleteMany({ where: { userId: user.id, title } });
}

/**
 * UI操作: TODO新規登録フォームに値を入力する
 * @param page - Playwrightのページオブジェクト
 * @param options.title - タイトル
 * @param options.content - 内容
 * @param options.priority - 優先度ラベル（"低" | "中" | "高"）
 * @param options.deadlineDate - 期限日（MUI DatePickerへの入力用。en-US形式 MMddyyyy で送信）
 * @param options.deadlineTime - 時刻（"HH:mm" 形式。省略可）
 */
export async function fillNewTodoForm(
  page: Page,
  options: {
    title?: string;
    content?: string;
    priority?: "低" | "中" | "高";
    deadlineDate?: Date;
    deadlineTime?: string;
  },
): Promise<void> {
  if (options.title !== undefined) {
    await page.getByLabel("*タイトル").fill(options.title);
  }
  if (options.content !== undefined) {
    await page.getByLabel("内容").fill(options.content);
  }
  if (options.priority !== undefined) {
    const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
    await prioritySelect.click();
    await page.getByRole("option", { name: options.priority }).click();
  }
  if (options.deadlineDate !== undefined) {
    const dateInput = page.getByRole("group", { name: "*期限日" });
    await dateInput.click();
    await dateInput.pressSequentially(format(options.deadlineDate, "yyyyMMdd"));
  }
  if (options.deadlineTime !== undefined) {
    const timeInput = page.getByRole("group", { name: "時刻" });
    await timeInput.click();
    await timeInput.pressSequentially(options.deadlineTime.replace(":", ""));
  }
}
