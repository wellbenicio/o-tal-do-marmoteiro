import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Tal do Marmoteiro",
  description: "Plataforma de consultas oraculares e de tarot.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

