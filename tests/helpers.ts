import { Page } from "@playwright/test";

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
