import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";

import { CursorKyano } from "@/components/interacoes/cursor";
import { CarrinhoProvider } from "@/components/loja/carrinho-provider";
import { getLoja } from "@/lib/catalogo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"] });

const loja = getLoja();

export const metadata: Metadata = {
  title: { default: loja.nome, template: `%s · ${loja.nome}` },
  description: loja.slogan,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <CarrinhoProvider>{children}</CarrinhoProvider>
        <CursorKyano />
      </body>
    </html>
  );
}
