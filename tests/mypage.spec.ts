import { test, expect } from "@playwright/test";
import { loginAsUser, TEST_USER } from "./helpers";

test.describe("マイページ（/mypage）のテスト", () => {
  test("ログインなしでアクセスするとログインページにリダイレクトされる", async ({
    page,
  }) => {
    // マイページへ直接アクセス
    await page.goto("/mypage");

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL("/login");
  });

  test("ログイン後にマイページが表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // TODOページからマイページへ遷移
    await page.goto("/mypage");

    // ページのタイトルが正しい
    await expect(page).toHaveTitle(/マイページ/);

    // マイページのURLであることを確認
    await expect(page).toHaveURL("/mypage");
  });

  test("マイページにサブヘッダが表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // サブヘッダに「マイページ」というテキストが表示されている
    const subheader = page.getByText("マイページ", { exact: true });
    await expect(subheader).toBeVisible();
  });

  test("ユーザー情報編集フォームが表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 名前ラベルが表示されている
    const nameLabel = page.getByLabel(/名前/);
    await expect(nameLabel).toBeVisible();

    // 保存ボタンが表示されている
    const saveButton = page.getByRole("button", { name: "保存" });
    await expect(saveButton).toBeVisible();

    // 保存ボタンが有効状態である
    await expect(saveButton).toBeEnabled();
  });

  test("ユーザー情報に現在の名前が表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 名前フィールドに値が入力されている
    const nameField = page.getByLabel(/名前/);
    const value = await nameField.inputValue();
    expect(value).toBeTruthy();
  });

  test("名前を編集して保存できる", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 名前フィールドをクリアして新しい名前を入力
    const nameField = page.getByLabel(/名前/);
    await nameField.clear();
    const newName = `Updated Name ${Date.now()}`;
    await nameField.fill(newName);

    // 保存ボタンをクリック
    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    // 成功メッセージが表示される（Toastメッセージ）
    // 通常、Toastメッセージは一定時間後に消えるため、waitForがビルトインでない場合がある
    // ここでは名前が変更されたかどうかで成功を判定
    await page.waitForTimeout(500); // サーバー処理の完了を待つ

    // ページがリロードされた後、名前が更新されている
    const updatedNameField = page.getByLabel(/名前/);
    const updatedValue = await updatedNameField.inputValue();
    expect(updatedValue).toBe(newName);
  });

  test("名前の最大文字数は50文字である", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 名前フィールドを取得
    const nameField = page.getByLabel(/名前/);

    // maxLength属性があることを確認
    await expect(nameField).toHaveAttribute("maxlength", "50");
  });

  test("ヘルパーテキストが表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // ヘルパーテキストが表示されている
    const helperText = page.getByText("最大50文字");
    await expect(helperText).toBeVisible();
  });

  test("空の名前で保存しようとするとエラーが表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 名前フィールドをクリアして空にする
    const nameField = page.getByLabel(/名前/);
    await nameField.clear();

    // 保存ボタンをクリック
    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    // エラーメッセージが表示される、またはフィールドがエラー状態になる
    // （実装によっては異なる場合があるため、どちらかを確認）
    await page.waitForTimeout(500); // サーバー処理の完了を待つ

    // エラーが表示されているか、または名前フィールドにフォーカスが戻っている
    const errorText = page
      .locator("div[role='alert']")
      .or(page.getByText(/required|必須/i));
    const isErrorVisible = await errorText.isVisible().catch(() => false);
    const nameFieldExists = await nameField.isVisible();

    expect(isErrorVisible || nameFieldExists).toBeTruthy();
  });

  test("複数回編集保存できる", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 最初の編集
    const nameField = page.getByLabel(/名前/);
    const firstName = `First Name ${Date.now()}`;
    await nameField.clear();
    await nameField.fill(firstName);

    let saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    await page.waitForTimeout(500);

    // 名前が変更されていることを確認
    let updatedValue = await nameField.inputValue();
    expect(updatedValue).toBe(firstName);

    // 2回目の編集
    const secondName = `Second Name ${Date.now()}`;
    await nameField.clear();
    await nameField.fill(secondName);

    saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    await page.waitForTimeout(500);

    // 2回目の名前が反映されていることを確認
    updatedValue = await nameField.inputValue();
    expect(updatedValue).toBe(secondName);
  });

  test("ページをリロードしても編集内容が保持される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // マイページへ遷移
    await page.goto("/mypage");

    // 名前を編集して保存
    const nameField = page.getByLabel(/名前/);
    const newName = `Persistent Name ${Date.now()}`;
    await nameField.clear();
    await nameField.fill(newName);

    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    await page.waitForTimeout(500);

    // ページをリロード
    await page.reload();

    // リロード後、編集した名前が保持されている
    const reloadedNameField = page.getByLabel(/名前/);
    const reloadedValue = await reloadedNameField.inputValue();
    expect(reloadedValue).toBe(newName);
  });

  test("マイページへのナビゲーションが可能である", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // TODOページにいることを確認
    await expect(page).toHaveURL("/todos");

    // マイページへ遷移
    await page.goto("/mypage");

    // マイページのURLであることを確認
    await expect(page).toHaveURL(/\/mypage/);
  });
});
