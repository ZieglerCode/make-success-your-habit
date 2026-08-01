import type {Metadata} from "next";
import {GlobalAiAssistant} from "@/components/global-ai-assistant";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make Success Your Habit | Heike Ziegler",
  description:
    "Premium-Transformationsraum für ambitionierte Unternehmerinnen, Coaches und Expertinnen. Erfolg nicht erzwingen, sondern verkörpern.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || "https://www.heike-ziegler.com"),
  openGraph: {
    title: "Make Success Your Habit | Heike Ziegler",
    description:
      "Premium Transformation Ecosystem for ambitious female entrepreneurs and experts focused on identity, clarity, and success as a natural habit.",
    images: ["/media/images/msyh-logo-512.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Make Success Your Habit | Heike Ziegler",
    description:
      "Premium Transformation Ecosystem for ambitious female entrepreneurs and experts focused on identity, clarity, and success as a natural habit.",
    images: ["/media/images/msyh-logo-512.png"],
  },
  icons: {
    icon: [
      {url: "/favicon.png", type: "image/png", sizes: "48x48"},
      {url: "/media/images/msyh-logo-192.png", type: "image/png", sizes: "192x192"},
    ],
    apple: [{url: "/media/images/msyh-logo-192.png", sizes: "192x192", type: "image/png"}],
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <GlobalAiAssistant />
      </body>
    </html>
  );
}
