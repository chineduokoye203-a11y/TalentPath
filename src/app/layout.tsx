import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "../../tokens/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentPath | Workforce Development",
  description:
    "Centralized workforce development platform for internal mobility, skills intelligence, and succession planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
