import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HERALDO — Votre message, notre mission",
  description:
    "Plateforme premium de relations presse. Diffusez vos communiques, organisez des salles de presse virtuelles, et securisez vos fonds de couverture mediatique.",
  keywords: [
    "relations presse",
    "communiques",
    "AGORA",
    "FCM",
    "medias",
    "journalisme",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <body className="font-sans antialiased bg-ivory text-navy">
        {children}
      </body>
    </html>
  );
}
