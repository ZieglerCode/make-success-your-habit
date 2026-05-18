import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make Success Your Habit | Heike Ziegler",
  description:
    "Premium-Transformationsraum für ambitionierte Unternehmerinnen, Coaches und Expertinnen. Erfolg nicht erzwingen, sondern verkörpern.",
  metadataBase: new URL("https://make-success-your-habit.pages.dev"),
  openGraph: {
    title: "Make Success Your Habit | Heike Ziegler",
    description:
      "Für ambitionierte Unternehmerinnen, Coaches und Expertinnen, die Erfolg als neue innere Normalität verkörpern möchten.",
    images: ["/media/images/msyh-logo-512.png"],
    locale: "de_DE",
    type: "website",
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
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
