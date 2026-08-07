import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TPMForge — Become a World-Class Technical Program Manager",
    template: "%s | TPMForge",
  },
  description:
    "The AI-powered career operating system for Technical Program Managers. Upload your resume, get your TPM readiness score, and follow a personalized roadmap to certification.",
  keywords: [
    "TPM",
    "Technical Program Manager",
    "TPM certification",
    "TPM interview prep",
    "program management",
    "AI career coach",
  ],
  openGraph: {
    title: "TPMForge — Become a World-Class Technical Program Manager",
    description:
      "Readiness score, personalized roadmap, AI coach, and certification — built on a real TPM competency graph.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
