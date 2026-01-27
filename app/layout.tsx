import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "./components/headerClient";
import { createTheme, ThemeProvider } from "@mui/material";
import { lime, purple } from "@mui/material/colors";
import MuiThemeProvider from "./theme-provider";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Providers from "./providers";
import HeaderServer from "./components/headerServer";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo Today",
  description: "Create and manage today's todos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${noto.className} antialiased`}>
        <HeaderServer></HeaderServer>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
