import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import '@xyflow/react/dist/style.css';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Flow Builder",
    template: "%s | Flow Builder",
  },
  description:
    "Visual workflow builder - design and manage flows with an intuitive drag-and-drop canvas.",
  keywords: ["workflow", "flow builder", "visual editor", "diagram"],
  authors: [{ name: "Your Name", url: siteUrl }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    title: "Flow Builder",
    description:
      "Visual workflow builder - design and manage flows with an intuitive drag-and-drop canvas.",
    siteName: "Flow Builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flow Builder",
    description:
      "Visual workflow builder - design and manage flows with an intuitive drag-and-drop canvas.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
