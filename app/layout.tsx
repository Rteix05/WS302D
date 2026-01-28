// app/layout.tsx
import type { Metadata } from "next";
// 1. On importe la police
import { Inter, Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import { ProgressionProvider } from "@/components/providers/ProgressionContext";

const inter = Inter({ subsets: ["latin"] });
// 2. On configure Space Grotesk
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["400", "700"], // On charge normal et gras
  variable: "--font-space", // On crée une variable CSS
});

export const metadata: Metadata = {
  title: "Horizons Suspendus",
  description: "Webdocumentaire interactif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${spaceGrotesk.variable}`}>
        <ProgressionProvider>
          {children}
        </ProgressionProvider>
      </body>
    </html>
  );
}