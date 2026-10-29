import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || "https://arova.io"),
  title: "AROVA — Business Intelligence & Lead Network",
  description:
    "Curated business lead intelligence platform under the Arenova ecosystem. Discover verified prospects in programming, video editing, digital marketing, website development, and business automation.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AROVA — Curated Business Prospects",
    description: "Subscription-based business lead platform under the Arenova ecosystem.",
    images: ["/metadata.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080505] text-[#F3F0E8] antialiased selection:bg-[#E84B2C] selection:text-[#F3F0E8] min-h-screen">
        {children}
      </body>
    </html>
  );
}
