import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Never let a production build resolve metadata against a loopback address: every
// canonical, og:image and JSON-LD @id derives from this, so localhost silently
// invalidates the whole page's machine-readable identity. Development still gets
// localhost, which is what it wants.
const METADATA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://simo-hue.github.io/CampFlow"
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE),
  title: "CampFlow | Gestione Campeggi Gratis Open Source",
  description: "La piattaforma all-in-one per ottimizzare prenotazioni, gestione ospiti e monitoraggio occupazione in modo TOTALMENTE GRATIS e OPEN SOURCE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <Toaster />
            <Header />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
