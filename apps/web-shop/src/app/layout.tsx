import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goodz — 굿즈 쇼핑몰",
  description: "굿즈를 파는 이커머스 쇼핑몰",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
