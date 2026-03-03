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
