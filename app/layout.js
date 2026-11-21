import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/supabase/server";

export const instant = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Keep Dynamic",
  description: "App lavet i et skole eksamens projekt",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  const defaultNoteColor =
    user?.user_metadata?.default_note_color_value ||
    "var(--colors-sticky-notes-standard)";

  return (
    <html lang="da" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ "--baggrund": defaultNoteColor }}>{children}</body>
    </html>
  );
}
