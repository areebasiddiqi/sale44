import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { GlobalNav } from '@/components/layout/global-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sale44 - Autonomous Business Audit & Lead Generation',
  description: 'Audit businesses, uncover opportunities, and generate verified leads with AI-powered insights.',
  keywords: ['business audit', 'lead generation', 'sales automation', 'business intelligence'],
  authors: [{ name: 'Sale44 Team' }],
  openGraph: {
    title: 'Sale44 - Autonomous Business Audit & Lead Generation',
    description: 'Audit businesses, uncover opportunities, and generate verified leads with AI-powered insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sale44 - Autonomous Business Audit & Lead Generation',
    description: 'Audit businesses, uncover opportunities, and generate verified leads with AI-powered insights.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GlobalNav />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
