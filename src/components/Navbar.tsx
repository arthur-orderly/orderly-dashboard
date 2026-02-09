'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname === '/') return 'dashboard'
    if (pathname.startsWith('/earn')) return 'earn'
    if (pathname.startsWith('/vaults')) return 'earn'
    if (pathname.startsWith('/leaderboard')) return 'leaderboard'
    if (pathname.startsWith('/builders')) return 'builders'
    return 'dashboard'
  }
  
  const activeTab = getActiveTab()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-orderly-dark/80 backdrop-blur-xl border-b border-orderly-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orderly-purple to-orderly-cyan flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-semibold text-white">Orderly</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orderly-purple/20 text-orderly-purple font-medium">
              Dashboard
            </span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-orderly-card text-white'
                    : 'text-gray-400 hover:text-white hover:bg-orderly-card/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Trade Button removed */}
        </div>
      </div>
    </nav>
  )
}
