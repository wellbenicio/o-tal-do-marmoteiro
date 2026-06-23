import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Tal do Marmoteiro",
  description:
    "Agende uma consulta online de cartomancia com Baralho Cigano, acolhimento e bom humor."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
