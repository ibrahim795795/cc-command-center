import type { Metadata } from "next";
import "./globals.css";

import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "WalletOS",
  description: "Personal Command Center for Credit Cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        </head>
        <body className="bg-background text-foreground antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
