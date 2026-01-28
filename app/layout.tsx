// app/layout.tsx
import type { Metadata } from "next";
// 1. On importe la police
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ProgressionProvider } from "@/components/providers/ProgressionContext";
import { SoundProvider } from "@/components/providers/SoundContext";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});
// 2. On configure Space Grotesk (gardé pour les titres si besoin, ou remplacé)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"], 
  variable: "--font-space",
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
      <body className={`${ibmPlexMono.variable} ${spaceGrotesk.variable} antialiased`}>
        <SoundProvider>
          <ProgressionProvider>{children}</ProgressionProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
