import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BuildOrDieClerkProvider } from "@/providers/clerk-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { Navbar } from "@/components/features/navbar";
import { Footer } from "@/components/features/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "BuildOrDie",
  description: "Build it. Launch it. 4 days. Or get kicked.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BuildOrDieClerkProvider>
      <html lang="en" className="dark bg-bg-primary" suppressHydrationWarning>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans flex flex-col min-h-screen justify-between`}>
          <PostHogProvider>
            <div>
              <Navbar />
              {children}
            </div>
            <Footer />
          </PostHogProvider>
        </body>
      </html>
    </BuildOrDieClerkProvider>
  );
}
