import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "보험 상담 도우미 - 카드뉴스 검색",
  description: "고객 상담을 위한 실시간 보험 카드뉴스 검색 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="min-h-screen bg-background text-slate-900">
          {children}
        </main>
      </body>
    </html>
  );
}
