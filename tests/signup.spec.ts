import { test, expect } from "@playwright/test";
import { TEST_USER } from "./helpers";

test.describe("アカウント作成ページ（/signup）のテスト", () => {
  test.beforeEach(async ({ page }) => {
    // サインアップページへ遷移
    await page.goto("/signup");
  });

  test("サインアップページが正しく表示される", async ({ page }) => {
    // ページのタイトルが正しい
    await expect(page).toHaveTitle(/アカウント作成/);

    // カード内のタイトルが表示されている
    await expect(
      page.getByText("アカウント作成", { exact: true }),
    ).toBeVisible();
  });

  test("メールアドレス入力フィールドが存在する", async ({ page }) => {
    // メールアドレスラベルが表示されている
    const emailLabel = page.getByLabel("メールアドレス");
    await expect(emailLabel).toBeVisible();

    // 入力フィールドであることを確認
    await expect(emailLabel).toHaveAttribute("type", "email");
  });

  test("パスワード入力フィールドが存在する", async ({ page }) => {
    // パスワードラベルが表示されている
    const passwordLabel = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await expect(passwordLabel).toBeVisible();

    // 初期状態ではパスワードが隠れている
    await expect(passwordLabel).toHaveAttribute("type", "password");
  });

  test("パスワード確認入力フィールドが存在する", async ({ page }) => {
    // パスワード確認ラベルが表示されている
    const passwordConfirmLabel = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await expect(passwordConfirmLabel).toBeVisible();

    // 初期状態では確認用パスワードが隠れている
    await expect(passwordConfirmLabel).toHaveAttribute("type", "password");
  });

  test("アカウント作成ボタンが存在する", async ({ page }) => {
    // ボタンが表示されている
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await expect(createButton).toBeVisible();

    // ボタンが有効状態である
    await expect(createButton).toBeEnabled();
  });

  test("ログインへのリンクが表示されている", async ({ page }) => {
    // ログインリンクが表示されている
    const loginLink = page.getByRole("link", { name: "ログイン" });
    await expect(loginLink).toBeVisible();

    // 正しいURLにリンクしている
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("フォームに値を入力できる", async ({ page }) => {
    // メールアドレスを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill("test@example.com");
    await expect(emailField).toHaveValue("test@example.com");

    // パスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("TestPassword123");
    await expect(passwordField).toHaveValue("TestPassword123");

    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("TestPassword123");
    await expect(passwordConfirmField).toHaveValue("TestPassword123");
  });

  test("パスワード表示/非表示の切り替えができる", async ({ page }) => {
    // パスワードフィールドを取得
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });

    // 初期状態: type="password"
    await expect(passwordField).toHaveAttribute("type", "password");

    // 表示ボタンをクリック
    const visibilityToggle = page
      .locator(
        "button[aria-label*='display the password'], button[aria-label*='hide the password']",
      )
      .first();
    await visibilityToggle.click();

    // type="text"に変わっている
    await expect(passwordField).toHaveAttribute("type", "text");

    // もう一度クリックして戻す
    await visibilityToggle.click();

    // type="password"に戻っている
    await expect(passwordField).toHaveAttribute("type", "password");
  });

  test("パスワード確認フィールドも表示/非表示の切り替えができる", async ({
    page,
  }) => {
    // パスワード確認フィールドを取得
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });

    // 初期状態: type="password"
    await expect(passwordConfirmField).toHaveAttribute("type", "password");

    // 表示ボタンをクリック
    const visibilityToggles = page.locator(
      "button[aria-label*='display the password'], button[aria-label*='hide the password']",
    );
    await visibilityToggles.last().click();

    // type="text"に変わっている
    await expect(passwordConfirmField).toHaveAttribute("type", "text");

    // もう一度クリックして戻す
    await visibilityToggles.last().click();

    // type="password"に戻っている
    await expect(passwordConfirmField).toHaveAttribute("type", "password");
  });

  test("短すぎるパスワードでエラーが表示される", async ({ page }) => {
    // メールアドレスを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill("newuser@example.com");

    // 短いパスワードを入力（8文字未満）
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("Short1");

    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("Short1");

    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();

    // エラーメッセージが表示される
    const errorMessage = page.getByText(/パスワードは8文字以上/);
    await expect(errorMessage).toBeVisible();
  });

  test("数字が含まれていないパスワードでエラーが表示される", async ({
    page,
  }) => {
    // メールアドレスを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill("newuser@example.com");

    // 数字なしのパスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("OnlyLetters");

    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("OnlyLetters");

    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();

    // エラーメッセージが表示される
    const errorMessage = page.getByText(
      /パスワードは英字と数字の両方を含めてください/,
    );
    await expect(errorMessage).toBeVisible();
  });
  test("英字が含まれていないパスワードでエラーが表示される", async ({
    page,
  }) => {
    // メールアドレスを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill("newuser@example.com");

    // 数字なしのパスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("123456789");

    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("123456789");

    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();

    // エラーメッセージが表示される
    const errorMessage = page.getByText(
      /パスワードは英字と数字の両方を含めてください/,
    );
    await expect(errorMessage).toBeVisible();
  });

  test("パスワードが一致しないとエラーが表示される", async ({ page }) => {
    // メールアドレスを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill("newuser@example.com");

    // パスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("ValidPassword123");

    // 異なるパスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("DifferentPassword123");

    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();

    // エラーメッセージが表示される
    const errorMessage = page.getByText(/パスワードが一致しません/);
    await expect(errorMessage).toBeVisible();
  });

  test("無効なメールアドレスでエラーが表示される", async ({ page }) => {
    // 無効なメールを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill("invalid-email@123");

    // パスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("ValidPassword123");

    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("ValidPassword123");

    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();

    // エラーメッセージが表示される
    const errorMessage =
      page.getByText(/有効なメールアドレスを入力してください/);
    await expect(errorMessage).toBeVisible();
  });

  test("既に登録されているメールアドレスでエラーが表示される", async ({
    page,
  }) => {
    // テストユーザーのメールアドレスを入力（既に登録されている）
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill(TEST_USER.email);

    // パスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("NewPassword123");

    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("NewPassword123");

    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();

    // エラーメッセージが表示される
    const errorMessage = page.getByText(
      /このメールアドレスは既に登録されています。/,
    );
    await expect(errorMessage).toBeVisible();

    // メールアドレスが保持されている
    const email = await emailField.inputValue();
    expect(email).toBe(TEST_USER.email);
  });
});

test.describe("アカウント作成完了ページ（/signup/sent）のテスト", () => {
  test("クエリパラメータなしでアクセスした場合", async ({ page }) => {
    // クエリパラメータなしでアクセス
    await page.goto("/signup/sent");

    // ページのタイトルが正しい
    await expect(page).toHaveTitle(/認証メールを送信しました/);

    // 完了メッセージが表示されている
    const heading = page.getByRole("heading", {
      name: "認証メールを送信しました",
    });
    await expect(heading).toBeVisible();

    // 説明文が表示されている
    const description = page.getByText(/登録したメールアドレスに認証用/);
    await expect(description).toBeVisible();
  });

  test("メールアドレスがクエリパラメータで表示される", async ({ page }) => {
    // メールアドレスをクエリパラメータで指定してアクセス
    const testEmail = "test@example.com";
    await page.goto(`/signup/sent?email=${encodeURIComponent(testEmail)}`);

    // 指定されたメールアドレスが表示されている
    const emailDisplay = page.getByText(testEmail);
    await expect(emailDisplay).toBeVisible();

    // 説明文が表示されている
    const description = page.getByText(/に認証用のリンクを送りました/);
    await expect(description).toBeVisible();
  });

  test("ログイン画面へのリンクが表示されている", async ({ page }) => {
    await page.goto("/signup/sent");

    // ログインリンクが表示されている
    const loginLink = page.getByRole("link", { name: "ログイン画面へ" });
    await expect(loginLink).toBeVisible();

    // 正しいURLにリンクしている
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("迷惑メール警告メッセージが表示されている", async ({ page }) => {
    await page.goto("/signup/sent");

    // 迷惑メール警告が表示されている
    const warningMessage = page.getByText(/迷惑メール/);
    await expect(warningMessage).toBeVisible();
  });
});

test.describe("サインアップフロー全体のテスト", () => {
  test("有効な情報でアカウント作成フローが完了する", async ({
    page,
    request,
  }) => {
    // サインアップページへ遷移
    await page.goto("/signup");
    // 新規メールアドレスを共生成
    const uniqueEmail = `newuser${Date.now()}@example.com`;
    // メールアドレスを入力
    const emailField = page.getByLabel("メールアドレス");
    await emailField.fill(uniqueEmail);
    // パスワードを入力
    const passwordField = page.getByRole("textbox", {
      name: "パスワード",
      exact: true,
    });
    await passwordField.fill("NewPassword123");
    // パスワード確認を入力
    const passwordConfirmField = page.getByRole("textbox", {
      name: "パスワード(確認用)",
    });
    await passwordConfirmField.fill("NewPassword123");
    // アカウント作成ボタンをクリック
    const createButton = page.getByRole("button", {
      name: "アカウントを作成する",
    });
    await createButton.click();
    // 完了ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/signup\/sent/);
    // 完了メッセージが表示されている
    const successMessage = page.getByRole("heading", {
      name: "認証メールを送信しました",
    });
    await expect(successMessage).toBeVisible();
    // メールアドレスが表示されている
    const emailDisplay = page.getByText(uniqueEmail);
    await expect(emailDisplay).toBeVisible();

    // MailpitのAPIから最新のメールを取得（少し待機が必要な場合がある）
    // 2. メールが届くまでリトライしつつ、詳細を取得する
    let authenticatedURL = "";
    await expect(async () => {
      // まず一覧を取得
      const listRes = await request.get(
        "http://localhost:8025/api/v1/messages",
      );
      const listData = await listRes.json();

      // 対象のメールアドレス宛の最新メッセージを探す
      const latestMessage = listData.messages.find((m: any) =>
        m.To.some((to: any) => to.Address === uniqueEmail),
      );

      if (!latestMessage) {
        throw new Error("メールがまだ届いていません");
      }

      // IDを使ってメッセージ詳細を取得（ここなら全文が取れる）
      const detailRes = await request.get(
        `http://localhost:8025/api/v1/message/${latestMessage.ID}`,
      );
      const detailData = await detailRes.json();

      // HTML本文、またはText本文からURLを抽出
      // Auth.js (NextAuth) の場合は HTML 内の href を探すのが確実です
      const htmlContent = detailData.HTML;
      const urlMatch = htmlContent.match(/href="([^"]+)"/);

      if (!urlMatch) {
        throw new Error("メール本文内にリンクが見つかりません");
      }

      authenticatedURL = urlMatch[1];
    }).toPass({ timeout: 10000 }); // 最大10秒間リトライ

    // 4. そのリンクにアクセスしてログイン完了を確認
    await page.goto(authenticatedURL);
    await expect(page).toHaveURL("/login?verified=1");
  });
});
