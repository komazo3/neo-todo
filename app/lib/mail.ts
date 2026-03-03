import { createTransport } from "nodemailer";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";

type SendMailResult = {
  rejected?: string[];
  pending?: string[];
};

type EmailTheme = {
  brandColor?: string;
  buttonText?: string;
};

type SendVerificationRequestParams = {
  identifier: string;
  url: string;
  expires: Date;
  provider: NodemailerConfig;
  token: string;
  theme: EmailTheme;
  request: Request;
};

export async function sendVerificationRequest(
  params: SendVerificationRequestParams,
) {
  const { identifier, url, provider, theme } = params;

  if (!provider.server) {
    throw new Error(
      "EMAIL_SERVER is not configured (provider.server is missing).",
    );
  }
  if (!provider.from) {
    throw new Error("EMAIL_FROM is not configured (provider.from is missing).");
  }

  const host = new URL(url).host;
  const transport = createTransport(provider.server);

  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: subject({ host }),
    text: text({ url, host }),
    html: html({
      url,
      host,
      theme: theme as { brandColor?: string; buttonText?: string },
    }),
  });

  const rejected = (result as SendMailResult).rejected ?? [];
  const pending =
    "pending" in (result as object)
      ? ((result as SendMailResult).pending ?? [])
      : [];

  const failed = rejected.concat(pending).filter(Boolean);

  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

/** アカウント作成時のメールアドレス認証用メールを送信する */
export async function sendSignupVerificationEmail(
  to: string,
  verificationUrl: string,
): Promise<void> {
  const server = process.env.EMAIL_SERVER;
  const from = process.env.EMAIL_FROM;
  if (!server || !from) {
    throw new Error("EMAIL_SERVER または EMAIL_FROM が設定されていません。");
  }
  const host = new URL(verificationUrl).host;
  const transport = createTransport(server);

  const result = await transport.sendMail({
    to,
    from,
    subject: `【TODO Today】メールアドレスの認証 - ${host}`,
    text: signupVerificationText({ url: verificationUrl, host }),
    html: signupVerificationHtml({ url: verificationUrl, host }),
  });

  const rejected = (result as SendMailResult).rejected ?? [];
  const pending =
    "pending" in (result as object)
      ? ((result as SendMailResult).pending ?? [])
      : [];
  const failed = rejected.concat(pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`メールの送信に失敗しました: ${failed.join(", ")}`);
  }
}

function signupVerificationText(params: { url: string; host: string }) {
  const { url, host } = params;
  return [
    "TODO Today のアカウント作成ありがとうございます。",
    "",
    "以下のリンクをクリックして、メールアドレスを認証してください。",
    "",
    `認証URL: ${url}`,
    "",
    "心当たりがない場合は、このメールを無視してください。",
    `送信元: ${host}`,
    "",
  ].join("\n");
}

function signupVerificationHtml(params: { url: string; host: string }) {
  const { url, host } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");
  const color = {
    background: "#f8fafc",
    text: "#0f172a",
    muted: "#475569",
    card: "#ffffff",
    border: "#e2e8f0",
    brand: "#0f172a",
    buttonText: "#ffffff",
  };
  return `
<body style="margin:0; padding:0; background:${color.background};">
  <table width="100%" border="0" cellspacing="0" cellpadding="24" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background:${color.card}; border:1px solid ${color.border}; border-radius:16px; overflow:hidden;">
          <tr>
            <td style="padding:20px 24px; background:${color.card};">
              <div style="font-size:18px; font-weight:700; color:${color.text};">メールアドレスの認証</div>
              <div style="margin-top:8px; font-size:14px; color:${color.muted}; line-height:1.6;">
                以下のボタンをクリックして、アカウントを有効にしてください。
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 16px 24px 6px;">
              <a href="${url}" target="_blank"
                 style="display:inline-block; background:${color.brand}; color:${color.buttonText};
                        text-decoration:none; padding:12px 18px; border-radius:12px;
                        font-size:14px; font-weight:700;">
                認証する
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 24px 18px; font-size:12px; color:${color.muted}; line-height:1.6;">
              ボタンが押せない場合は、以下のURLをブラウザに貼り付けてください。<br/>
              <span style="word-break:break-all; color:${color.text};">${url}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 24px; border-top:1px solid ${color.border}; font-size:12px; color:${color.muted}; line-height:1.6;">
              このメールに心当たりがない場合は無視してください。<br/>
              リンクは一定時間で無効になります。
            </td>
          </tr>
        </table>
        <div style="max-width: 560px; margin-top:10px; font-size:11px; color:${color.muted};">
          © TODO Today / ${escapedHost}
        </div>
      </td>
    </tr>
  </table>
</body>
`;
}

function subject({ host }: { host: string }) {
  return `【TODO Today】ログインリンク（有効期限あり） - ${host}`;
}

function text({ url, host }: { url: string; host: string }) {
  return [
    "TODO Today にログインするためのリンクをお送りします。",
    "",
    `ログインURL: ${url}`,
    "",
    "心当たりがない場合は、このメールを無視してください。",
    `送信元: ${host}`,
    "",
  ].join("\n");
}

function html(params: {
  url: string;
  host: string;
  theme: { brandColor?: string; buttonText?: string };
}) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");
  const brandColor = theme.brandColor || "#0f172a";
  const buttonText = theme.buttonText || "#ffffff";

  const color = {
    background: "#f8fafc",
    text: "#0f172a",
    muted: "#475569",
    card: "#ffffff",
    border: "#e2e8f0",
    brand: brandColor,
    buttonText,
  };

  return `
<body style="margin:0; padding:0; background:${color.background};">
  <table width="100%" border="0" cellspacing="0" cellpadding="24" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background:${color.card}; border:1px solid ${color.border}; border-radius:16px; overflow:hidden;">
          <tr>
            <td style="padding:20px 24px; background:${color.card};">
              <div style="font-size:18px; font-weight:700; color:${color.text};">TODO Today へログイン</div>
              <div style="margin-top:8px; font-size:14px; color:${color.muted}; line-height:1.6;">
                <strong>${escapedHost}</strong> へのログインリンクです。下のボタンをクリックしてください。
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 16px 24px 6px;">
              <a href="${url}" target="_blank"
                 style="display:inline-block; background:${color.brand}; color:${color.buttonText};
                        text-decoration:none; padding:12px 18px; border-radius:12px;
                        font-size:14px; font-weight:700;">
                ログインする
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px 18px; font-size:12px; color:${color.muted}; line-height:1.6;">
              ボタンが押せない場合は、以下のURLをブラウザに貼り付けてください。<br/>
              <span style="word-break:break-all; color:${color.text};">${url}</span>
            </td>
          </tr>

          <tr>
            <td style="padding: 14px 24px; border-top:1px solid ${color.border}; font-size:12px; color:${color.muted}; line-height:1.6;">
              このメールに心当たりがない場合は無視してください。<br/>
              セキュリティのため、リンクは一定時間で無効になります。
            </td>
          </tr>
        </table>

        <div style="max-width: 560px; margin-top:10px; font-size:11px; color:${color.muted};">
          © TODO Today / ${escapedHost}
        </div>
      </td>
    </tr>
  </table>
</body>
`;
}
