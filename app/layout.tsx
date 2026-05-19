import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nguyên lý của sự phát triển | Chủ nghĩa duy vật biện chứng",
  description:
    "Không gian học tập tương tác về nguyên lý của sự phát triển trong Chương 2: Chủ nghĩa duy vật biện chứng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
