import type { Metadata } from "next";
import { Inter } from "next/font/google"; // On utilise une Google Font propre
import "./globals.css";
import { ProgressionProvider } from "@/components/providers/ProgressionContext";
import { SoundProvider } from "@/components/providers/SoundContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Être Jeune - Webdocumentaire",
  description: "Horizons Suspendus : Une exploration interactive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="w-full h-full">
      <body
        className={`${inter.className} w-full h-full m-0 p-0 overflow-hidden`}
      >
        <SoundProvider>
          <ProgressionProvider>{children}</ProgressionProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
