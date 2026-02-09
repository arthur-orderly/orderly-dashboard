import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orderly Dashboard',
  description: 'The permissionless liquidity layer for Web3 trading',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-orderly-dark antialiased">
        {children}
      </body>
    </html>
  )
}
