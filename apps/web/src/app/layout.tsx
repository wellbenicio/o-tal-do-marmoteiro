import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/components/portal/portal.css";
import "@/components/management/management.css";
import { DemoProvider } from "@/components/portal/DemoProvider";

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/poppins-medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/poppins-semibold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/poppins-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/inter-medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/inter-semibold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "O Tal do Marmoteiro",
  description:
    "Agende uma consulta online de cartomancia com Baralho Cigano, acolhimento e bom humor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${poppins.variable} ${inter.variable}`}>
        <DemoProvider>
          {children}
        </DemoProvider>
      </body>
    </html>
  );
}
