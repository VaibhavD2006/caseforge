import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CaseForge AI — Consulting Interview Practice',
  description:
    'AI-powered consulting interview practice with company-style mocks, rubric scoring, and weakness tracking.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} bg-background text-foreground font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
