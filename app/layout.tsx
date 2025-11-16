import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "The World Bank - Global Financial Services",
    template: "%s | The World Bank"
  },
  description: "The World Bank provides global financial services and loan solutions to help fulfill your dreams. Fast, secure, and reliable banking services.",
  keywords: ["world bank", "financial services", "loans", "banking", "global finance", "loan application", "secure transactions"],
  authors: [{ name: "The World Bank" }],
  creator: "The World Bank",
  publisher: "The World Bank",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-world-bank-domain.com",
    title: "The World Bank - Global Financial Services",
    description: "The World Bank provides global financial services and loan solutions to help fulfill your dreams.",
    siteName: "The World Bank",
    images: [
      {
        url: "/The_World_Bank_logo.png",
        width: 1200,
        height: 630,
        alt: "The World Bank Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "The World Bank - Global Financial Services",
    description: "The World Bank provides global financial services and loan solutions to help fulfill your dreams.",
    images: ["/The_World_Bank_logo.png"],
    creator: "@TheWorldBank"
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png"
  },
  manifest: "/site.webmanifest"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}