import type { Metadata } from "next";
import type { ReactNode } from "react";

import { FeedbackProvider } from "@/components/feedback-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "OpsPilot AI",
  description: "Initial product shell for operations workflow orchestration.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>
        <FeedbackProvider>{children}</FeedbackProvider>
      </body>
    </html>
  );
}
