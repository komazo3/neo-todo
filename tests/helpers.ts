import { Page } from "@playwright/test";
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
 * テスト用TODO作成: テスト用のTODOレコードを指定数作成
 * @param userId - ユーザーID
 * @param count - 作成するTODO数（デフォルト: 5）
 * @returns 作成されたTODOのID配列
 */
export async function createTestTodos(
  userId: string,
  count: number = 5,
): Promise<string[]> {
  const testTodos = [
    {
      title: "重要な会議の準備",
      content: "明日の重要な会議資料を準備する。\n- スライド作成\n- データ確認",
      priority: "HIGH",
      deadline: new Date(2025, 1, 1, 0, 0, 0),
    },
    {
      title: "メール返信",
      content: "クライアントからのメール2件に返信する。",
      priority: "MEDIUM",
    },
    {
      title: "コードレビュー",
      content: "プルリクエスト#123のレビューを完了する。",
      priority: "HIGH",
    },
    {
      title: "チーム定例会議",
      content: "週間ミーティングに参加。\n時間: 10:00-11:00",
      priority: "MEDIUM",
    },
    {
      title: "ドキュメント作成",
      content: "APIドキュメントを更新する。",
      priority: "LOW",
    },
  ];

  const createdTodoIds: string[] = [];
  const today = new Date();

  for (let i = 0; i < Math.min(count, testTodos.length); i++) {
    const todo = testTodos[i];

    // 期限日を 1日目, 2日目, ... に設定
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + i + 1);

    // 期限時刻を設定（偶数番目は12:00、奇数番目は18:00）
    if (!todo.isAllDay) {
      deadline.setHours(i % 2 === 0 ? 12 : 18, 0, 0, 0);
    }

    // ステータスを混在させる（最初の2つはDONE、残りはUNTOUCHED）
    const status = i < 2 ? "DONE" : "UNTOUCHED";

    const createdTodo = await prisma.todo.create({
      data: {
        userId,
        title: todo.title,
        content: todo.content,
        priority: todo.priority as "HIGH" | "MEDIUM" | "LOW",
        deadline,
        isAllDay: todo.isAllDay,
        status: status as "DONE" | "UNTOUCHED",
      },
    });

    createdTodoIds.push(createdTodo.id);
  }

  return createdTodoIds;
}

/**
 * テスト用TODO削除: ユーザーのTODOを全て削除
 * @param userId - ユーザーID
 */
export async function deleteAllUserTodos(userId: string): Promise<void> {
  await prisma.todo.deleteMany({
    where: { userId },
  });
}

/**
 * テスト用TODO削除: 指定されたIDのTODOを削除
 * @param todoIds - 削除するTODOID配列
 */
export async function deleteTestTodos(todoIds: string[]): Promise<void> {
  await prisma.todo.deleteMany({
    where: { id: { in: todoIds } },
  });
}
