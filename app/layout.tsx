import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caprinos Staff Portal | Northampton",
  description: "Official Staff Clock-In System for Caprinos Pizza Northampton UK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
